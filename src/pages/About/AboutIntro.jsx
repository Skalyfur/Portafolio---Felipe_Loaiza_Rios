import { useEffect, useRef } from "react";
import { Code, Database, Cloud, Terminal } from "lucide-react";


function AboutIntro() {
  const canvasRef = useRef(null);

  const highlights = [
    {
      icon: <Code size={20} />,
      title: "Backend Developer",
      desc: "Django · Python · APIs",
    },
    {
      icon: <Database size={20} />,
      title: "Databases",
      desc: "PostgreSQL · MySQL",
    },
    {
      icon: <Cloud size={20} />,
      title: "Tools & Cloud",
      desc: "Docker · Git · Linux",
    },
    {
      icon: <Terminal size={20} />,
      title: "Always learning",
      desc: "New tech · Better code",
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let animationId;
    let particles = [];

    const mouse = { x: -1000, y: -1000 };
    const colors = [185, 215, 265, 300];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Concentramos las partículas en la zona superior de la tarjeta.
      const count = Math.min(
        125,
        Math.max(45, Math.floor((width * height) / 4800))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.72,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
        hue: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();

      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const onPointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      const maxDistance = 105;
      const mouseRadius = 115;
      const activeHeight = height * 0.76;

      // Partículas y movimiento.
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > activeHeight) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        // El cursor repele suavemente las partículas.
        if (distance < mouseRadius && distance > 0) {
          const force = (1 - distance / mouseRadius) * 1.1;

          p.x += (dx / distance) * force;
          p.y += (dy / distance) * force;
        }
      }

      // Conexiones entre nodos cercanos.
      ctx.lineWidth = 0.65;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);

          if (distance >= maxDistance) continue;

          const opacity = (1 - distance / maxDistance) * 0.38;
          const hue = (a.hue + b.hue) / 2;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${opacity})`;
          ctx.stroke();
        }
      }

      // Núcleo y halo neón de cada partícula.
      for (const p of particles) {
        const pulse =
          0.65 + 0.35 * Math.sin(time * 0.0015 + p.phase);

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        const boosted = distance < 120 ? 1.6 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${
          0.08 * pulse * boosted
        })`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 78%, ${
          pulse * 0.9
        })`;

        ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
        ctx.shadowBlur = 9 * boosted;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="aboutCard mainIntroCard">
      {/* Red de partículas interactiva */}
      <canvas
        ref={canvasRef}
        className="introParticles"
        aria-hidden="true"
      />

      {/* Contenido superior */}
      <div className="introContent">
        <div className="sectionBadge">
          <span className="badgeLine" /> ABOUT
        </div>

        <h1 className="introTitle">
          Tech <br />
          <span className="gradientText">Enthusiast</span>
        </h1>

        <p className="introDescription">
          I'm a backend developer focused on building scalable and efficient web
          applications. I enjoy solving problems, learning new technologies and
          improving my skills every day.
        </p>
      </div>

      {/* Grilla inferior */}
      <div className="highlightsGrid">
        {highlights.map((item, index) => (
          <div key={index} className="highlightItem">
            <div className="highlightIcon">{item.icon}</div>
            <div>
              <h4 className="highlightTitle">{item.title}</h4>
              <p className="highlightDesc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutIntro;
