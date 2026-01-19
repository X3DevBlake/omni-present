import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function VoiceWaveform({ isListening, amplitude = 1 }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && isListening) {
      groupRef.current.rotation.y += 0.02;
    }
  });
  
  const rings = 5;
  
  return (
    <group ref={groupRef}>
      {[...Array(rings)].map((_, idx) => {
        const radius = 1 + idx * 0.5;
        const opacity = 1 - idx * 0.15;
        
        return (
          <mesh key={idx} rotation={[0, 0, 0]}>
            <torusGeometry args={[radius * amplitude, 0.05, 16, 100]} />
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00f5ff"
              emissiveIntensity={isListening ? 0.5 : 0.2}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function IntentSphere({ intent, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {intent}
      </Text>
    </group>
  );
}

export default function VoiceCommandVisualizer3D({ isListening, recentCommands = [] }) {
  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central microphone sphere */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={isListening ? '#ef4444' : '#64748b'}
          emissive={isListening ? '#ef4444' : '#64748b'}
          emissiveIntensity={isListening ? 0.8 : 0.2}
        />
      </Sphere>
      
      {/* Voice waveform */}
      <VoiceWaveform isListening={isListening} amplitude={isListening ? 1.2 : 0.8} />
      
      {/* Recent command intents */}
      {recentCommands.slice(0, 5).map((cmd, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        const radius = 3;
        return (
          <IntentSphere
            key={idx}
            intent={cmd.intent}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          />
        );
      })}
      
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {isListening ? 'Listening...' : 'Voice Assistant'}
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={!isListening}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}