import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function MemoryNode({ position, size, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[size, 16, 16]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Sphere>
  );
}

export default function Memory3DNetwork() {
  const memories = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 20; i++) {
      const theta = (i / 20) * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      nodes.push({
        position: [
          Math.cos(theta) * radius,
          (Math.random() - 0.5) * 3,
          Math.sin(theta) * radius
        ],
        size: 0.1 + Math.random() * 0.2,
        color: ['#00f5ff', '#a855f7', '#10b981'][Math.floor(Math.random() * 3)]
      });
    }
    return nodes;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        if (Math.random() > 0.8) {
          lines.push([memories[i].position, memories[j].position]);
        }
      }
    }
    return lines;
  }, [memories]);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#a855f7" />

        {connections.map((conn, i) => (
          <Line
            key={i}
            points={conn}
            color="#00f5ff"
            lineWidth={1}
            opacity={0.2}
            transparent
          />
        ))}

        {memories.map((memory, i) => (
          <MemoryNode key={i} {...memory} />
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={1} />
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  );
}