import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function ReputationNode({ reputation, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const trustLevelColors = {
    elite: '#ffd700',
    expert: '#00ff88',
    trusted: '#00aaff',
    novice: '#aaaaaa'
  };

  const size = (reputation.overall_score || 50) / 50;
  const color = trustLevelColors[reputation.trust_level] || '#aaaaaa';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Text
        position={[0, size + 1.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Agent {reputation.agent_id?.slice(-4)}
      </Text>
      <Text
        position={[0, -size - 1.5, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {reputation.trust_level?.toUpperCase()}
      </Text>
      <Text
        position={[0, -size - 2.5, 0]}
        fontSize={0.25}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Score: {reputation.overall_score?.toFixed(0)}
      </Text>
    </group>
  );
}

export default function DecentralizedReputationVisualizer3D({ reputations = [] }) {
  if (!reputations || reputations.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-white/60">
        No reputation data available
      </div>
    );
  }

  // Sort by score and position in tiers
  const sorted = [...reputations].sort((a, b) => 
    (b.overall_score || 0) - (a.overall_score || 0)
  );

  const positions = sorted.map((_, i) => {
    const tier = Math.floor(i / 8);
    const indexInTier = i % 8;
    const angle = (indexInTier / 8) * Math.PI * 2;
    const radius = 8 + (tier * 4);
    const height = tier * -3;
    
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  });

  return (
    <div className="h-[500px] w-full bg-black/40 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Central blockchain representation */}
        <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#6366f1" 
            emissiveIntensity={0.8}
            wireframe
          />
        </Sphere>

        {sorted.map((reputation, index) => (
          <React.Fragment key={reputation.id || index}>
            <ReputationNode
              reputation={reputation}
              position={positions[index]}
            />
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#6366f1"
              lineWidth={1}
              opacity={0.2}
              transparent
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}