import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';

export default function InterAgentRelationship3DWeb() {
  const network = useMemo(() => {
    const agents = [
      { name: 'Alpha', pos: [0, 2, 0] },
      { name: 'Beta', pos: [-2, 0, 1] },
      { name: 'Gamma', pos: [2, 0, 1] },
      { name: 'Delta', pos: [0, -2, 0] },
      { name: 'Epsilon', pos: [0, 0, -2] },
    ];

    const connections = [
      { from: 0, to: 1, strength: 0.8 },
      { from: 0, to: 2, strength: 0.6 },
      { from: 1, to: 3, strength: 0.9 },
      { from: 2, to: 4, strength: 0.7 },
      { from: 3, to: 4, strength: 0.5 },
    ];

    return { agents, connections };
  }, []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {network.connections.map((conn, i) => (
          <Line
            key={i}
            points={[network.agents[conn.from].pos, network.agents[conn.to].pos]}
            color="#00f5ff"
            lineWidth={conn.strength * 3}
            opacity={conn.strength}
            transparent
          />
        ))}

        {network.agents.map((agent, i) => (
          <group key={i} position={agent.pos}>
            <Sphere args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
            </Sphere>
            <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
              {agent.name}
            </Text>
          </group>
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}