import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Atom, 
  Network, 
  Waves, 
  Zap, 
  ArrowRight,
  Cpu,
  Radio,
  GitBranch,
  Sparkles,
  Eye,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text as Text3D } from '@react-three/drei';
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

// Neural network visualization for hero
const NeuralNetworkHero = () => {
  const groupRef = React.useRef();
  
  const nodes = Array(30).fill(0).map((_, i) => ({
    position: [
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4
    ],
    id: i
  }));
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {nodes.map((node, idx) => (
        <Sphere key={node.id} args={[0.08, 16, 16]} position={node.position}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5 + Math.sin((idx + Date.now() / 1000) * 2) * 0.3}
          />
        </Sphere>
      ))}
      
      {nodes.slice(0, 15).map((node, idx) => {
        const target = nodes[(idx + 1) % nodes.length];
        return (
          <Line
            key={`line_${idx}`}
            points={[
              new THREE.Vector3(...node.position),
              new THREE.Vector3(...target.position)
            ]}
            color="#3b82f6"
            lineWidth={0.5}
            transparent
            opacity={0.3}
          />
        );
      })}
    </group>
  );
};

export default function Home() {
  const [activePhase, setActivePhase] = useState('neural');

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
      id: 'neural',
      title: 'Neural Enhancement',
      subtitle: 'Augmentation Network',
      description: 'Dynamic neural pathway optimization',
      icon: Brain,
      color: 'from-purple-600 to-pink-600',
      component: NeuralEnhancementVisualizer3D
    }
  ];

  const ActiveComponent = phases.find(p => p.id === activePhase)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={1} />
            <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={0.5} />
            <NeuralNetworkHero />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-purple-600/30 border-purple-400/50 text-purple-200 px-4 py-1 text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              The Event Horizon of Interface
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                Omni-Present Omega
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              The Convergence of Neural Isomorphism, Volumetric Sentience, and Recursive Autonomy
            </p>
            
            <p className="text-md text-gray-400 mb-8 max-w-3xl mx-auto">
              Dissolving the latency between biological intent and digital manifestation through 
              high-fidelity BCI, photophoretic holography, and hierarchical agent swarms
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link to={createPageUrl('OmniPresentAcademy')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Eye className="w-5 h-5 mr-2" />
                  Enter the Academy
                </Button>
              </Link>
              <Link to={createPageUrl('ResearchHub')}>
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-950/50">
                  <Activity className="w-5 h-5 mr-2" />
                  Research Hub
                </Button>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4"
              >
                <div className="text-purple-400 text-xs mb-1">Neural Bandwidth</div>
                <div className="text-white text-2xl font-bold">10-40 bits/s</div>
                <div className="text-gray-500 text-[10px]">Current limit</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4"
              >
                <div className="text-blue-400 text-xs mb-1">THz Bandwidth</div>
                <div className="text-white text-2xl font-bold">100+ Gbps</div>
                <div className="text-gray-500 text-[10px]">RedComm XG</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-4"
              >
                <div className="text-green-400 text-xs mb-1">POT Display</div>
                <div className="text-white text-2xl font-bold">&lt;10ms</div>
                <div className="text-gray-500 text-[10px]">Closed-loop</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4"
              >
                <div className="text-amber-400 text-xs mb-1">Φ (Phi) Target</div>
                <div className="text-white text-2xl font-bold">&gt; 1.0</div>
                <div className="text-gray-500 text-[10px]">IIT 4.0</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mathematical Foundation Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Mathematical Substrate
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Unified architecture bridging differential geometry, thermodynamic physics, and distributed systems theory
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border-purple-500/30">
              <CardContent className="p-6">
                <div className="text-purple-400 font-mono text-sm mb-2">InfoNCE Loss</div>
                <div className="text-white font-mono text-xs mb-4 overflow-x-auto">
                  ℒ = -1/n Σ log [exp(sim(x^A, x^B)/τ)]
                </div>
                <p className="text-gray-400 text-xs">
                  Contrastive learning for neural-semantic alignment
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
              <CardContent className="p-6">
                <div className="text-blue-400 font-mono text-sm mb-2">Photophoretic Force</div>
                <div className="text-white font-mono text-xs mb-4 overflow-x-auto">
                  F_Δα = (πa²P/2) · J₁ · (I/k_gT) · φ(Kn,Λ)
                </div>
                <p className="text-gray-400 text-xs">
                  Thermal forces for volumetric light field trapping
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/30">
              <CardContent className="p-6">
                <div className="text-violet-400 font-mono text-sm mb-2">Delta-State CRDT</div>
                <div className="text-white font-mono text-xs mb-4 overflow-x-auto">
                  X' = X ⊔ m^δ(X)
                </div>
                <p className="text-gray-400 text-xs">
                  Distributed consistency without central coordination
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Phase Navigator */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            The Four Pillars of OPO
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Interactive demonstrations of the theoretical and engineering apex
          </p>

          {/* Phase Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <motion.button
                  key={phase.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    activePhase === phase.id
                      ? 'border-white bg-white/10'
                      : 'border-gray-700 bg-black/20 hover:border-gray-500'
                  }`}
                >
                  <Icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                    activePhase === phase.id ? 'text-white' : 'text-gray-500'
                  }`} />
                  <div className={`text-[10px] md:text-xs font-bold ${
                    activePhase === phase.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    {phase.title.split(' ')[0]}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Active Phase Display */}
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 text-center">
              <h3 className={`text-2xl font-bold bg-gradient-to-r ${phases.find(p => p.id === activePhase)?.color} bg-clip-text text-transparent mb-2`}>
                {phases.find(p => p.id === activePhase)?.title}
              </h3>
              <p className="text-gray-400 text-sm mb-1">
                {phases.find(p => p.id === activePhase)?.subtitle}
              </p>
              <p className="text-gray-500 text-xs max-w-2xl mx-auto">
                {phases.find(p => p.id === activePhase)?.description}
              </p>
            </div>

            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </motion.div>
      </section>

      {/* Theoretical Framework */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Theoretical Frameworks
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-indigo-950/70 to-purple-950/70 border-indigo-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Integrated Information Theory (IIT) 4.0</h3>
                    <p className="text-gray-400 text-xs">Consciousness as irreducible causal power</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Φ (Phi) Metric:</span>
                    <span className="text-purple-300 font-mono">EMD(cause-effect)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Integration:</span>
                    <span className="text-purple-300">Irreducibility as whole</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Intrinsicality:</span>
                    <span className="text-purple-300">Internal TPM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-950/70 to-red-950/70 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <Network className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Global Workspace Theory (GWT)</h3>
                    <p className="text-gray-400 text-xs">Broadcast mechanism for swarm consciousness</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sustainability:</span>
                    <span className="text-orange-300 font-mono">∝ E/C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ignition:</span>
                    <span className="text-orange-300">Non-linear activation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Broadcast:</span>
                    <span className="text-orange-300">Selection-propagation cycle</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Financial Infrastructure Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-gradient-to-r from-emerald-950/30 to-green-950/30">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Sentient Financial Infrastructure
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Unlimited income through OML tokenization and Active Inference in global markets
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-950/70 to-emerald-950/70 border-green-500/30">
              <CardContent className="p-6">
                <Zap className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">OML Framework</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-300">Open-source intelligence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-300">Blockchain monetization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="text-gray-300">Cryptographic loyalty</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/70 to-violet-950/70 border-purple-500/30">
              <CardContent className="p-6">
                <TrendingUp className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Active Inference</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Free Energy minimization</div>
                  <div>Epistemic foraging in markets</div>
                  <div>POMDP optimization</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-950/70 to-cyan-950/70 border-blue-500/30">
              <CardContent className="p-6">
                <Zap className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">The GRID</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Decentralized AI economy</div>
                  <div>Stake on favorite agents</div>
                  <div>Real-world project funding</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Technical Specifications */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            System Architecture
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-4">
                <Brain className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-white font-bold mb-2">BCI Input</h3>
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">High-density EEG (64+ ch)</div>
                  <div className="text-gray-400">24-bit ASIC, FPGA</div>
                  <div className="text-gray-400">Active shielding</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-blue-500/30">
              <CardContent className="p-4">
                <Atom className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-white font-bold mb-2">Display Output</h3>
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">Spatial Light Modulator</div>
                  <div className="text-gray-400">SLMs: $13k-$19k</div>
                  <div className="text-gray-400">Lasers: $25k+</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-500/30">
              <CardContent className="p-4">
                <Cpu className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-white font-bold mb-2">Compute Node</h3>
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">NVIDIA Jetson Orin</div>
                  <div className="text-gray-400">&lt;10ms latency</div>
                  <div className="text-gray-400">Local clusters</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-cyan-500/30">
              <CardContent className="p-4">
                <Radio className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-bold mb-2">Infrastructure</h3>
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">Hyperscale centers</div>
                  <div className="text-gray-400">5GW+ power</div>
                  <div className="text-gray-400">SMR reactors</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-blue-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Ontological Event Horizon
          </h2>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
            Where the distinction between biological mind and computational manifestation vanishes. 
            Organizations that synchronize differential geometry with global supply chain logistics 
            will define the cognitive landscape of the coming epoch.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('OmniPresentAcademy')}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                PhD in Cyber-Physical Convergence
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('ResearchHub')}>
              <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-950/50">
                Research Projects
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <section className="border-t border-purple-500/20 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-white font-bold mb-3">Neural Isomorphism</h3>
              <p className="text-gray-400 text-sm">
                State-dependent decoding with InfoNCE contrastive learning for high-bandwidth semantic transfer
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Volumetric Physics</h3>
              <p className="text-gray-400 text-sm">
                Photophoretic optical trapping creates persistent 3D light fields in physical space
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Recursive Autonomy</h3>
              <p className="text-gray-400 text-sm">
                HAAS with Global Workspace Theory prevents spec drift through broadcast dynamics
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-purple-500/20 text-center">
            <p className="text-gray-500 text-sm">
              Omni-Present Omega © 2026 • The Event Horizon of Interface
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}