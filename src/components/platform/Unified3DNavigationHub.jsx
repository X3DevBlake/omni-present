import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import * as THREE from 'three';

function NavigationNode({ hub, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = hovered ? 1.3 : Math.sin(state.clock.elapsedTime + position[0]) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const hubColors = {
    communication: '#00ffff',
    defi: '#ff8800',
    simulation: '#aa00ff',
    marketplace: '#00ff88',
    security: '#ff0000',
    assistant: '#ff00ff'
  };

  const color = hubColors[hub.type] || '#6366f1';

  return (
    <group position={position}>
      <Sphere 
        ref={meshRef}
        args={[1.5, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </Sphere>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {hub.name}
      </Text>
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {hub.description}
      </Text>
    </group>
  );
}

export default function Unified3DNavigationHub() {
  const navigate = useNavigate();

  const hubs = [
    { 
      name: 'Communication', 
      type: 'communication', 
      page: 'AdvancedCommunicationHub',
      description: 'Topics & Alerts'
    },
    { 
      name: 'DeFi Risk', 
      type: 'defi', 
      page: 'AdvancedDeFiRiskHub',
      description: 'Stress Testing'
    },
    { 
      name: 'Simulation', 
      type: 'simulation', 
      page: 'ProceduralSimulationStudio',
      description: 'Procedural Gen'
    },
    { 
      name: 'Marketplace', 
      type: 'marketplace', 
      page: 'EnhancedMarketplaceHub',
      description: 'Agent Matching'
    },
    { 
      name: 'Security', 
      type: 'security', 
      page: 'SecurityMonitoringHub',
      description: 'Threat Detection'
    },
    { 
      name: 'AI Assistant', 
      type: 'assistant', 
      page: 'ContextAwareAssistantHub',
      description: 'Context Aware'
    }
  ];

  const radius = 10;
  const angleStep = (Math.PI * 2) / hubs.length;

  const positions = hubs.map((_, index) => {
    const angle = angleStep * index;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5) * 2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="h-screen flex flex-col">
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Platform Navigation Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Click any hub to navigate - Experience immersive 3D navigation
          </p>
        </div>

        <div className="flex-1">
          <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, 10, -10]} intensity={0.8} color="#00ffff" />
            <pointLight position={[0, -10, 0]} intensity={0.5} color="#ff00ff" />

            {/* Central core */}
            <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#6366f1" 
                emissive="#6366f1" 
                emissiveIntensity={0.8}
              />
            </Sphere>
            <Text
              position={[0, 3.5, 0]}
              fontSize={0.8}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              OmniPlatform
            </Text>

            {/* Hub nodes */}
            {hubs.map((hub, index) => (
              <React.Fragment key={hub.name}>
                <NavigationNode
                  hub={hub}
                  position={positions[index]}
                  onClick={() => navigate(createPageUrl(hub.page))}
                />
                <Line
                  points={[[0, 0, 0], positions[index]]}
                  color="#6366f1"
                  lineWidth={2}
                  opacity={0.3}
                  transparent
                />
              </React.Fragment>
            ))}

            <OrbitControls 
              enableZoom={true} 
              autoRotate 
              autoRotateSpeed={0.5}
              maxDistance={30}
              minDistance={10}
            />
          </Canvas>
        </div>
      </div>
    </AuroraBackground>
  );
}