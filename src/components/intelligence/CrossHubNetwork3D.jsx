import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function HubNode({ hub, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  const hubColors = {
    'defi': '#10b981',
    'marketplace': '#3b82f6',
    'communication': '#a855f7',
    'security': '#ef4444',
    'simulation': '#fbbf24',
    'analytics': '#00f5ff'
  };
  
  const color = hubColors[hub.name] || '#ffffff';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {hub.name.toUpperCase()}
      </Text>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.12}
        color="#00f5ff"
        anchorX="center"
      >
        {hub.metrics?.active_connections || 0} links
      </Text>
    </group>
  );
}

function DataFlowLine({ link, fromPos, toPos }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  const width = Math.max(1, (link.link_strength / 100) * 5);
  const color = link.correlation_coefficient > 0.5 ? '#10b981' : '#fbbf24';
  
  return (
    <Line
      ref={lineRef}
      points={[fromPos, toPos]}
      color={color}
      lineWidth={width}
      transparent
      opacity={0.4}
    />
  );
}

export default function CrossHubNetwork3D({ links = [] }) {
  // Hub positions
  const hubPositions = {
    'defi': [3, 0, 3],
    'marketplace': [-3, 0, 3],
    'communication': [3, 0, -3],
    'security': [-3, 0, -3],
    'simulation': [0, 3, 0],
    'analytics': [0, -3, 0]
  };
  
  const hubs = [
    { name: 'defi', metrics: { active_connections: links.filter(l => l.source_hub === 'defi' || l.target_hub === 'defi').length } },
    { name: 'marketplace', metrics: { active_connections: links.filter(l => l.source_hub === 'marketplace' || l.target_hub === 'marketplace').length } },
    { name: 'communication', metrics: { active_connections: links.filter(l => l.source_hub === 'communication' || l.target_hub === 'communication').length } },
    { name: 'security', metrics: { active_connections: links.filter(l => l.source_hub === 'security' || l.target_hub === 'security').length } },
    { name: 'simulation', metrics: { active_connections: links.filter(l => l.source_hub === 'simulation' || l.target_hub === 'simulation').length } },
    { name: 'analytics', metrics: { active_connections: links.filter(l => l.source_hub === 'analytics' || l.target_hub === 'analytics').length } }
  ];
  
  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central intelligence core */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          wireframe
        />
      </Sphere>
      
      {/* Hub nodes */}
      {hubs.map((hub) => (
        <HubNode
          key={hub.name}
          hub={hub}
          position={hubPositions[hub.name]}
        />
      ))}
      
      {/* Cross-hub links */}
      {links.filter(l => l.is_active).map((link, idx) => (
        <DataFlowLine
          key={idx}
          link={link}
          fromPos={hubPositions[link.source_hub] || [0, 0, 0]}
          toPos={hubPositions[link.target_hub] || [0, 0, 0]}
        />
      ))}
      
      <Text
        position={[0, 6, -6]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Cross-Hub Intelligence Network
      </Text>
      
      <Text
        position={[0, 5.3, -6]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        {links.filter(l => l.is_active).length} Active Connections
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}