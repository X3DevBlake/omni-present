import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function IntegrationNode({ integration, position, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getCategoryColor = () => {
    switch (integration.category) {
      case 'crm': return '#00f5ff';
      case 'marketing': return '#a855f7';
      case 'analytics': return '#44ff44';
      case 'communication': return '#ec4899';
      case 'ai_ml': return '#3b82f6';
      default: return '#ffaa00';
    }
  };

  const size = 0.2 + (integration.rating / 5) * 0.3;

  return (
    <group position={position} onClick={() => onClick?.(integration)}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={getCategoryColor()}
          emissive={getCategoryColor()}
          emissiveIntensity={integration.is_verified ? 0.6 : 0.3}
        />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white">
        {integration.integration_name}
      </Text>
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="#ffaa00">
        ⭐ {integration.rating?.toFixed(1)}
      </Text>
    </group>
  );
}

function CategoryClusters({ integrations }) {
  const categories = ['crm', 'analytics', 'ai_ml', 'communication'];
  
  return (
    <>
      {categories.map((cat, i) => {
        const count = integrations?.filter(int => int.category === cat).length || 0;
        const angle = (i / categories.length) * Math.PI * 2;
        
        return (
          <group key={i} position={[Math.cos(angle) * 4, Math.sin(angle) * 2, 0]}>
            <Text fontSize={0.2} color="#00f5ff">
              {cat.toUpperCase()}
            </Text>
            <Text position={[0, -0.4, 0]} fontSize={0.15} color="white">
              {count} integrations
            </Text>
          </group>
        );
      })}
    </>
  );
}

export default function IntegrationMarketplace3D({ integrations, onSelect }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 5, 0]} fontSize={0.5} color="#00f5ff">
          Integration Marketplace
        </Text>
        <Text position={[0, 4.3, 0]} fontSize={0.2} color="#ffffff">
          {integrations?.length || 0} Available Integrations
        </Text>

        {integrations?.slice(0, 30).map((integration, i) => {
          const angle = (i / Math.min(integrations.length, 30)) * Math.PI * 2;
          const radius = 2 + (i % 3) * 0.8;
          const height = (Math.random() - 0.5) * 2;
          
          return (
            <IntegrationNode
              key={integration.id}
              integration={integration}
              position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
              onClick={onSelect}
            />
          );
        })}

        <CategoryClusters integrations={integrations} />

        <group position={[0, -4, 0]}>
          <Text fontSize={0.12} color="#44ff44">
            ✓ Verified: {integrations?.filter(i => i.is_verified).length}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffaa00">
            Total Installs: {integrations?.reduce((sum, i) => sum + i.install_count, 0)}
          </Text>
        </group>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}