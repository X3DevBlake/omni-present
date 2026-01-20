import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function FlowParticle({ from, to, speed = 0.02 }) {
  const meshRef = useRef();
  const progressRef = useRef(Math.random());
  
  useFrame(() => {
    progressRef.current += speed;
    if (progressRef.current > 1) {
      progressRef.current = 0;
    }
    
    if (meshRef.current) {
      const t = progressRef.current;
      meshRef.current.position.set(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI * 2) * 0.3,
        from[2] + (to[2] - from[2]) * t
      );
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.08, 16, 16]}>
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
}

function HubSphere({ hub, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  const hubColors = {
    'defi': '#10b981',
    'marketplace': '#3b82f6',
    'communication': '#a855f7',
    'simulation': '#fbbf24',
    'security': '#ef4444',
    'analytics': '#00f5ff'
  };
  
  const color = hubColors[hub] || '#ffffff';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      <Text position={[0, 1, 0]} fontSize={0.25} color="white" anchorX="center">
        {hub.toUpperCase()}
      </Text>
    </group>
  );
}

export default function BiDirectionalHubFlow3D({ links = [] }) {
  const hubPositions = {
    'defi': [4, 2, 0],
    'marketplace': [-4, 2, 0],
    'communication': [0, 4, 3],
    'simulation': [0, 0, -4],
    'security': [3, -2, 3],
    'analytics': [-3, -2, -3]
  };
  
  const activeHubs = [...new Set([
    ...links.map(l => l.source_hub),
    ...links.map(l => l.target_hub)
  ])];
  
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central intelligence core */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          wireframe
        />
      </Sphere>
      
      <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center">
        CORE
      </Text>
      
      {/* Hub nodes */}
      {activeHubs.map(hub => (
        <HubSphere key={hub} hub={hub} position={hubPositions[hub]} />
      ))}
      
      {/* Bi-directional data flows */}
      {links.filter(l => l.is_active).map((link, idx) => {
        const fromPos = hubPositions[link.source_hub];
        const toPos = hubPositions[link.target_hub];
        
        if (!fromPos || !toPos) return null;
        
        return (
          <React.Fragment key={idx}>
            {/* Connection line */}
            <Line
              points={[fromPos, toPos]}
              color="#00f5ff"
              lineWidth={2}
              transparent
              opacity={0.3}
            />
            
            {/* Forward flow particles */}
            {[...Array(3)].map((_, pIdx) => (
              <FlowParticle
                key={`fwd-${pIdx}`}
                from={fromPos}
                to={toPos}
                speed={0.02 + pIdx * 0.01}
              />
            ))}
            
            {/* Reverse flow particles (bi-directional) */}
            {[...Array(2)].map((_, pIdx) => (
              <FlowParticle
                key={`rev-${pIdx}`}
                from={toPos}
                to={fromPos}
                speed={0.015 + pIdx * 0.01}
              />
            ))}
          </React.Fragment>
        );
      })}
      
      <Text
        position={[0, 8, -6]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Cross-Hub Intelligence Flow
      </Text>
      
      <Text
        position={[0, 7.3, -6]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        {links.filter(l => l.is_active).length} Active Connections
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}