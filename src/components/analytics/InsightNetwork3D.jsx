import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function InsightNode({ position, insight, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
    }
  });

  const typeColors = {
    opportunity: '#00ff88',
    warning: '#ff8800',
    discovery: '#a855f7',
  };

  const color = typeColors[insight.type] || '#4488ff';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Confidence ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.7 + (insight.confidence * 0.5), 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        maxWidth={3}
      >
        {insight.title?.slice(0, 30)}
      </Text>
    </group>
  );
}

export default function InsightNetwork3D({ insights }) {
  const positions = insights.map((_, index) => {
    const angle = (index / insights.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.7) * 2,
      Math.sin(angle) * radius,
    ];
  });

  // Create connections between related insights
  const connections = [];
  for (let i = 0; i < insights.length; i++) {
    if (i < insights.length - 1) {
      connections.push([positions[i], positions[i + 1]]);
    }
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {insights.map((insight, index) => (
          <InsightNode
            key={index}
            position={positions[index]}
            insight={insight}
            index={index}
          />
        ))}

        {connections.map((conn, i) => (
          <Line
            key={i}
            points={conn}
            color="#00f5ff"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {insights.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Generate insights to visualize network</p>
        </div>
      )}
    </div>
  );
}