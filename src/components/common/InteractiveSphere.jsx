import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function SphereMesh({ accent }) {
  const meshRef = useRef();

  // Colores dinámicos basados en el acento del proyecto (purple, cyan, emerald)
  const colors = {
    purple: '#a855f7',
    cyan: '#06b6d4',
    emerald: '#10b981',
  };
  const sphereColor = colors[accent] || '#a855f7';

  useFrame((state) => {
    const { x, y } = state.pointer;
    // Reacción fluida al movimiento del mouse dentro del canvas
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, y * 0.6, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.6, 0.1);
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <meshStandardMaterial 
        color={sphereColor} 
        wireframe={true} 
        roughness={0.2} 
        metalness={0.8} 
      />
    </mesh>
  );
}

export default function InteractiveSphere({ accent }) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <SphereMesh accent={accent} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}