import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function TopicNode({ topic, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const size = (topic.prevalence_score || 50) / 30;
  const color = topic.trend_direction === 'rising' ? '#00ff88' : 
                topic.trend_direction === 'declining' ? '#ff4444' : '#ffaa00';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
      <Text
        position={[0, size + 1, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {topic.topic_name}
      </Text>
      <Text
        position={[0, -size - 1, 0]}
        fontSize={0.3}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {topic.prevalence_score?.toFixed(0)}% prevalence
      </Text>
    </group>
  );
}

export default function CommunicationTopicTrends3D({ topics = [] }) {
  if (!topics || topics.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-white/60">
        No topics detected yet
      </div>
    );
  }

  const radius = 10;
  const angleStep = (Math.PI * 2) / topics.length;

  return (
    <div className="h-96 w-full">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Central hub */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
        </Sphere>

        {/* Topic nodes */}
        {topics.map((topic, index) => {
          const angle = angleStep * index;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <React.Fragment key={topic.id || index}>
              <TopicNode topic={topic} position={[x, 0, z]} />
              <Line
                points={[[0, 0, 0], [x, 0, z]]}
                color={topic.trend_direction === 'rising' ? '#00ff88' : '#ffaa00'}
                lineWidth={2}
                opacity={0.3}
              />
            </React.Fragment>
          );
        })}

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}