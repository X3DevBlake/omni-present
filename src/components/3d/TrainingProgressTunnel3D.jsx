import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Torus } from '@react-three/drei';

function TunnelRing({ position, progress }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  const color = progress > 0.7 ? '#10b981' : progress > 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <Torus ref={meshRef} position={position} args={[1, 0.1, 16, 100]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </Torus>
  );
}

export default function TrainingProgressTunnel3D() {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {[...Array(10)].map((_, i) => (
          <TunnelRing
            key={i}
            position={[0, 0, -i * 2]}
            progress={i / 10}
          />
        ))}

        <OrbitControls enableZoom />
        <fog attach="fog" args={['#000000', 5, 20]} />
      </Canvas>
    </div>
  );
}