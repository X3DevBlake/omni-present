import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function LearningSessionNode({ session, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  const improvement = session.improvement_percentage || 0;
  const size = 0.2 + (improvement / 100) * 0.3;
  const color = improvement > 20 ? '#10b981' : improvement > 10 ? '#fbbf24' : '#3b82f6';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        maxWidth={1.5}
      >
        {session.topic}
      </Text>
      
      <Text
        position={[0, -size - 0.3, 0]}
        fontSize={0.1}
        color="#00f5ff"
        anchorX="center"
      >
        +{improvement.toFixed(1)}%
      </Text>
    </group>
  );
}

export default function LearningProgress3D({ journalEntries = [] }) {
  const positions = React.useMemo(() => {
    return journalEntries.map((_, idx) => {
      const angle = (idx / Math.max(journalEntries.length, 1)) * Math.PI * 4;
      const radius = 2 + idx * 0.3;
      const height = idx * 0.5;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [journalEntries]);
  
  if (journalEntries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No learning history yet</p>
      </div>
    );
  }
  
  const totalImprovement = journalEntries.reduce((sum, j) => sum + (j.improvement_percentage || 0), 0);
  const totalHours = journalEntries.reduce((sum, j) => sum + (j.time_spent_minutes || 0), 0) / 60;
  
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Learning path spiral */}
      {positions.length > 1 && (
        <Line
          points={positions}
          color="#00f5ff"
          lineWidth={3}
          transparent
          opacity={0.4}
        />
      )}
      
      {/* Learning sessions */}
      {journalEntries.map((session, idx) => (
        <LearningSessionNode
          key={session.id || idx}
          session={session}
          position={positions[idx]}
          index={idx}
        />
      ))}
      
      <Text
        position={[0, 6, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Learning Journey
      </Text>
      
      <Text
        position={[0, 5.3, -5]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
      >
        {journalEntries.length} Sessions • {totalImprovement.toFixed(0)}% Total Growth
      </Text>
      
      <Text
        position={[0, 4.9, -5]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="center"
      >
        {totalHours.toFixed(1)} Hours Invested
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
      />
    </Canvas>
  );
}