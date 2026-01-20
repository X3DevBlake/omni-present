import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function AILabeler({ position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
      <meshStandardMaterial 
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.7}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function RLAIF3D({ session }) {
  const scalability = session?.scalability_factor || 10;

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.7}
        />
      </Sphere>

      <AILabeler position={[4, 0, 0]} />

      <Line
        points={[[0, 0, 0], [4, 0, 0]]}
        color="#10b981"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        RLAIF Training
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {session?.session_name || 'AI Feedback'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {session?.base_model || 'GPT-4'} + {session?.ai_labeler_model || 'GPT-4'}
      </Text>

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {scalability}x More Scalable
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Agreement: {((session?.alignment_agreement || 0.89) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          {session?.synthetic_preferences_count?.toLocaleString() || '50,000'} preferences
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}