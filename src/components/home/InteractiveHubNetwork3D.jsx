import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { 
  Brain, GraduationCap, Radio, Rocket, Bot, Activity, Network, Code, 
  FlaskConical, Shield, Globe, Zap, Users, MessageSquare, Sparkles,
  Database, Cpu, Eye, TrendingUp, Layers
} from 'lucide-react';

const hubCategories = [
  {
    name: 'Intelligence',
    color: '#8b5cf6',
    position: [0, 2, 0],
    hubs: [
      { name: 'Omega Intelligence', page: 'OmegaIntelligenceHub', icon: Brain },
      { name: 'AI Labs', page: 'AILabs', icon: FlaskConical },
      { name: 'AI Playground', page: 'AIPlayground', icon: Sparkles },
      { name: 'AI Management', page: 'AIManagement', icon: Cpu },
      { name: 'Predictive Intel', page: 'PredictiveIntelligenceHub', icon: Eye },
    ]
  },
  {
    name: 'Academy',
    color: '#ec4899',
    position: [3, 0, 0],
    hubs: [
      { name: 'Academy Portal', page: 'OmniPresentAcademy', icon: GraduationCap },
      { name: 'Research Hub', page: 'ResearchHub', icon: Activity },
      { name: 'Training Center', page: 'AITrainingCenter', icon: Brain },
      { name: 'Developer Portal', page: 'DeveloperPortal', icon: Code },
    ]
  },
  {
    name: 'Network',
    color: '#22d3ee',
    position: [-3, 0, 0],
    hubs: [
      { name: 'RedComm Hub', page: 'RedCommHub', icon: Radio },
      { name: 'Security Hub', page: 'SecurityIntelligenceHub', icon: Shield },
      { name: 'Ecosystem Monitor', page: 'EcosystemMonitoringDashboard', icon: Globe },
    ]
  },
  {
    name: 'Marketplace',
    color: '#10b981',
    position: [0, -2, 0],
    hubs: [
      { name: 'Agent Marketplace', page: 'AIAgentMarketplace', icon: Bot },
      { name: 'Omega Marketplace', page: 'OmegaMarketplaceHub', icon: TrendingUp },
      { name: 'Agent Customization', page: 'AgentCustomization', icon: Sparkles },
    ]
  },
  {
    name: 'Collaboration',
    color: '#f59e0b',
    position: [2, 1.5, -1],
    hubs: [
      { name: 'Collaboration Hub', page: 'AgentCollaborationHub', icon: Network },
      { name: 'Team Orchestration', page: 'TeamOrchestration', icon: Users },
      { name: 'Communication Hub', page: 'UnifiedCommunicationHub', icon: MessageSquare },
    ]
  },
  {
    name: 'Simulation',
    color: '#ef4444',
    position: [-2, 1.5, -1],
    hubs: [
      { name: 'Simulation Hub', page: 'SimulationHub', icon: Rocket },
      { name: 'Simulation Lab', page: 'SimulationLab', icon: FlaskConical },
      { name: 'Sandbox Environment', page: 'SandboxEnvironment', icon: Layers },
    ]
  },
  {
    name: 'Financial',
    color: '#06b6d4',
    position: [2, -1.5, -1],
    hubs: [
      { name: 'Financial Hub', page: 'OmegaFinancialHub', icon: TrendingUp },
      { name: 'DeFi Hub', page: 'DeFiHub', icon: Zap },
      { name: 'Banking Hub', page: 'OmniBankingHub', icon: Database },
    ]
  },
  {
    name: 'Development',
    color: '#a855f7',
    position: [-2, -1.5, -1],
    hubs: [
      { name: 'Developer Ecosystem', page: 'DeveloperEcosystemHub', icon: Code },
      { name: 'Agent Behavior', page: 'AgentBehaviorStudio', icon: Brain },
      { name: 'Workflow Automation', page: 'WorkflowAutomationHub', icon: Cpu },
    ]
  }
];

const HubNode = ({ hub, position, color, onSelect, isSelected, isHovered, onHover }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      if (isSelected || isHovered) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <Sphere
          ref={meshRef}
          args={[0.15, 32, 32]}
          onClick={(e) => { e.stopPropagation(); onSelect(hub); }}
          onPointerOver={(e) => { e.stopPropagation(); onHover(hub.page); }}
          onPointerOut={() => onHover(null)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2 : isHovered ? 1.5 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {(isHovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 rounded-xl p-3 min-w-[140px] pointer-events-none backdrop-blur-xl shadow-2xl"
              style={{ borderColor: color }}>
              <div className="font-bold text-xs mb-1" style={{ color }}>{hub.name}</div>
              <div className="text-white/60 text-xs">Click to visit →</div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

const CategoryNode = ({ category, onSelectHub, selectedHub, hoveredHub, onHover }) => {
  const groupRef = useRef();
  const [expanded, setExpanded] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const hubPositions = useMemo(() => {
    return category.hubs.map((_, i) => {
      const angle = (i / category.hubs.length) * Math.PI * 2;
      const radius = expanded ? 1.2 : 0.5;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        Math.sin(angle) * radius * 0.3
      ];
    });
  }, [category.hubs.length, expanded]);

  return (
    <group position={category.position} ref={groupRef}>
      {/* Category core */}
      <Sphere
        args={[0.3, 32, 32]}
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        <meshStandardMaterial
          color={category.color}
          emissive={category.color}
          emissiveIntensity={expanded ? 1.5 : 1}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color={category.color}
        anchorX="center"
        anchorY="middle"
      >
        {category.name}
      </Text>

      {/* Hub nodes */}
      {category.hubs.map((hub, i) => (
        <React.Fragment key={hub.page}>
          <HubNode
            hub={hub}
            position={hubPositions[i]}
            color={category.color}
            onSelect={onSelectHub}
            isSelected={selectedHub?.page === hub.page}
            isHovered={hoveredHub === hub.page}
            onHover={onHover}
          />
          <Line
            points={[[0, 0, 0], hubPositions[i]]}
            color={category.color}
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}
    </group>
  );
};

const ConnectionLines = () => {
  const linesRef = useRef();
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        line.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime + i) * 0.05;
      });
    }
  });

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < hubCategories.length; i++) {
      for (let j = i + 1; j < hubCategories.length; j++) {
        lines.push({
          start: hubCategories[i].position,
          end: hubCategories[j].position,
          color: hubCategories[i].color
        });
      }
    }
    return lines;
  }, []);

  return (
    <group ref={linesRef}>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={0.5}
          transparent
          opacity={0.1}
        />
      ))}
    </group>
  );
};

export default function InteractiveHubNetwork3D() {
  const [selectedHub, setSelectedHub] = useState(null);
  const [hoveredHub, setHoveredHub] = useState(null);

  return (
    <div className="relative">
      <div className="h-[600px] rounded-3xl overflow-hidden border-2 border-purple-500/30 bg-black/60 backdrop-blur-xl">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={2} />
          <pointLight position={[-10, -10, -10]} color="#ec4899" intensity={1.5} />
          <pointLight position={[0, 10, 0]} color="#22d3ee" intensity={1} />
          
          <ConnectionLines />
          
          {hubCategories.map((category) => (
            <CategoryNode
              key={category.name}
              category={category}
              onSelectHub={setSelectedHub}
              selectedHub={selectedHub}
              hoveredHub={hoveredHub}
              onHover={setHoveredHub}
            />
          ))}
          
          <OrbitControls
            enableZoom={true}
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={5}
            maxDistance={15}
          />
        </Canvas>
      </div>

      {/* Selected Hub Panel */}
      {selectedHub && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-xl border-2 border-purple-500/60 rounded-2xl p-6 shadow-2xl z-10"
        >
          <div className="flex items-center gap-4">
            <div className="text-white font-bold text-lg">{selectedHub.name}</div>
            <Link to={createPageUrl(selectedHub.page)}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold text-sm"
              >
                Enter Hub →
              </motion.button>
            </Link>
            <button
              onClick={() => setSelectedHub(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick Category Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {hubCategories.slice(0, 8).map((category) => (
          <motion.div
            key={category.name}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-black/60 backdrop-blur-xl border rounded-xl p-4 cursor-pointer"
            style={{ borderColor: category.color + '60' }}
          >
            <div className="font-bold text-sm mb-2" style={{ color: category.color }}>
              {category.name}
            </div>
            <div className="space-y-1">
              {category.hubs.slice(0, 3).map((hub) => (
                <Link key={hub.page} to={createPageUrl(hub.page)}>
                  <div className="text-gray-400 text-xs hover:text-white transition-colors">
                    {hub.name}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}