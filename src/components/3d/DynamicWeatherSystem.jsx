import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DynamicWeatherSystem({ systemLoad = 50, dataTraffic = 50, errorRate = 0 }) {
  const [particles, setParticles] = useState([]);
  const particlesRef = React.useRef();

  useEffect(() => {
    const particleCount = Math.floor(dataTraffic * 10);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        position: [
          (Math.random() - 0.5) * 100,
          Math.random() * 50,
          (Math.random() - 0.5) * 100
        ],
        velocity: Math.random() * 0.5 + 0.1
      });
    }
    setParticles(newParticles);
  }, [dataTraffic]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  const getWeatherColor = () => {
    if (errorRate > 5) return '#ff0000'; // Red for errors
    if (systemLoad > 80) return '#888888'; // Gray for high load
    if (dataTraffic > 70) return '#4488ff'; // Blue for high traffic
    return '#ffffff'; // Clear
  };

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={getWeatherColor()} transparent opacity={0.6} />
        </mesh>
      ))}
      
      {errorRate > 5 && (
        <pointLight position={[0, 20, 0]} color="#ff0000" intensity={2} distance={50} />
      )}
      
      {systemLoad > 80 && (
        <fog attach="fog" args={['#888888', 10, 100]} />
      )}
    </group>
  );
}