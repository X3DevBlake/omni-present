import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';

function AgentVisualization({ type, color }) {
  const meshRef = useRef();

  const geometryMap = {
    financial: 'torusKnotGeometry',
    research: 'dodecahedronGeometry',
    travel: 'octahedronGeometry',
    shopping: 'icosahedronGeometry',
    trading: 'tetrahedronGeometry',
    portfolio: 'torusGeometry',
    market: 'sphereGeometry',
    data: 'boxGeometry',
    risk: 'cylinderGeometry',
    supply: 'coneGeometry',
    customer: 'pyramidGeometry',
    content: 'planeGeometry',
    code: 'cylinderGeometry',
    system: 'boxGeometry',
    learning: 'sphereGeometry',
  };

  const getGeometry = () => {
    switch (type) {
      case 'financial': return <torusKnotGeometry args={[1, 0.3, 100, 16]} />;
      case 'research': return <dodecahedronGeometry args={[1, 0]} />;
      case 'travel': return <octahedronGeometry args={[1, 0]} />;
      case 'shopping': return <icosahedronGeometry args={[1, 0]} />;
      case 'trading': return <tetrahedronGeometry args={[1, 0]} />;
      case 'portfolio': return <torusGeometry args={[1, 0.3, 16, 100]} />;
      case 'market': return <sphereGeometry args={[1, 32, 32]} />;
      case 'data': return <boxGeometry args={[1, 1, 1]} />;
      case 'risk': return <cylinderGeometry args={[0.7, 0.7, 1.5, 8]} />;
      case 'supply': return <coneGeometry args={[0.8, 1.5, 8]} />;
      case 'customer': return <sphereGeometry args={[1, 32, 32]} />;
      case 'content': return <boxGeometry args={[1.2, 0.8, 0.5]} />;
      case 'code': return <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />;
      case 'system': return <boxGeometry args={[1.1, 1.1, 1.1]} />;
      case 'learning': return <sphereGeometry args={[1, 32, 32]} />;
      default: return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

const agents15 = [
  { name: 'Luna - Financial Analyst', type: 'financial', color: '#00f5ff', icon: '💼', description: 'Market analysis & portfolio review' },
  { name: 'Atlas - Research Agent', type: 'research', color: '#a855f7', icon: '🔍', description: 'Data collection & synthesis' },
  { name: 'Nova - Travel Planner', type: 'travel', color: '#ec4899', icon: '✈️', description: 'Route planning & itineraries' },
  { name: 'Echo - Shopping Assistant', type: 'shopping', color: '#10b981', icon: '🛍️', description: 'Product search & comparison' },
  { name: 'Apex - Trading Bot', type: 'trading', color: '#f59e0b', icon: '📈', description: 'Order execution & timing' },
  { name: 'Sage - Portfolio Manager', type: 'portfolio', color: '#06b6d4', icon: '🎯', description: 'Asset allocation & rebalancing' },
  { name: 'Prism - Market Analyst', type: 'market', color: '#8b5cf6', icon: '📊', description: 'Trend analysis & forecasting' },
  { name: 'Helix - Data Scientist', type: 'data', color: '#3b82f6', icon: '🧬', description: 'ML & data processing' },
  { name: 'Sentinel - Risk Manager', type: 'risk', color: '#ef4444', icon: '🛡️', description: 'Risk analysis & compliance' },
  { name: 'Nexus - Supply Chain', type: 'supply', color: '#14b8a6', icon: '📦', description: 'Logistics & coordination' },
  { name: 'Harmony - Customer Service', type: 'customer', color: '#ec4899', icon: '💬', description: 'Issue resolution & support' },
  { name: 'Genesis - Content Creator', type: 'content', color: '#f97316', icon: '✨', description: 'Content generation & creativity' },
  { name: 'Codex - Code Review', type: 'code', color: '#06b6d4', icon: '💻', description: 'Quality assurance & optimization' },
  { name: 'Cipher - System Admin', type: 'system', color: '#6366f1', icon: '⚙️', description: 'Infrastructure & security' },
  { name: 'Iris - Learning Coach', type: 'learning', color: '#fbbf24', icon: '🎓', description: 'Skill development & mentorship' },
];

export default function Agent15TypesGrid({ onAgentSelect }) {
  return (
    <div className="w-full">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          15 Distinct AI Agent Types
        </h2>
        <p className="text-white/60 text-lg">Specialized agents with unique capabilities and personalities</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {agents15.map((agent, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onAgentSelect?.(agent)}
            className="cursor-pointer group"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300">
              {/* 3D Visualization */}
              <div className="h-48 w-full bg-gradient-to-b from-white/5 to-black/50">
                <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[5, 5, 5]} intensity={0.8} color={agent.color} />
                  <AgentVisualization type={agent.type} color={agent.color} />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
                </Canvas>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{agent.icon}</span>
                  <h3 className="font-bold text-white text-sm truncate">{agent.name}</h3>
                </div>
                <p className="text-white/60 text-xs line-clamp-2">{agent.description}</p>
                
                {/* Status Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-white/50">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}