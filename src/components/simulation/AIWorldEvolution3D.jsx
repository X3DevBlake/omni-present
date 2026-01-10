import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

function EvolvingWorld() {
  const groupRef = useRef();
  const [biomes, setBiomes] = useState([]);

  useEffect(() => {
    const newBiomes = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 2 + Math.random();
      newBiomes.push({
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius],
        type: ['forest', 'desert', 'ocean', 'mountain'][Math.floor(Math.random() * 4)]
      });
    }
    setBiomes(newBiomes);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const biomeColors = {
    forest: '#10b981',
    desert: '#f59e0b',
    ocean: '#3b82f6',
    mountain: '#6b7280'
  };

  return (
    <group ref={groupRef}>
      {biomes.map((biome, i) => (
        <Sphere key={i} position={biome.position} args={[0.3, 16, 16]}>
          <meshStandardMaterial
            color={biomeColors[biome.type]}
            emissive={biomeColors[biome.type]}
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
}

export default function AIWorldEvolution3D() {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <EvolvingWorld />
        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
}