import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function DataStreamLine({ stream, index, totalStreams }) {
  const lineRef = useRef();
  const particlesRef = useRef([]);
  
  useFrame((state) => {
    // Animate data flow particles
    particlesRef.current.forEach((particle, idx) => {
      if (particle) {
        particle.position.z += 0.05;
        if (particle.position.z > 5) {
          particle.position.z = -5;
        }
      }
    });
  });
  
  const angle = (index / totalStreams) * Math.PI * 2;
  const radius = 3;
  const start = [0, 0, 0];
  const end = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  
  const color = stream.anomaly_detected ? '#ef4444' : '#10b981';
  
  return (
    <group>
      <Line
        ref={lineRef}
        points={[start, end]}
        color={color}
        lineWidth={stream.anomaly_detected ? 3 : 1}
        transparent
        opacity={0.6}
      />
      
      {/* Data particles flowing */}
      {[...Array(3)].map((_, idx) => {
        const t = idx / 3;
        const pos = [
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
          start[2] + (end[2] - start[2]) * t
        ];
        
        return (
          <Sphere
            key={idx}
            ref={el => particlesRef.current[idx] = el}
            args={[0.05, 8, 8]}
            position={pos}
          >
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
            />
          </Sphere>
        );
      })}
      
      {/* Stream endpoint */}
      <Sphere args={[0.2, 16, 16]} position={end}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={stream.anomaly_detected ? 0.8 : 0.3}
        />
      </Sphere>
      
      <Text
        position={[end[0], 0.5, end[2]]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {stream.stream_name}
      </Text>
    </group>
  );
}

export default function RealTimeAnomalyDetector3D({ streams }) {
  if (!streams || streams.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No data streams configured</p>
      </div>
    );
  }
  
  const anomalyCount = streams.filter(s => s.anomaly_detected).length;
  
  return (
    <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ef4444" />
      
      {/* Central processing hub */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={anomalyCount > 0 ? '#ef4444' : '#6366f1'}
          emissive={anomalyCount > 0 ? '#ef4444' : '#6366f1'}
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      
      {/* Data streams */}
      {streams.map((stream, idx) => (
        <DataStreamLine
          key={stream.id || idx}
          stream={stream}
          index={idx}
          totalStreams={streams.length}
        />
      ))}
      
      <Text
        position={[0, 4, -4]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Real-Time Anomaly Detection
      </Text>
      
      <Text
        position={[0, 3.3, -4]}
        fontSize={0.25}
        color={anomalyCount > 0 ? '#ef4444' : '#10b981'}
        anchorX="center"
      >
        {anomalyCount > 0 ? `${anomalyCount} Anomalies Detected` : 'All Systems Normal'}
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={1}
      />
    </Canvas>
  );
}