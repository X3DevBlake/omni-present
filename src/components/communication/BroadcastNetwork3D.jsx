import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function BroadcastPulse({ position, priority }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      ringRef.current.scale.setScalar(scale);
      ringRef.current.material.opacity = 0.5 - Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  const priorityColors = {
    urgent: '#ff0000',
    high: '#ff8800',
    normal: '#00f5ff',
    low: '#4488ff',
  };

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 1.5, 32]} />
      <meshBasicMaterial 
        color={priorityColors[priority] || '#00f5ff'} 
        transparent 
        opacity={0.5} 
      />
    </mesh>
  );
}

export default function BroadcastNetwork3D({ broadcasts }) {
  const positions = broadcasts.slice(0, 10).map((_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />

        {/* Central broadcast hub */}
        <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </Sphere>

        {broadcasts.slice(0, 10).map((broadcast, index) => (
          <React.Fragment key={broadcast.id}>
            <BroadcastPulse 
              position={positions[index]} 
              priority={broadcast.priority}
            />
            
            {/* Connection lines to center */}
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#00f5ff"
              lineWidth={1}
              transparent
              opacity={0.3}
            />

            <Text
              position={[positions[index][0], positions[index][1] - 2, positions[index][2]]}
              fontSize={0.15}
              color="white"
              anchorX="center"
            >
              {broadcast.recipients?.length || 0} agents
            </Text>
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1.5} />
      </Canvas>

      {broadcasts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No broadcasts to visualize</p>
        </div>
      )}
    </div>
  );
}