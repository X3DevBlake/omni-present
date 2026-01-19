import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function IntegrationNode({ integration, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      // Pulsing for active integrations
      if (integration.status === 'healthy') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });
  
  // Color and glow based on health status
  const statusConfig = {
    healthy: { color: '#10b981', glow: 0.5 },
    degraded: { color: '#fbbf24', glow: 0.3 },
    down: { color: '#ef4444', glow: 0.8 },
    maintenance: { color: '#3b82f6', glow: 0.2 }
  };
  
  const config = statusConfig[integration.status] || statusConfig.healthy;
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.4, 32, 32]}
        onClick={() => onClick(integration)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={hovered ? 0.8 : config.glow}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {integration.integration_name}
      </Text>
      
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color={config.color}
        anchorX="center"
      >
        {integration.uptime_percentage?.toFixed(1)}% uptime
      </Text>
      
      {/* Data flow particles */}
      {integration.status === 'healthy' && (
        <Sphere args={[0.08, 16, 16]} position={[0.5, 0, 0]}>
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
    </group>
  );
}

function DataFlowParticles({ integrations }) {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group ref={particlesRef}>
      {integrations.map((_, idx) => {
        const angle = (idx / integrations.length) * Math.PI * 2;
        const radius = 3;
        return (
          <Line
            key={idx}
            points={[
              [0, 0, 0],
              [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
            ]}
            color="#00f5ff"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        );
      })}
    </group>
  );
}

export default function IntegrationNetwork3D({ integrations, onNodeClick }) {
  const positions = React.useMemo(() => {
    if (!integrations || integrations.length === 0) return [];
    
    return integrations.map((_, idx) => {
      const angle = (idx / integrations.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(idx * 0.5) * 1.5;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [integrations]);
  
  if (!integrations || integrations.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No integrations configured</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central hub */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      
      {/* Data flow lines */}
      <DataFlowParticles integrations={integrations} />
      
      {/* Integration nodes */}
      {integrations.map((integration, idx) => (
        <IntegrationNode
          key={integration.id || idx}
          integration={integration}
          position={positions[idx]}
          onClick={onNodeClick}
        />
      ))}
      
      <Text
        position={[0, 6, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Integration Network
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