import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Stars } from '@react-three/drei';

function AgentStar({ agent, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const size = ((agent.recommendation_score || 50) / 100) * 0.8;
  const color = agent.availability_score > 70 ? '#00ff88' : 
                agent.availability_score > 40 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 16, 16]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>
      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Agent {agent.agent_id?.slice(-4)}
      </Text>
      <Text
        position={[0, -size - 0.8, 0]}
        fontSize={0.25}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
      >
        ${agent.pricing_model?.current_price || 0}
      </Text>
    </group>
  );
}

export default function AgentConstellationVisualizer3D({ agents = [] }) {
  if (!agents || agents.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center text-white/60">
        No agents available
      </div>
    );
  }

  // Position agents in a 3D constellation pattern
  const positions = agents.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / agents.length);
    const theta = Math.sqrt(agents.length * Math.PI) * phi;
    const radius = 12;
    
    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    ];
  });

  return (
    <div className="h-[600px] w-full bg-black/40 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Agent constellation */}
        {agents.map((agent, index) => (
          <React.Fragment key={agent.id || index}>
            <AgentStar agent={agent} position={positions[index]} />
            {index < agents.length - 1 && (
              <Line
                points={[positions[index], positions[index + 1]]}
                color="#6366f1"
                lineWidth={1}
                opacity={0.2}
                transparent
              />
            )}
          </React.Fragment>
        ))}

        <OrbitControls 
          enableZoom={true} 
          autoRotate 
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}