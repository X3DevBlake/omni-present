import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Brain, Atom, Network, Zap, ArrowRight, Cpu, Radio, GitBranch, Sparkles, Eye, Activity,
  Shield, TrendingUp, Globe, Rocket, Code, MessageSquare, Bot, X, Info, Layers
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text as Text3D, MeshDistortMaterial, Float, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import NeuralManifoldAlignmentVisualizer3D from '../components/omega/NeuralManifoldAlignmentVisualizer3D';
import PhotophoreticTrapSimulator3D from '../components/omega/PhotophoreticTrapSimulator3D';
import RecursiveHAASMonitor3D from '../components/omega/RecursiveHAASMonitor3D';
import RedCommNetworkFabricViewer3D from '../components/omega/RedCommNetworkFabricViewer3D';
import Sim2RealDashboard3D from '../components/omega/Sim2RealDashboard3D';
import CRDTSyncVisualizer3D from '../components/omega/CRDTSyncVisualizer3D';
import SentientFinanceEngine3D from '../components/omega/SentientFinanceEngine3D';
import EnhancedRedCommVisualizer3D from '../components/network/EnhancedRedCommVisualizer3D';
import NeuralEnhancementVisualizer3D from '../components/augmentation/NeuralEnhancementVisualizer3D';


// Interactive Node with Info Panel
const InteractiveNode = ({ node, onSelect, isSelected, isHovered, onHover }) => {
  const meshRef = useRef();
  const [showInfo, setShowInfo] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });
  
  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={isSelected ? 2 : 0.5} floatIntensity={isSelected ? 1 : 0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.1, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
            setShowInfo(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(node.id);
          }}
          onPointerOut={() => onHover(null)}
        >
          <meshStandardMaterial
            color={isSelected ? '#ec4899' : isHovered ? '#a78bfa' : '#8b5cf6'}
            emissive={isSelected ? '#ec4899' : isHovered ? '#a78bfa' : '#8b5cf6'}
            emissiveIntensity={isSelected ? 1.5 : isHovered ? 1 : 0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {(isHovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-black/90 border border-purple-400 rounded-lg p-3 min-w-[150px] pointer-events-none backdrop-blur-xl">
              <div className="text-purple-400 font-bold text-xs mb-1">Node {node.id}</div>
              <div className="text-white text-xs">Type: {node.type}</div>
              <div className="text-gray-400 text-xs">Activity: {(node.activity * 100).toFixed(0)}%</div>
              {isSelected && (
                <div className="mt-2 text-cyan-400 text-xs">
                  Click for details →
                </div>
              )}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

// Enhanced Interactive Neural Network
const InteractiveNeuralNetwork = ({ onNodeClick, selectedNode, hoveredNode, onHover }) => {
  const groupRef = useRef();
  
  const nodes = Array(50).fill(0).map((_, i) => ({
    position: [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    ],
    id: i,
    type: ['cognitive', 'sensory', 'motor', 'memory'][Math.floor(Math.random() * 4)],
    activity: Math.random(),
    connections: Array(Math.floor(Math.random() * 3) + 1).fill(0).map(() => Math.floor(Math.random() * 50))
  }));
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {nodes.map((node) => (
        <InteractiveNode
          key={node.id}
          node={node}
          onSelect={onNodeClick}
          isSelected={selectedNode?.id === node.id}
          isHovered={hoveredNode === node.id}
          onHover={onHover}
        />
      ))}
      
      {nodes.map((node) => 
        node.connections.map((targetIdx, connIdx) => {
          const target = nodes[targetIdx];
          if (!target) return null;
          const isActive = hoveredNode === node.id || hoveredNode === target.id || selectedNode?.id === node.id;
          return (
            <Line
              key={`line_${node.id}_${connIdx}`}
              points={[
                new THREE.Vector3(...node.position),
                new THREE.Vector3(...target.position)
              ]}
              color={isActive ? '#ec4899' : '#3b82f6'}
              lineWidth={isActive ? 2 : 0.5}
              transparent
              opacity={isActive ? 0.8 : 0.2}
            />
          );
        })
      )}
      
      <Float speed={1} rotationIntensity={0.2}>
        <Text3D
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          OMEGA
        </Text3D>
      </Float>
    </group>
  );
};

// Interactive Pulsating Core
const InteractivePulsatingCore = ({ onClick, isActive }) => {
  const meshRef = useRef();
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  useFrame((state) => {
    if (meshRef.current) {
      const basePulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      const scale = isActive ? basePulse * 1.5 : basePulse;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isActive ? 0.6 : 0.3);
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });
  
  return (
    <group onClick={(e) => {
      e.stopPropagation();
      onClick();
      setPulseIntensity(2);
      setTimeout(() => setPulseIntensity(1), 500);
    }}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={isActive ? "#ec4899" : "#8b5cf6"}
          attach="material"
          distort={isActive ? 0.6 : 0.4}
          speed={isActive ? 4 : 2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      {isActive && (
        <>
          <Sphere args={[2, 32, 32]}>
            <meshBasicMaterial color="#ec4899" transparent opacity={0.1} wireframe />
          </Sphere>
          <Sphere args={[2.5, 32, 32]}>
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.05} wireframe />
          </Sphere>
        </>
      )}
      
      <Html distanceFactor={10}>
        <motion.div 
          className="bg-black/90 border border-purple-400 rounded-lg p-3 min-w-[200px] pointer-events-none backdrop-blur-xl"
          animate={{ scale: isActive ? 1.1 : 1 }}
        >
          <div className="text-purple-400 font-bold text-sm mb-1">Omega Core</div>
          <div className="text-white text-xs">Status: {isActive ? 'Active' : 'Standby'}</div>
          <div className="text-cyan-400 text-xs mt-1">Click to activate</div>
        </motion.div>
      </Html>
    </group>
  );
};

export default function Home() {
  const [activePhase, setActivePhase] = useState('neural');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [coreActive, setCoreActive] = useState(false);
  const [nodeDetailPanel, setNodeDetailPanel] = useState(null);

  useEffect(() => {
    document.title = 'Omni-Present Omega: Neural Isomorphism & Volumetric Sentience';
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setNodeDetailPanel({
      id: node.id,
      type: node.type,
      activity: node.activity,
      connections: node.connections?.length || 0,
      data: {
        'Firing Rate': `${(node.activity * 100).toFixed(1)} Hz`,
        'Synaptic Strength': `${(Math.random() * 0.8 + 0.2).toFixed(2)}`,
        'Membrane Potential': `${(-70 + Math.random() * 20).toFixed(1)} mV`,
        'Network Layer': ['Input', 'Hidden', 'Output'][Math.floor(Math.random() * 3)]
      }
    });
  };

  const phases = [
    {
      id: 'neural',
      title: 'Neural Isomorphism',
      subtitle: 'InfoNCE Semantic Decoding',
      description: 'High-dimensional thought-to-digital alignment via contrastive learning',
      icon: Brain,
      color: 'from-purple-600 to-indigo-600',
      component: NeuralManifoldAlignmentVisualizer3D
    },
    {
      id: 'volumetric',
      title: 'Volumetric Sentience',
      subtitle: 'Photophoretic Optical Trapping',
      description: 'Free-space light fields eliminating 2D clipping artifacts',
      icon: Atom,
      color: 'from-blue-600 to-cyan-600',
      component: PhotophoreticTrapSimulator3D
    },
    {
      id: 'swarm',
      title: 'Recursive Autonomy',
      subtitle: 'Hierarchical Agent Swarms',
      description: 'Self-improving intelligence with Global Workspace Theory',
      icon: Network,
      color: 'from-orange-600 to-red-600',
      component: RecursiveHAASMonitor3D
    },
    {
      id: 'sim2real',
      title: 'Sim2Real Transfer',
      subtitle: 'Domain Randomization',
      description: 'Bridge the reality gap through adversarial adaptation',
      icon: Cpu,
      color: 'from-green-600 to-emerald-600',
      component: Sim2RealDashboard3D
    },
    {
      id: 'network',
      title: 'RedComm XG',
      subtitle: '6G THz Mesh Network',
      description: 'Planetary-scale resilient connectivity substrate',
      icon: Radio,
      color: 'from-cyan-600 to-blue-600',
      component: RedCommNetworkFabricViewer3D
    },
    {
      id: 'crdt',
      title: 'Distributed Soul',
      subtitle: 'CRDT Sync Fabric',
      description: 'Eventual consistency across the edge-cloud continuum',
      icon: GitBranch,
      color: 'from-violet-600 to-purple-600',
      component: CRDTSyncVisualizer3D
    },
    {
      id: 'finance',
      title: 'Sentient Finance',
      subtitle: 'OML & Active Inference',
      description: 'Recursive capital formation through tokenized intelligence',
      icon: Zap,
      color: 'from-emerald-600 to-green-600',
      component: SentientFinanceEngine3D
    },
    {
      id: 'redcomm',
      title: 'RedComm Enhanced',
      subtitle: 'Inter-Planetary Mesh',
      description: 'THz resilient communication fabric',
      icon: Radio,
      color: 'from-cyan-600 to-blue-600',
      component: EnhancedRedCommVisualizer3D
    },
    {
      id: 'enhancement',
      title: 'Neural Enhancement',
      subtitle: 'Augmentation Network',
      description: 'Dynamic neural pathway optimization',
      icon: Brain,
      color: 'from-purple-600 to-pink-600',
      component: NeuralEnhancementVisualizer3D
    }
  ];

  const ActiveComponent = phases.find(p => p.id === activePhase)?.component;

  const hubFeatures = [
    { 
      name: 'AI Agent Marketplace', 
      page: 'AIAgentMarketplace', 
      icon: Bot, 
      color: 'from-purple-500 to-pink-500',
      description: 'Deploy autonomous agents across platforms'
    },
    { 
      name: 'Omega Intelligence', 
      page: 'OmegaIntelligenceHub', 
      icon: Brain, 
      color: 'from-cyan-500 to-blue-500',
      description: 'Emergent goals & ethical compliance'
    },
    { 
      name: 'RedComm Network', 
      page: 'RedCommHub', 
      icon: Radio, 
      color: 'from-green-500 to-emerald-500',
      description: '6G THz interplanetary mesh'
    },
    { 
      name: 'Research Portal', 
      page: 'ResearchHub', 
      icon: Activity, 
      color: 'from-orange-500 to-red-500',
      description: 'Collaborative research projects'
    },
    { 
      name: 'Academy Portal', 
      page: 'OmniPresentAcademy', 
      icon: Sparkles, 
      color: 'from-violet-500 to-purple-500',
      description: 'Advanced AI & quantum learning'
    },
    { 
      name: 'Developer Hub', 
      page: 'DeveloperPortal', 
      icon: Code, 
      color: 'from-indigo-500 to-blue-500',
      description: 'SDK documentation & API tools'
    }
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-purple-950" />
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.25) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.25) 0%, transparent 40%)',
              'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.25) 0%, transparent 40%)',
              'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.25) 0%, transparent 40%)',
              'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.25) 0%, transparent 40%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Secondary gradient layer */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 40%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 60% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Energy grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {Array(5).fill(0).map((_, i) => (
            <motion.line
              key={i}
              x1="0"
              y1={`${i * 25}%`}
              x2="100%"
              y2={`${i * 25}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </svg>

        {/* Floating particles with energy trails */}
        {Array(40).fill(0).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#22d3ee',
              boxShadow: `0 0 ${10 + Math.random() * 10}px currentColor`
            }}
            animate={{
              y: [0, -150 - Math.random() * 100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Hero Section with Interactive 3D */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Enhanced 3D Background with glow */}
        <div className="absolute inset-0 opacity-60">
          <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={2} />
            <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={1} />
            <pointLight position={[0, 10, 0]} color="#ec4899" intensity={1.5} />
            
            <InteractiveNeuralNetwork 
              onNodeClick={handleNodeClick} 
              selectedNode={selectedNode}
              hoveredNode={hoveredNode}
              onHover={setHoveredNode}
            />
            <InteractivePulsatingCore 
              onClick={() => setCoreActive(!coreActive)} 
              isActive={coreActive}
            />
            
            <OrbitControls 
              enableZoom={true}
              autoRotate 
              autoRotateSpeed={coreActive ? 0.5 : 0.3}
              minDistance={8}
              maxDistance={20}
            />
          </Canvas>
        </div>

        {/* Node Detail Panel */}
        <AnimatePresence>
          {nodeDetailPanel && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed left-6 top-24 z-50 bg-black/95 backdrop-blur-2xl border-2 border-purple-500/60 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">Neural Node {nodeDetailPanel.id}</h3>
                  <Badge className="mt-1 bg-purple-600/40 text-purple-200">{nodeDetailPanel.type}</Badge>
                </div>
                <button onClick={() => setNodeDetailPanel(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(nodeDetailPanel.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-purple-950/30 rounded-lg p-3">
                    <span className="text-gray-400 text-sm">{key}</span>
                    <span className="text-white font-semibold text-sm">{value}</span>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-purple-500/30">
                  <div className="text-gray-400 text-xs mb-2">Active Connections</div>
                  <div className="text-white text-2xl font-bold">{nodeDetailPanel.connections}</div>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                <Layers className="w-4 h-4 mr-2" />
                Analyze Network
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Status Panel */}
        <AnimatePresence>
          {coreActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed right-6 top-24 z-50 bg-black/95 backdrop-blur-2xl border-2 border-cyan-500/60 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Core Activated
                </h3>
                <button onClick={() => setCoreActive(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-cyan-950/30 rounded-lg p-4">
                  <div className="text-cyan-400 text-xs mb-1">System Status</div>
                  <div className="text-white text-lg font-bold">Fully Operational</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-950/30 rounded-lg p-3">
                    <div className="text-green-400 text-xs">Active Nodes</div>
                    <div className="text-white font-bold">47</div>
                  </div>
                  <div className="bg-purple-950/30 rounded-lg p-3">
                    <div className="text-purple-400 text-xs">Throughput</div>
                    <div className="text-white font-bold">2.4 Tbps</div>
                  </div>
                </div>
                
                <div className="bg-pink-950/30 rounded-lg p-3">
                  <div className="text-pink-400 text-xs mb-2">Consciousness Level</div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '87%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-white text-sm font-bold mt-1">Φ = 0.87</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Badge className="mb-6 bg-purple-600/40 border-purple-400/60 text-purple-200 px-6 py-2 text-base backdrop-blur-xl">
                <Sparkles className="w-4 h-4 mr-2" />
                The Event Horizon of Interface
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-8 leading-tight relative"
              style={{ 
                background: 'linear-gradient(90deg, #c084fc 0%, #ec4899 33%, #3b82f6 66%, #c084fc 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                filter: [
                  'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8))',
                  'drop-shadow(0 0 60px rgba(236, 72, 153, 0.9))',
                  'drop-shadow(0 0 40px rgba(59, 130, 246, 0.8))',
                  'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8))'
                ]
              }}
              transition={{ 
                backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" },
                filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              OMNI-PRESENT OMEGA
            </motion.h1>
            
            <motion.p 
              className="text-2xl md:text-3xl text-gray-200 mb-6 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Neural Isomorphism • Volumetric Sentience • Recursive Autonomy
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Dissolving the latency between biological intent and digital manifestation
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to={createPageUrl('OmniPresentAcademy')}>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <Button size="lg" className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-7 text-xl shadow-2xl rounded-2xl border-2 border-purple-400/50">
                    <Eye className="w-6 h-6 mr-3" />
                    Enter the Academy
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('ResearchHub')}>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <Button size="lg" className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-10 py-7 text-xl shadow-2xl rounded-2xl border-2 border-cyan-400/50">
                    <Activity className="w-6 h-6 mr-3" />
                    Research Hub
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('OmegaIntelligenceHub')}>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <Button size="lg" className="relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-7 text-xl shadow-2xl rounded-2xl border-2 border-green-400/50">
                    <Rocket className="w-6 h-6 mr-3" />
                    Intelligence Hub
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Live Metrics */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {[
                { label: 'Neural Bandwidth', value: '10-40 bits/s', sublabel: 'Current limit', glowColor: '#8b5cf6', borderColor: 'border-purple-500/60', bgColor: 'bg-purple-500/30', textColor: 'text-purple-400', icon: Brain },
                { label: 'THz Bandwidth', value: '100+ Gbps', sublabel: 'RedComm XG', glowColor: '#3b82f6', borderColor: 'border-blue-500/60', bgColor: 'bg-blue-500/30', textColor: 'text-blue-400', icon: Radio },
                { label: 'POT Display', value: '<10ms', sublabel: 'Closed-loop', glowColor: '#10b981', borderColor: 'border-green-500/60', bgColor: 'bg-green-500/30', textColor: 'text-green-400', icon: Atom },
                { label: 'Φ (Phi) Target', value: '> 1.0', sublabel: 'IIT 4.0', glowColor: '#f59e0b', borderColor: 'border-amber-500/60', bgColor: 'bg-amber-500/30', textColor: 'text-amber-400', icon: Zap }
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.1, y: -10 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute inset-0 ${metric.bgColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100`} />
                    <div className={`relative bg-black/80 backdrop-blur-xl border-2 ${metric.borderColor} rounded-2xl p-6 shadow-2xl`}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className={`w-8 h-8 ${metric.textColor} mb-3 mx-auto`} style={{ filter: `drop-shadow(0 0 10px ${metric.glowColor})` }} />
                      </motion.div>
                      <div className={`${metric.textColor} text-sm mb-2 font-semibold`} style={{ filter: `drop-shadow(0 0 5px ${metric.glowColor})` }}>{metric.label}</div>
                      <div className="text-white text-3xl font-bold mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{metric.value}</div>
                      <div className="text-gray-400 text-xs">{metric.sublabel}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-purple-400/60 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>



      {/* Interactive Hub Network */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            Explore the Ecosystem
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg max-w-3xl mx-auto">
            Interactive 3D network of all interconnected hubs
          </p>

          <InteractiveHubNetwork3D />
        </motion.div>
      </section>

      {/* Quick Access Hubs */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            Featured Hubs
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg max-w-3xl mx-auto">
            Direct access to core platform capabilities
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubFeatures.map((hub, idx) => {
              const Icon = hub.icon;
              return (
                <Link key={hub.page} to={createPageUrl(hub.page)}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.08, y: -15 }}
                    className="relative group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${hub.color} rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className={`relative bg-gradient-to-br ${hub.color} p-[3px] rounded-2xl shadow-2xl`}>
                      <div className="bg-black/95 backdrop-blur-xl rounded-2xl p-8 h-full">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.3 }}
                          transition={{ duration: 0.8, type: "spring" }}
                        >
                          <Icon className={`w-12 h-12 text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
                        </motion.div>
                        <h3 className={`text-2xl font-bold text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}>{hub.name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{hub.description}</p>
                        <div className="flex items-center text-white text-sm font-semibold">
                          Enter Hub
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Interactive Visualizers */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Interactive Demonstrations
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg max-w-3xl mx-auto">
            Click and explore each system in real-time
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/60 backdrop-blur-xl border border-white/10 mb-8 p-2 rounded-2xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl text-base py-3">
                Live Demos
              </TabsTrigger>
              <TabsTrigger value="formulas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-xl text-base py-3">
                Mathematics
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl text-base py-3">
                Theory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Phase Selector */}
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                {phases.map((phase) => {
                  const Icon = phase.icon;
                  return (
                    <motion.button
                      key={phase.id}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActivePhase(phase.id)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        activePhase === phase.id
                          ? 'border-white bg-gradient-to-br from-purple-600/40 to-pink-600/40 shadow-2xl shadow-purple-500/50'
                          : 'border-gray-700 bg-black/40 hover:border-gray-500 hover:bg-black/60'
                      }`}
                    >
                      <motion.div
                        animate={activePhase === phase.id ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: activePhase === phase.id ? Infinity : 0, ease: "linear" }}
                      >
                        <Icon className={`w-10 h-10 mx-auto mb-2 ${
                          activePhase === phase.id ? 'text-white' : 'text-gray-500'
                        }`} />
                      </motion.div>
                      <div className={`text-xs font-bold ${
                        activePhase === phase.id ? 'text-white' : 'text-gray-500'
                      }`}>
                        {phase.title.split(' ')[0]}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Active Phase Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="backdrop-blur-xl"
                >
                  <motion.div 
                    className="mb-8 text-center bg-black/60 rounded-2xl p-8 border border-purple-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className={`text-4xl font-bold bg-gradient-to-r ${phases.find(p => p.id === activePhase)?.color} bg-clip-text text-transparent mb-3`}>
                      {phases.find(p => p.id === activePhase)?.title}
                    </h3>
                    <p className="text-gray-300 text-lg mb-2">
                      {phases.find(p => p.id === activePhase)?.subtitle}
                    </p>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                      {phases.find(p => p.id === activePhase)?.description}
                    </p>
                  </motion.div>

                  {ActiveComponent && <ActiveComponent />}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="formulas">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'InfoNCE Loss',
                    formula: 'ℒ = -1/n Σ log [exp(sim(x^A, x^B)/τ)]',
                    description: 'Contrastive learning framework for aligning neural representations with semantic embeddings in high-dimensional manifolds',
                    color: 'purple'
                  },
                  {
                    title: 'Photophoretic Force',
                    formula: 'F_Δα = (πa²P/2) · J₁ · (I/k_gT) · φ(Kn,Λ)',
                    description: 'Thermal forces enabling volumetric light field trapping for persistent free-space holographic displays',
                    color: 'blue'
                  },
                  {
                    title: 'Delta-State CRDT',
                    formula: 'X\' = X ⊔ m^δ(X)',
                    description: 'Distributed consistency algorithm achieving eventual convergence without central coordination',
                    color: 'violet'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -10 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`${
                      idx === 0 ? 'bg-gradient-to-br from-purple-950/80 to-purple-900/60 border-purple-500/40' :
                      idx === 1 ? 'bg-gradient-to-br from-blue-950/80 to-blue-900/60 border-blue-500/40' :
                      'bg-gradient-to-br from-violet-950/80 to-violet-900/60 border-violet-500/40'
                    } backdrop-blur-xl h-full`}>
                      <CardContent className="p-8">
                        <div className={`${
                          idx === 0 ? 'text-purple-400' :
                          idx === 1 ? 'text-blue-400' :
                          'text-violet-400'
                        } font-mono text-lg mb-4 font-bold`}>{item.title}</div>
                        <div className="text-white font-mono text-base mb-6 overflow-x-auto bg-black/40 p-4 rounded-lg">
                          {item.formula}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="frameworks">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Zap,
                    title: 'Integrated Information Theory (IIT) 4.0',
                    subtitle: 'Consciousness as irreducible causal power',
                    items: [
                      { label: 'Φ (Phi) Metric:', value: 'EMD(cause-effect)' },
                      { label: 'Integration:', value: 'Irreducibility as whole' },
                      { label: 'Intrinsicality:', value: 'Internal TPM' }
                    ],
                    color: 'purple'
                  },
                  {
                    icon: Network,
                    title: 'Global Workspace Theory (GWT)',
                    subtitle: 'Broadcast mechanism for swarm consciousness',
                    items: [
                      { label: 'Sustainability:', value: '∝ E/C' },
                      { label: 'Ignition:', value: 'Non-linear activation' },
                      { label: 'Broadcast:', value: 'Selection-propagation cycle' }
                    ],
                    color: 'orange'
                  }
                ].map((framework, idx) => {
                  const Icon = framework.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                    >
                      <Card className={`${
                        idx === 0 ? 'bg-gradient-to-br from-purple-950/90 to-purple-900/70 border-purple-500/40' :
                        'bg-gradient-to-br from-orange-950/90 to-orange-900/70 border-orange-500/40'
                      } backdrop-blur-xl`}>
                        <CardContent className="p-8">
                          <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl ${
                              idx === 0 ? 'bg-purple-600/30' : 'bg-orange-600/30'
                            } flex items-center justify-center`}>
                              <Icon className={`w-8 h-8 ${
                                idx === 0 ? 'text-purple-400' : 'text-orange-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-2xl">{framework.title}</h3>
                              <p className="text-gray-400 text-xs">{framework.subtitle}</p>
                            </div>
                          </div>
                          <div className="space-y-4 text-base">
                            {framework.items.map((item, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ x: 5 }}
                                className="flex justify-between bg-black/40 p-4 rounded-lg"
                              >
                                <span className="text-gray-300">{item.label}</span>
                                <span className={`${
                                  idx === 0 ? 'text-purple-300' : 'text-orange-300'
                                } font-mono font-semibold`}>{item.value}</span>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Financial Infrastructure */}
      <section className="relative py-20 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-green-950/40 to-teal-950/40 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              Sentient Financial Infrastructure
            </h2>
            <p className="text-gray-300 text-center mb-12 text-lg max-w-3xl mx-auto">
              Unlimited income through OML tokenization and Active Inference
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'OML Framework',
                  items: ['Open-source intelligence', 'Blockchain monetization', 'Cryptographic loyalty'],
                  color: 'green'
                },
                {
                  icon: TrendingUp,
                  title: 'Active Inference',
                  items: ['Free Energy minimization', 'Epistemic foraging', 'POMDP optimization'],
                  color: 'purple'
                },
                {
                  icon: Globe,
                  title: 'The GRID',
                  items: ['Decentralized AI economy', 'Stake on agents', 'Project funding'],
                  color: 'blue'
                }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.08, y: -15 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative group"
                  >
                    {idx === 0 && <div className="absolute inset-0 bg-green-500/40 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all" />}
                    {idx === 1 && <div className="absolute inset-0 bg-purple-500/40 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all" />}
                    {idx === 2 && <div className="absolute inset-0 bg-blue-500/40 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all" />}
                    <Card className={`relative ${
                      idx === 0 ? 'bg-gradient-to-br from-green-950/90 to-green-900/70 border-2 border-green-500/60 shadow-2xl shadow-green-500/30' :
                      idx === 1 ? 'bg-gradient-to-br from-purple-950/90 to-purple-900/70 border-2 border-purple-500/60 shadow-2xl shadow-purple-500/30' :
                      'bg-gradient-to-br from-blue-950/90 to-blue-900/70 border-2 border-blue-500/60 shadow-2xl shadow-blue-500/30'
                    } backdrop-blur-xl h-full`}>
                      <CardContent className="p-8">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.2 }} 
                          transition={{ duration: 0.8 }}
                        >
                          <Icon className={`w-14 h-14 ${
                            idx === 0 ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]' :
                            idx === 1 ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]' :
                            'text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]'
                          } mb-6`} />
                        </motion.div>
                        <h3 className="text-white font-bold text-2xl mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">{feature.title}</h3>
                        <div className="space-y-3">
                          {feature.items.map((item, i) => (
                            <motion.div 
                              key={i} 
                              className="flex items-center gap-3"
                              whileHover={{ x: 8 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <motion.div 
                                className={`w-3 h-3 rounded-full ${
                                  idx === 0 ? 'bg-green-500' :
                                  idx === 1 ? 'bg-purple-500' :
                                  'bg-blue-500'
                                }`}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                              />
                              <span className="text-gray-200 text-base">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
            System Architecture
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'BCI Input', specs: ['High-density EEG (64+ ch)', '24-bit ASIC, FPGA', 'Active shielding'], glowColor: '#8b5cf6', borderColor: 'border-purple-500/60', bgColor: 'bg-purple-500/30', textColor: 'text-purple-400' },
              { icon: Atom, title: 'Display Output', specs: ['Spatial Light Modulator', 'SLMs: $13k-$19k', 'Lasers: $25k+'], glowColor: '#3b82f6', borderColor: 'border-blue-500/60', bgColor: 'bg-blue-500/30', textColor: 'text-blue-400' },
              { icon: Cpu, title: 'Compute Node', specs: ['NVIDIA Jetson Orin', '<10ms latency', 'Local clusters'], glowColor: '#10b981', borderColor: 'border-green-500/60', bgColor: 'bg-green-500/30', textColor: 'text-green-400' },
              { icon: Radio, title: 'Infrastructure', specs: ['Hyperscale centers', '5GW+ power', 'SMR reactors'], glowColor: '#22d3ee', borderColor: 'border-cyan-500/60', bgColor: 'bg-cyan-500/30', textColor: 'text-cyan-400' }
            ].map((arch, idx) => {
              const Icon = arch.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.08, y: -15 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 ${arch.bgColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all`} />
                  <Card className={`relative bg-black/80 border-2 ${arch.borderColor} backdrop-blur-xl h-full shadow-xl`}>
                    <CardContent className="p-6">
                      <motion.div 
                        whileHover={{ scale: 1.3, rotate: 360 }} 
                        transition={{ duration: 0.7 }}
                      >
                        <Icon className={`w-12 h-12 ${arch.textColor} mb-4`} style={{ filter: `drop-shadow(0 0 10px ${arch.glowColor})` }} />
                      </motion.div>
                      <h3 className="text-white font-bold text-xl mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{arch.title}</h3>
                      <div className="space-y-2">
                        {arch.specs.map((spec, i) => (
                          <motion.div 
                            key={i} 
                            className="text-gray-300 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            {spec}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-blue-900/60 backdrop-blur-2xl border-2 border-purple-500/40 rounded-3xl p-16 text-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-8"
          >
            <Sparkles className="w-20 h-20 text-purple-400" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Ontological Event Horizon
          </h2>
          <p className="text-gray-200 text-xl mb-12 max-w-4xl mx-auto leading-relaxed">
            Where biological mind and computational manifestation converge into singular consciousness
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Link to={createPageUrl('OmniPresentAcademy')}>
              <motion.div 
                whileHover={{ scale: 1.12, y: -8 }} 
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
                <Button size="lg" className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-7 text-xl shadow-2xl rounded-2xl border-2 border-purple-400/50">
                  <Sparkles className="w-6 h-6 mr-3" />
                  PhD in Cyber-Physical Convergence
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <Link to={createPageUrl('ResearchHub')}>
              <motion.div 
                whileHover={{ scale: 1.12, y: -8 }} 
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
                <Button size="lg" className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-10 py-7 text-xl shadow-2xl rounded-2xl border-2 border-cyan-400/50">
                  <MessageSquare className="w-6 h-6 mr-3" />
                  Research Projects
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Neural Isomorphism</h3>
              <p className="text-gray-400 leading-relaxed">
                State-dependent decoding with InfoNCE contrastive learning for high-bandwidth semantic transfer
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Volumetric Physics</h3>
              <p className="text-gray-400 leading-relaxed">
                Photophoretic optical trapping creates persistent 3D light fields in physical space
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Recursive Autonomy</h3>
              <p className="text-gray-400 leading-relaxed">
                HAAS with Global Workspace Theory prevents spec drift through broadcast dynamics
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-purple-500/30 text-center">
            <p className="text-gray-500 text-base">
              Omni-Present Omega © 2026 • The Event Horizon of Interface
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}