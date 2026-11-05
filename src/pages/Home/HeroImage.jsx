import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useHasVisited } from "../../hooks/useHasVisited";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/* ───────────── Configuración ───────────── */
const RADIUS = 1.55;
const SURFACE = 5000;
const BAND = 0;
const HALO = 450;
const TOTAL = SURFACE + BAND + HALO;

const LIGHT = new THREE.Vector3(0.9, -0.2, 0.15).normalize();
const EMIT_POOL = 600;

// Paleta exacta. Se convierte a RGB sin gestión de color para que el shader
// muestre exactamente estos valores.
const hex = (h) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const PALETTE = [
  { c: hex("#00BFFF"), w: 0.30 },
  { c: hex("#793DFF"), w: 0.28 },
  { c: hex("#FF20D9"), w: 0.28 },
  { c: hex("#E8F7FF"), w: 0.14 },
];
const pickColor = () => {
  let r = Math.random();
  for (const p of PALETTE) if ((r -= p.w) <= 0) return p.c;
  return PALETTE[0].c;
};
// Color por zona: cada partícula conserva UN color puro de la paleta, pero la
// probabilidad cambia según su orientación respecto a la luz (t: 0 sombra → 1 luz).
// Así aparecen regiones cromáticas como en la referencia sin degradados.
const pickColorLit = (t) => {
  const wWhite = 0.04 + 0.5 * t * t;
  const r = Math.random();
  if (r < wWhite) return PALETTE[3].c;
  const wCyan = 0.25 + 0.75 * t;
  const wPink = 0.25 + 0.75 * (1 - t);
  const wPurple = 0.55;
  let u = Math.random() * (wCyan + wPink + wPurple);
  if ((u -= wCyan) <= 0) return PALETTE[0].c;
  if ((u -= wPurple) <= 0) return PALETTE[1].c;
  return PALETTE[2].c;
};
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// Ruido suave de baja frecuencia para variar la densidad sobre la esfera
const densityNoise = (x, y, z) =>
  0.5 +
  0.5 *
    Math.sin(x * 3.1 + 1.3) *
    Math.sin(y * 2.7 + 2.1) *
    Math.sin(z * 3.4 + 0.4) +
  0.25 * Math.sin(x * 7.3 + y * 5.1 + z * 6.2);

/* ───────────── Shaders ───────────── */
const sphereVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aLum;
  attribute float aKind;
  attribute vec3 aColor;
  uniform float uScale;
  uniform float uTime;
  uniform float uSize;
  uniform float uMin;
  uniform vec3 uLight;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;

  const vec3 PINK   = vec3(1.0, 0.125, 0.851);   // #FF20D9
  const vec3 VIOLET = vec3(0.475, 0.239, 1.0);   // #793DFF
  const vec3 CYAN   = vec3(0.0, 0.749, 1.0);     // #00BFFF
  const vec3 WHITE  = vec3(0.91, 0.97, 1.0);     // #E8F7FF

  void main() {
    vec3 p = position;
    p *= 1.0 + 0.012 * sin(uTime * 0.45 + dot(position, vec3(1.7, 2.3, 1.1)));
    p += 0.010 * vec3(
      sin(uTime * 0.60 + aPhase * 6.283),
      sin(uTime * 0.50 + aPhase * 17.0),
      cos(uTime * 0.55 + aPhase * 29.0)
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 n = normalize(normalMatrix * normalize(p));

    // Zona de luz en espacio mundo (no gira con el grupo)
    vec3 wn = normalize(mat3(modelMatrix) * normalize(p));
    float t = clamp(0.5 + 0.5 * dot(wn, uLight), 0.0, 1.0);

    // Pesos por zona
    float wP = 1.0 - smoothstep(0.10, 0.55, t);
    float wC = smoothstep(0.45, 0.90, t);
    float wV = 0.35;
    float wWhite = 0.06 + 0.45 * t * t;

    float h1 = fract(aPhase * 57.31 + 0.37);
    float h2 = fract(aPhase * 131.7 + 0.11);
    vec3 col;
    if (h1 < wWhite) {
      col = WHITE;
    } else {
      float u = h2 * (wP + wV + wC);
      col = (u < wP) ? PINK : ((u < wP + wV) ? VIOLET : CYAN);
    }

    float rim = pow(1.0 - abs(n.z), 2.0);
    float twinkle = 0.78 + 0.22 * sin(uTime * 1.4 + aPhase * 6.283);

    float shellA = aLum *
      (0.35 + 1.0 * rim + 0.10 * max(n.z, 0.0)) *
      (n.z < 0.0 ? 0.7 : 1.0);
    float bandA = aLum * 0.95;
    float haloA = aLum * 0.65;
    float a = aKind < 0.5 ? shellA : (aKind < 1.5 ? bandA : haloA);

    vColor = col * (1.0 + rim * 0.6);   // borde más intenso
    vShape = aPhase;
    vAlpha = clamp(a * twinkle, 0.0, 1.0);
    gl_PointSize = max(aSize * uSize * (1.0 + (aKind < 0.5 ? rim * 0.5 : 0.0)) * uScale / -mv.z, uMin);
    gl_Position = projectionMatrix * mv;
  }
`;

const emitVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uScale;
  uniform float uSize;
  uniform float uMin;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vAlpha = aAlpha;
    vShape = aPhase;
    gl_PointSize = max(aSize * uSize * uScale / -mv.z, uMin);
    gl_Position = projectionMatrix * mv;
  }
`;

// Punto ligeramente irregular (contorno lobulado distinto por partícula)

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);

    if (r > 0.5) discard;

    // Núcleo brillante
    float core = exp(-r * 32.0);

    // Resplandor cercano
    float innerGlow = exp(-r * 13.0);

    // Halo exterior suave
    float outerGlow = exp(-r * 6.0);

    // Centro blanco y bordes con el color de la partícula
    float alpha = (
      core * 0.95 +
      innerGlow * 0.55 +
      outerGlow * 0.20
    ) * vAlpha;

    vec3 color = vColor * (
      1.0 +
      core * 1.8 +
      innerGlow * 0.65
    );

    gl_FragColor = vec4(
      color,
      clamp(alpha, 0.0, 1.0)
    );
  }
`;

const makeMaterial = (vertexShader) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: pointFragment,
    uniforms: {
      uScale: { value: 400 },
      uTime: { value: 0 },
      uSize: { value: 1.8 },        // antes 1.5
      uMin: { value: 1.2 },
      uLight: { value: LIGHT.clone() },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });


  function CoreGlow() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uLight: { value: LIGHT.clone() } },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          varying vec3 vW;
          void main() {
            vN = normalize(normalMatrix * normal);
            vW = normalize(normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uLight;
          varying vec3 vN;
          varying vec3 vW;
          void main() {
            float f = pow(1.0 - abs(vN.z), 2.4);
            float t = clamp(0.5 + 0.5 * dot(vW, uLight), 0.0, 1.0);
            vec3 pink = vec3(1.0, 0.125, 0.851);
            vec3 violet = vec3(0.475, 0.239, 1.0);
            vec3 cyan = vec3(0.0, 0.749, 1.0);
            vec3 edge = t < 0.5
              ? mix(pink, violet, smoothstep(0.0, 0.5, t))
              : mix(violet, cyan, smoothstep(0.5, 1.0, t));
            vec3 core = vec3(0.035, 0.02, 0.15);       // índigo oscuro
            vec3 color = core * (1.0 - f) + edge * f * 1.1;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  return (
    <mesh material={material}>
      <sphereGeometry args={[RADIUS * 0.97, 64, 64]} />
    </mesh>
  );
}

/* ───────────── Esfera + emisión ───────────── */
function ParticleSphere({ io }) {
  const groupRef = useRef();

  const data = useMemo(() => {
    const base = new Float32Array(TOTAL * 3);
    const pos = new Float32Array(TOTAL * 3);
    const off = new Float32Array(TOTAL * 3);
    const col = new Float32Array(TOTAL * 3);
    const size = new Float32Array(TOTAL);
    const phase = new Float32Array(TOTAL);
    const lum = new Float32Array(TOTAL);
    const kind = new Float32Array(TOTAL);
    const bandR = new Float32Array(BAND);
    const bandA = new Float32Array(BAND);
    const bandY = new Float32Array(BAND);
    const bandPh = new Float32Array(BAND);

    const finish = (i, s, l) => {
      const x = base[i * 3],
        y = base[i * 3 + 1],
        z = base[i * 3 + 2];
      const m = Math.hypot(x, y, z) || 1;
      const t = 0.5 + 0.5 * ((x * LIGHT.x + y * LIGHT.y + z * LIGHT.z) / m);
      const c = pickColorLit(t);
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      size[i] = s;
      lum[i] = l;
      phase[i] = Math.random();
    };

    // Casquete: direcciones aleatorias aceptadas según ruido → densidad irregular
    const dir = new THREE.Vector3();
    for (let i = 0; i < SURFACE; i++) {
      let guard = 0;
      do {
        dir.set(gauss(), gauss(), gauss());
        // gauss() no es uniforme en la esfera, se normaliza igualmente tras añadir ruido
        dir.x += (Math.random() - 0.5) * 0.8;
        dir.y += (Math.random() - 0.5) * 0.8;
        dir.z += (Math.random() - 0.5) * 0.8;
        dir.normalize();
        guard++;
      } while (
        Math.random() >
          0.35 + 0.65 * Math.min(densityNoise(dir.x, dir.y, dir.z), 1) &&
        guard < 12
      );

      const roll = Math.random();
      let rad, s;
      if (roll < 0.035) {
        // Destellos grandes y poco frecuentes
        rad = RADIUS * (1.01 + Math.random() * 0.035);
        s = 0.012 + Math.random() * 0.008;
      } else if (roll < 0.94) {
        // Capa principal de partículas
        rad = RADIUS * (0.99 + gauss() * 0.008);
        s = 0.006 + Math.random() * 0.006;
      } else {
        // Partículas interiores para dar profundidad
        rad = RADIUS * (0.84 + Math.random() * 0.13);
        s = 0.005 + Math.random() * 0.005;
      }
      base[i * 3] = dir.x * rad;
      base[i * 3 + 1] = dir.y * rad;
      base[i * 3 + 2] = dir.z * rad;
      finish(i, s, 0.75 + Math.random() * 0.25);
    }

    // Losa horizontal central: volumen denso con borde superior definido,
    // como en la referencia. Orbita con rotación diferencial.
    for (let j = 0; j < BAND; j++) {
      const i = SURFACE + j;
      const y = (Math.random() * 2 - 1) * 0.42 * RADIUS + gauss() * 0.03; // borde algo suave
      const rMax = Math.sqrt(Math.max(RADIUS * RADIUS * 0.92 - y * y, 0.01));
      bandR[j] = rMax * Math.sqrt(Math.random()); // reparto uniforme en el disco
      bandA[j] = Math.random() * Math.PI * 2;
      bandY[j] = y;
      bandPh[j] = Math.random() * 6.283;
      kind[i] = 1;
      base[i * 3] = Math.cos(bandA[j]) * bandR[j];
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = Math.sin(bandA[j]) * bandR[j];
      finish(i, 0.008 + Math.random() * 0.009, 0.7 + Math.random() * 0.3);
    }

    // Halo exterior: nube muy tenue y dispersa fuera de la esfera
    for (let j = 0; j < HALO; j++) {
      const i = SURFACE + BAND + j;
      const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize();
      const rad = RADIUS * (1.07 + Math.pow(Math.random(), 1.5) * 0.55);
      base[i * 3] = v.x * rad;
      base[i * 3 + 1] = v.y * rad;
      base[i * 3 + 2] = v.z * rad;
      kind[i] = 2;
      finish(i, 0.006 + Math.random() * 0.005, 0.2 + Math.random() * 0.3);
    }

    pos.set(base);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geometry.setAttribute("aLum", new THREE.BufferAttribute(lum, 1));
    geometry.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));

    return {
      base,
      pos,
      off,
      col,
      geometry,
      material: makeMaterial(sphereVertex),
      bandR,
      bandA,
      bandY,
      bandPh,
    };
  }, []);

  // Pool de partículas emitidas
  const emit = useMemo(() => {
    const pos = new Float32Array(EMIT_POOL * 3);
    const vel = new Float32Array(EMIT_POOL * 3);
    const col = new Float32Array(EMIT_POOL * 3);
    const aSize = new Float32Array(EMIT_POOL);
    const aAlpha = new Float32Array(EMIT_POOL);
    const aPhase = new Float32Array(EMIT_POOL);
    const size0 = new Float32Array(EMIT_POOL);
    const alpha0 = new Float32Array(EMIT_POOL);
    const age = new Float32Array(EMIT_POOL).fill(1);
    const life = new Float32Array(EMIT_POOL).fill(1);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(aSize, 1).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(aAlpha, 1).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));

    return {
      pos,
      vel,
      col,
      aSize,
      aAlpha,
      aPhase,
      size0,
      alpha0,
      age,
      life,
      geometry,
      material: makeMaterial(emitVertex),
      cursor: 0,
      acc: 0,
    };
  }, []);

  const tmp = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      inv: new THREE.Matrix4(),
      o: new THREE.Vector3(),
      d: new THREE.Vector3(),
      v: new THREE.Vector3(),
      n: new THREE.Vector3(),
      axis: new THREE.Vector3(),
      dq: new THREE.Quaternion(),
      ndc: new THREE.Vector2(),
      // Velocidad angular en espacio mundo (rad/s), vector completo → sin gimbal lock
      omega: new THREE.Vector3(0.03, 0.12, 0),
      idle: new THREE.Vector3(0.035, 0.11, 0.01),
      strength: 0,
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const reduce = io.reducedMotion;
    const { omega, axis, dq } = tmp;

    /* 1. Rotación libre 360° con quaternion + inercia */
    if (io.dragging) {
      const len = Math.hypot(io.dx, io.dy);
      if (len > 0) {
        // Eje perpendicular al arrastre en el plano de la pantalla (trackball)
        axis.set(io.dy, io.dx, 0).normalize();
        const angle = len * 0.007;
        dq.setFromAxisAngle(axis, angle);
        g.quaternion.premultiply(dq);
        omega.lerp(axis.multiplyScalar(angle / dt), 0.35);
      } else {
        omega.multiplyScalar(Math.exp(-8 * dt)); // si se mantiene quieto, frena
      }
      io.dx = 0;
      io.dy = 0;
    } else {
      // Desaceleración progresiva hacia la rotación autónoma lenta
      const k = Math.exp(-1.5 * dt);
      const target = reduce ? tmp.v.set(0, 0, 0) : tmp.idle;
      omega.x = target.x + (omega.x - target.x) * k;
      omega.y = target.y + (omega.y - target.y) * k;
      omega.z = target.z + (omega.z - target.z) * k;
      const w = omega.length();
      if (w > 1e-5) {
        axis.copy(omega).divideScalar(w);
        dq.setFromAxisAngle(axis, w * dt);
        g.quaternion.premultiply(dq);
      }
    }
    g.quaternion.normalize();
    g.updateMatrixWorld();

    /* 2. Repulsión del cursor (rayo del cursor llevado al espacio local) */
    tmp.strength = THREE.MathUtils.lerp(
      tmp.strength,
      io.inside && !io.dragging ? 1 : 0,
      0.1,
    );
    const active = tmp.strength > 0.01;
    const R = 0.5;
    const R2 = R * R;
    let tMax = 0;
    if (active) {
      tmp.ndc.set(io.nx, io.ny);
      tmp.raycaster.setFromCamera(tmp.ndc, state.camera);
      tmp.inv.copy(g.matrixWorld).invert();
      tmp.o.copy(tmp.raycaster.ray.origin).applyMatrix4(tmp.inv);
      tmp.d.copy(tmp.raycaster.ray.direction).transformDirection(tmp.inv);
      tMax = -tmp.o.dot(tmp.d) + 0.2; // solo la mitad frontal
    }
    const { o, d } = tmp;
    const { base, pos, off, bandR, bandA, bandY, bandPh } = data;
    const kIn = 1 - Math.exp(-dt * 12);
    const kOut = 1 - Math.exp(-dt * 3.5);

    for (let i = 0; i < TOTAL; i++) {
      const k = i * 3;

      if (i >= SURFACE && i < SURFACE + BAND) {
        const j = i - SURFACE;
        bandA[j] += (0.5 / (0.35 + bandR[j])) * dt * (reduce ? 0 : 1);
        base[k] = Math.cos(bandA[j]) * bandR[j];
        base[k + 1] =
          bandY[j] + Math.sin(bandA[j] * 3 + bandPh[j] + time * 0.7) * 0.02;
        base[k + 2] = Math.sin(bandA[j]) * bandR[j];
      }

      let tx = 0,
        ty = 0,
        tz = 0;
      if (active) {
        const px = base[k] - o.x,
          py = base[k + 1] - o.y,
          pz = base[k + 2] - o.z;
        const t = px * d.x + py * d.y + pz * d.z;
        if (t < tMax) {
          const cx = px - d.x * t,
            cy = py - d.y * t,
            cz = pz - d.z * t;
          const dist2 = cx * cx + cy * cy + cz * cz;
          if (dist2 < R2) {
            const dist = Math.sqrt(dist2) + 1e-4;
            const f = Math.pow(1 - dist / R, 2) * 0.3 * tmp.strength; // deformación contenida
            tx = (cx / dist) * f;
            ty = (cy / dist) * f;
            tz = (cz / dist) * f;
          }
        }
      }
      const kk = tx !== 0 || ty !== 0 || tz !== 0 ? kIn : kOut;
      off[k] += (tx - off[k]) * kk;
      off[k + 1] += (ty - off[k + 1]) * kk;
      off[k + 2] += (tz - off[k + 2]) * kk;

      pos[k] = base[k] + off[k];
      pos[k + 1] = base[k + 1] + off[k + 1];
      pos[k + 2] = base[k + 2] + off[k + 2];
    }
    data.geometry.attributes.position.needsUpdate = true;

    /* 3. Emisión según la velocidad angular real */
    const speed = omega.length();
    const intensity = reduce
      ? 0
      : THREE.MathUtils.clamp((speed - 0.6) / 5, 0, 1);
    emit.acc += intensity * 380 * dt;
    while (emit.acc >= 1) {
      emit.acc -= 1;
      const e = emit.cursor;
      emit.cursor = (emit.cursor + 1) % EMIT_POOL;
      const s = Math.floor(Math.random() * SURFACE) * 3;
      tmp.v.set(pos[s], pos[s + 1], pos[s + 2]);
      g.localToWorld(tmp.v);
      tmp.n.copy(tmp.v).normalize();

      // Velocidad tangencial = ω × r, más empuje radial corto y ruido
      const out = 0.1 + Math.random() * Math.random() * 0.8;
      const tx = omega.y * tmp.v.z - omega.z * tmp.v.y;
      const ty = omega.z * tmp.v.x - omega.x * tmp.v.z;
      const tz = omega.x * tmp.v.y - omega.y * tmp.v.x;
      const e3 = e * 3;
      emit.pos[e3] = tmp.v.x;
      emit.pos[e3 + 1] = tmp.v.y;
      emit.pos[e3 + 2] = tmp.v.z;
      emit.vel[e3] = tmp.n.x * out + tx * 0.5 + gauss() * 0.15;
      emit.vel[e3 + 1] = tmp.n.y * out + ty * 0.5 + gauss() * 0.15;
      emit.vel[e3 + 2] = tmp.n.z * out + tz * 0.5 + gauss() * 0.15;

      const c = pickColor();
      emit.col[e3] = c[0];
      emit.col[e3 + 1] = c[1];
      emit.col[e3 + 2] = c[2];
      emit.aPhase[e] = Math.random();
      emit.size0[e] = 0.008 + Math.random() * 0.014;
      emit.alpha0[e] = 0.35 + Math.random() * 0.55;
      emit.life[e] = 0.6 + Math.random() * 1.2; // trayectorias cortas
      emit.age[e] = 0;
    }

    const damp = Math.exp(-1.6 * dt);
    for (let e = 0; e < EMIT_POOL; e++) {
      if (emit.age[e] >= emit.life[e]) {
        emit.aAlpha[e] = 0;
        continue;
      }
      emit.age[e] += dt;
      const e3 = e * 3;
      // Curvatura orgánica: pequeña deriva sinusoidal
      const w = Math.sin(time * 3 + e) * 0.15 * dt;
      emit.pos[e3] += emit.vel[e3] * dt + w;
      emit.pos[e3 + 1] += emit.vel[e3 + 1] * dt;
      emit.pos[e3 + 2] += emit.vel[e3 + 2] * dt - w;
      emit.vel[e3] *= damp;
      emit.vel[e3 + 1] *= damp;
      emit.vel[e3 + 2] *= damp;
      const k = Math.min(emit.age[e] / emit.life[e], 1);
      const fadeIn = k < 0.08 ? k / 0.08 : 1;
      emit.aAlpha[e] = emit.alpha0[e] * Math.pow(1 - k, 1.6) * fadeIn;
      emit.aSize[e] = emit.size0[e] * (1 - 0.4 * k);
    }
    emit.geometry.attributes.position.needsUpdate = true;
    emit.geometry.attributes.aAlpha.needsUpdate = true;
    emit.geometry.attributes.aSize.needsUpdate = true;

    /* 4. Uniforms */
    const scale =
      (state.size.height * state.gl.getPixelRatio()) /
      (2 * Math.tan((45 * Math.PI) / 360));
    data.material.uniforms.uScale.value = scale;
    data.material.uniforms.uTime.value = time;
    emit.material.uniforms.uScale.value = scale;
    const minPx = 1.2 * state.gl.getPixelRatio();
    data.material.uniforms.uMin.value = minPx;
    emit.material.uniforms.uMin.value = minPx;
  });

  return (
    <>
      <group ref={groupRef}>
        <points
          geometry={data.geometry}
          material={data.material}
          frustumCulled={false}
        />
      </group>
      {/* Las partículas emitidas viven en espacio mundo: no rotan con la esfera */}
      <points
        geometry={emit.geometry}
        material={emit.material}
        frustumCulled={false}
      />
    </>
  );
}

/* ───────────── Tarjeta Hero ───────────── */
function HeroImage() {
  const hasVisited = useHasVisited("home");
  const words = ["Code", "Build", "Improve", "—"];
  const [isDragging, setIsDragging] = useState(false);

  // Estado de interacción compartido con el canvas (sin re-renders)
  const io = useRef({
    nx: 0,
    ny: 0,
    inside: false,
    dragging: false,
    dx: 0,
    dy: 0,
    lastX: 0,
    lastY: 0,
    reducedMotion:
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  }).current;

  const updateNdc = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    io.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    io.ny = -((e.clientY - r.top) / r.height) * 2 + 1;
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateNdc(e);
    io.dragging = true; // permite iniciar un giro aun con inercia activa
    io.lastX = e.clientX;
    io.lastY = e.clientY;
    setIsDragging(true);
  };
  const onPointerMove = (e) => {
    updateNdc(e);
    io.inside = true;
    if (io.dragging) {
      io.dx += e.clientX - io.lastX;
      io.dy += e.clientY - io.lastY;
      io.lastX = e.clientX;
      io.lastY = e.clientY;
    }
  };
  const endDrag = (e) => {
    io.dragging = false;
    if (e.pointerType !== "mouse") io.inside = false; // en táctil no hay hover
    setIsDragging(false);
  };

  return (

    <motion.article
      className="hero-image-card"
      initial={hasVisited ? false : { opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
    >
      <div className="hero-image-content">
        <div className="hero-image-icon">&lt;/&gt;</div>

        

        <div className="hero-code-text">
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={hasVisited ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        className={`hero-planet-container ${isDragging ? "is-grabbing" : ""}`}
        initial={hasVisited ? false : { opacity: 0, x: 30, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          if (!io.dragging) io.inside = false;
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ParticleSphere io={io} />

          <EffectComposer>
            <Bloom
              intensity={1.15}
              luminanceThreshold={0.12}
              luminanceSmoothing={0.25}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </motion.div>
    </motion.article>
  );
}

export default HeroImage;
