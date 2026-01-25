import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Atom, 
  Network, 
  Zap, 
  ArrowRight,
  Cpu,
  Radio,
  GitBranch,
  Sparkles,
  Eye,
  Activity,
  Shield,
  TrendingUp,
  Globe,
  Rocket,
  Code,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text as Text3D, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
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

// Enhanced Interactive Neural Network
const InteractiveNeuralNetwork = ({ onNodeClick }) => {
  const groupRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const nodes = Array(50).fill(0).map((_, i) => ({
    position: [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    ],
    id: i,
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
      
      {nodes.map((node, idx) => (
        <Float key={node.id} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere 
            args={[hoveredNode === node.id ? 0.15 : 0.1, 24, 24]} 
            position={node.position}
            onClick={() => {
              setHoveredNode(node.id);
              onNodeClick?.(node);
            }}
            onPointerOver={() => setHoveredNode(node.id)}
            onPointerOut={() => setHoveredNode(null)}
          >
            <meshStandardMaterial
              color={hoveredNode === node.id ? '#ec4899' : '#8b5cf6'}
              emissive={hoveredNode === node.id ? '#ec4899' : '#8b5cf6'}
              emissiveIntensity={hoveredNode === node.id ? 1.2 : 0.6 + Math.sin((idx + Date.now() / 1000) * 2) * 0.3}
            />
          </Sphere>
        </Float>
      ))}
      
      {nodes.map((node, idx) => 
        node.connections.map((targetIdx, connIdx) => {
          const target = nodes[targetIdx];
          if (!target) return null;
          return (
            <Line
              key={`line_${idx}_${connIdx}`}
              points={[
                new THREE.Vector3(...node.position),
                new THREE.Vector3(...target.position)
              ]}
              color={hoveredNode === node.id || hoveredNode === target.id ? '#ec4899' : '#3b82f6'}
              lineWidth={hoveredNode === node.id || hoveredNode === target.id ? 1.5 : 0.5}
              transparent
              opacity={hoveredNode === node.id || hoveredNode === target.id ? 0.6 : 0.2}
            />
          );
        })
      )}
      
      <Text3D
        position={[0, 0, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        OMEGA
      </Text3D>
    </group>
  );
};

// Pulsating Core
const PulsatingCore = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

export default function Home() {
  const [activePhase, setActivePhase] = useState('neural');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    document.title = 'Omni-Present Omega: Neural Isomorphism & Volumetric Sentience';
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 overflow-hidden">
      {/* Hero Section with Interactive 3D */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced 3D Background */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={2} />
            <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={1} />
            <pointLight position={[0, 10, 0]} color="#ec4899" intensity={1.5} />
            
            <InteractiveNeuralNetwork onNodeClick={(node) => setSelectedNode(node)} />
            <PulsatingCore />
            
            <OrbitControls 
              enableZoom={true}
              autoRotate 
              autoRotateSpeed={0.3}
              minDistance={8}
              maxDistance={20}
            />
          </Canvas>
        </div>

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
              className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.5)",
                  "0 0 40px rgba(236, 72, 153, 0.7)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.5)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                OMNI-PRESENT OMEGA
              </span>
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
              Dissolving the latency between biological intent and digital manifestation through 
              high-fidelity BCI, photophoretic holography, and hierarchical agent swarms
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to={createPageUrl('OmniPresentAcademy')}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-2xl shadow-purple-500/50">
                    <Eye className="w-6 h-6 mr-3" />
                    Enter the Academy
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('ResearchHub')}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="border-2 border-purple-400/60 text-purple-200 hover:bg-purple-900/40 backdrop-blur-xl px-8 py-6 text-lg">
                    <Activity className="w-6 h-6 mr-3" />
                    Research Hub
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('OmegaIntelligenceHub')}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-2xl shadow-cyan-500/50">
                    <Rocket className="w-6 h-6 mr-3" />
                    Intelligence Hub
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
                { label: 'Neural Bandwidth', value: '10-40 bits/s', sublabel: 'Current limit', color: 'purple' },
                { label: 'THz Bandwidth', value: '100+ Gbps', sublabel: 'RedComm XG', color: 'blue' },
                { label: 'POT Display', value: '<10ms', sublabel: 'Closed-loop', color: 'green' },
                { label: 'Φ (Phi) Target', value: '> 1.0', sublabel: 'IIT 4.0', color: 'amber' }
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`bg-black/60 backdrop-blur-xl border border-${metric.color}-500/40 rounded-2xl p-6 shadow-lg`}
                >
                  <div className={`text-${metric.color}-400 text-sm mb-2 font-semibold`}>{metric.label}</div>
                  <div className="text-white text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-gray-500 text-xs">{metric.sublabel}</div>
                </motion.div>
              ))}
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

      {/* Quick Access Hubs */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Sentient Platform Access
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg max-w-3xl mx-auto">
            Navigate through interconnected intelligence hubs
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
                    whileHover={{ scale: 1.05, y: -10 }}
                    className={`bg-gradient-to-br ${hub.color} p-[2px] rounded-2xl shadow-2xl`}
                  >
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-8 h-full">
                      <Icon className="w-12 h-12 text-white mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-3">{hub.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{hub.description}</p>
                      <div className="flex items-center text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
                        Enter Hub
                        <ArrowRight className="w-4 h-4 ml-2" />
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
            Mathematical Substrate
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg max-w-3xl mx-auto">
            Unified architecture bridging differential geometry, thermodynamic physics, and distributed systems theory
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/60 backdrop-blur-xl border border-white/10 mb-8">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="formulas" className="data-[state=active]:bg-blue-600">
                Formulas
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="data-[state=active]:bg-green-600">
                Frameworks
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
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActivePhase(phase.id)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        activePhase === phase.id
                          ? 'border-white bg-white/20 shadow-2xl shadow-purple-500/50'
                          : 'border-gray-700 bg-black/40 hover:border-gray-500 hover:bg-black/60'
                      }`}
                    >
                      <Icon className={`w-10 h-10 mx-auto mb-2 ${
                        activePhase === phase.id ? 'text-white' : 'text-gray-500'
                      }`} />
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
                  <div className="mb-8 text-center bg-black/60 rounded-2xl p-8 border border-purple-500/30">
                    <h3 className={`text-4xl font-bold bg-gradient-to-r ${phases.find(p => p.id === activePhase)?.color} bg-clip-text text-transparent mb-3`}>
                      {phases.find(p => p.id === activePhase)?.title}
                    </h3>
                    <p className="text-gray-300 text-lg mb-2">
                      {phases.find(p => p.id === activePhase)?.subtitle}
                    </p>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                      {phases.find(p => p.id === activePhase)?.description}
                    </p>
                  </div>

                  {ActiveComponent && <ActiveComponent />}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="formulas">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-purple-950/80 to-indigo-950/80 border-purple-500/40 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="text-purple-400 font-mono text-lg mb-4 font-bold">InfoNCE Loss</div>
                    <div className="text-white font-mono text-base mb-6 overflow-x-auto bg-black/40 p-4 rounded-lg">
                      ℒ = -1/n Σ log [exp(sim(x^A, x^B)/τ)]
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Contrastive learning framework for aligning neural representations with semantic embeddings in high-dimensional manifolds
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-950/80 to-cyan-950/80 border-blue-500/40 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="text-blue-400 font-mono text-lg mb-4 font-bold">Photophoretic Force</div>
                    <div className="text-white font-mono text-base mb-6 overflow-x-auto bg-black/40 p-4 rounded-lg">
                      F_Δα = (πa²P/2) · J₁ · (I/k_gT) · φ(Kn,Λ)
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Thermal forces enabling volumetric light field trapping for persistent free-space holographic displays
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-950/80 to-fuchsia-950/80 border-violet-500/40 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="text-violet-400 font-mono text-lg mb-4 font-bold">Delta-State CRDT</div>
                    <div className="text-white font-mono text-base mb-6 overflow-x-auto bg-black/40 p-4 rounded-lg">
                      X' = X ⊔ m^δ(X)
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Distributed consistency algorithm achieving eventual convergence without central coordination
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="frameworks">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border-indigo-500/40 backdrop-blur-xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/30 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-2xl">Integrated Information Theory (IIT) 4.0</h3>
                          <p className="text-gray-400 text-sm">Consciousness as irreducible causal power</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-base">
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Φ (Phi) Metric:</span>
                          <span className="text-purple-300 font-mono font-semibold">EMD(cause-effect)</span>
                        </div>
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Integration:</span>
                          <span className="text-purple-300 font-semibold">Irreducibility as whole</span>
                        </div>
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Intrinsicality:</span>
                          <span className="text-purple-300 font-semibold">Internal TPM</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-orange-950/90 to-red-950/90 border-orange-500/40 backdrop-blur-xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-orange-600/30 flex items-center justify-center">
                          <Network className="w-8 h-8 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-2xl">Global Workspace Theory (GWT)</h3>
                          <p className="text-gray-400 text-sm">Broadcast mechanism for swarm consciousness</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-base">
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Sustainability:</span>
                          <span className="text-orange-300 font-mono font-semibold">∝ E/C</span>
                        </div>
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Ignition:</span>
                          <span className="text-orange-300 font-semibold">Non-linear activation</span>
                        </div>
                        <div className="flex justify-between bg-black/40 p-4 rounded-lg">
                          <span className="text-gray-300">Broadcast:</span>
                          <span className="text-orange-300 font-semibold">Selection-propagation cycle</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Financial Infrastructure */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-950/40 to-green-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              Sentient Financial Infrastructure
            </h2>
            <p className="text-gray-400 text-center mb-12 text-lg max-w-3xl mx-auto">
              Unlimited income through OML tokenization and Active Inference in global markets
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'OML Framework',
                  items: [
                    'Open-source intelligence',
                    'Blockchain monetization',
                    'Cryptographic loyalty'
                  ],
                  color: 'green'
                },
                {
                  icon: TrendingUp,
                  title: 'Active Inference',
                  items: [
                    'Free Energy minimization',
                    'Epistemic foraging in markets',
                    'POMDP optimization'
                  ],
                  color: 'purple'
                },
                {
                  icon: Globe,
                  title: 'The GRID',
                  items: [
                    'Decentralized AI economy',
                    'Stake on favorite agents',
                    'Real-world project funding'
                  ],
                  color: 'blue'
                }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -10 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <Card className={`bg-gradient-to-br from-${feature.color}-950/80 to-${feature.color}-900/60 border-${feature.color}-500/40 backdrop-blur-xl h-full`}>
                      <CardContent className="p-8">
                        <Icon className={`w-14 h-14 text-${feature.color}-400 mb-6`} />
                        <h3 className="text-white font-bold text-2xl mb-6">{feature.title}</h3>
                        <div className="space-y-3">
                          {feature.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${feature.color}-500`} />
                              <span className="text-gray-300 text-base">{item}</span>
                            </div>
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
              {
                icon: Brain,
                title: 'BCI Input',
                specs: ['High-density EEG (64+ ch)', '24-bit ASIC, FPGA', 'Active shielding'],
                color: 'purple'
              },
              {
                icon: Atom,
                title: 'Display Output',
                specs: ['Spatial Light Modulator', 'SLMs: $13k-$19k', 'Lasers: $25k+'],
                color: 'blue'
              },
              {
                icon: Cpu,
                title: 'Compute Node',
                specs: ['NVIDIA Jetson Orin', '<10ms latency', 'Local clusters'],
                color: 'green'
              },
              {
                icon: Radio,
                title: 'Infrastructure',
                specs: ['Hyperscale centers', '5GW+ power', 'SMR reactors'],
                color: 'cyan'
              }
            ].map((arch, idx) => {
              const Icon = arch.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`bg-black/60 border-${arch.color}-500/40 backdrop-blur-xl h-full`}>
                    <CardContent className="p-6">
                      <Icon className={`w-12 h-12 text-${arch.color}-400 mb-4`} />
                      <h3 className="text-white font-bold text-xl mb-4">{arch.title}</h3>
                      <div className="space-y-2">
                        {arch.specs.map((spec, i) => (
                          <div key={i} className="text-gray-400 text-sm">{spec}</div>
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
            Where the distinction between biological mind and computational manifestation vanishes. 
            Organizations that synchronize differential geometry with global supply chain logistics 
            will define the cognitive landscape of the coming epoch.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Link to={createPageUrl('OmniPresentAcademy')}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-7 text-xl shadow-2xl shadow-purple-500/50">
                  PhD in Cyber-Physical Convergence
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <Link to={createPageUrl('ResearchHub')}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-2 border-purple-400/60 text-purple-200 hover:bg-purple-900/50 backdrop-blur-xl px-10 py-7 text-xl">
                  Research Projects
                  <MessageSquare className="w-6 h-6 ml-3" />
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