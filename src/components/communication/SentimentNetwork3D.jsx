import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';

function ChannelNode({ channel, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const sentiment = channel.sentiment_score || 0;
  const color = sentiment > 0.5 ? '#00ff88' : sentiment > 0 ? '#ffaa00' : '#ff4444';
  const size = 0.4 + Math.abs(sentiment) * 0.6;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
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
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {channel.channel_name}
      </Text>

      <Text
        position={[0, -size - 0.8, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {sentiment.toFixed(2)}
      </Text>
    </group>
  );
}

export default function SentimentNetwork3D({ channels = [], breakdowns = [] }) {
  const positions = channels.map((_, index) => {
    const angle = (index / channels.length) * Math.PI * 2;
    const radius = 6;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 8, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ffff" />

        {/* Central hub */}
        <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#0088ff"
            emissive="#0088ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            wireframe
          />
        </Sphere>

        {channels.map((channel, index) => (
          <React.Fragment key={channel.id}>
            <ChannelNode channel={channel} position={positions[index]} index={index} />
            
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#00ffff"
              lineWidth={2}
              transparent
              opacity={0.4}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
      </Canvas>

      {channels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No channels to visualize</p>
        </div>
      )}
    </div>
  );
}