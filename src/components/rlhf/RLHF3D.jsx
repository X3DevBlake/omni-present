import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

function FeedbackNode({ position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 3 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.2, 16, 16]} position={position}>
      <meshStandardMaterial 
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function RLHF3D({ session }) {
  const feedbackCount = session?.human_feedback_count || 100;
  const alignment = session?.alignment_score || 88;

  const feedbackNodes = Array.from({ length: Math.min(feedbackCount / 5, 50) }, (_, i) => {
    const angle = (i / 50) * Math.PI * 4;
    const radius = 3 + (i / 50) * 3;
    const height = Math.sin(angle * 2) * 2;
    return {
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.8}
          metalness={0.9}
        />
      </Sphere>

      <Text position={[0, 3.5, 0]} fontSize={0.6} color="white" anchorX="center">
        RLHF Training
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center">
        {session?.session_name || 'Alignment Session'}
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {session?.base_model || 'GPT-4'}
      </Text>

      {feedbackNodes.map((node, i) => (
        <FeedbackNode key={i} {...node} />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.4} color="#10b981" anchorX="center">
          Alignment: {alignment}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Helpful: {session?.helpfulness_score || 92}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
          Harmless: {session?.harmlessness_score || 95}%
        </Text>
        <Text position={[0, -1.8, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          Honest: {session?.honesty_score || 89}%
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}