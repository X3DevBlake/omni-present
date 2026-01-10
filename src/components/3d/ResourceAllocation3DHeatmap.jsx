import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

function ServerRack({ position, utilization }) {
  const color = utilization > 80 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#10b981';
  const height = 0.5 + (utilization / 100) * 2;

  return (
    <Box position={[position[0], height / 2, position[1]]} args={[0.4, height, 0.4]}>
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5}
      />
    </Box>
  );
}

export default function ResourceAllocation3DHeatmap() {
  const servers = useMemo(() => {
    const grid = [];
    for (let x = 0; x < 8; x++) {
      for (let z = 0; z < 8; z++) {
        grid.push({
          position: [(x - 3.5) * 0.6, (z - 3.5) * 0.6],
          utilization: Math.random() * 100
        });
      }
    }
    return grid;
  }, []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />

        {servers.map((server, i) => (
          <ServerRack key={i} {...server} />
        ))}

        <gridHelper args={[8, 8, '#00f5ff', '#333333']} />
        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
}