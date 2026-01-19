import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function SentimentParticle({ message, index, totalMessages }) {
  const meshRef = useRef();
  const particleRef = useRef({
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      0.05,
      (Math.random() - 0.5) * 0.02
    ),
    age: 0
  });
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Age particle
      particleRef.current.age += delta;
      
      // Move particle
      meshRef.current.position.add(particleRef.current.velocity);
      
      // Fade out over time
      const maxAge = 10;
      const opacity = Math.max(0, 1 - particleRef.current.age / maxAge);
      meshRef.current.material.opacity = opacity;
      
      // Reset if too old
      if (particleRef.current.age > maxAge) {
        meshRef.current.position.set(0, 0, 0);
        particleRef.current.age = 0;
      }
      
      // Rotate
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  // Color based on sentiment (-1 to 1)
  const sentiment = message.sentiment_score || 0;
  const color = new THREE.Color().setHSL(
    (sentiment + 1) * 0.15, // Red for negative, green for positive
    0.8,
    0.5
  );
  
  const size = 0.1 + Math.abs(sentiment) * 0.2;
  
  return (
    <mesh
      ref={meshRef}
      position={[
        (Math.random() - 0.5) * 2,
        0,
        (Math.random() - 0.5) * 2
      ]}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function SentimentRiver({ avgSentiment, messageCount }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 50;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const x = Math.sin(t * Math.PI * 4) * 3;
      const y = Math.sin(t * Math.PI * 2) * 0.5;
      const z = t * 10 - 5;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);
  
  // River width based on message volume
  const width = 0.3 + (messageCount / 100) * 0.5;
  
  // River color based on average sentiment
  const color = new THREE.Color().setHSL((avgSentiment + 1) * 0.15, 0.7, 0.5);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      transparent
      opacity={0.6}
    />
  );
}

export default function RealTimeSentimentFlow3D({ messages, channelData }) {
  const avgSentiment = useMemo(() => {
    if (!messages || messages.length === 0) return 0;
    const sum = messages.reduce((acc, msg) => acc + (msg.sentiment_score || 0), 0);
    return sum / messages.length;
  }, [messages]);
  
  if (!messages || messages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No message data available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Sentiment river */}
      <SentimentRiver 
        avgSentiment={avgSentiment}
        messageCount={messages.length}
      />
      
      {/* Individual message particles */}
      {messages.slice(-50).map((message, idx) => (
        <SentimentParticle
          key={message.id || idx}
          message={message}
          index={idx}
          totalMessages={messages.length}
        />
      ))}
      
      {/* Info display */}
      <Text
        position={[0, 3, -3]}
        fontSize={0.3}
        color={avgSentiment >= 0 ? '#10b981' : '#ef4444'}
        anchorX="center"
      >
        Avg Sentiment: {(avgSentiment * 100).toFixed(0)}%
      </Text>
      
      <Text
        position={[0, 2.5, -3]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {messages.length} Messages
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}