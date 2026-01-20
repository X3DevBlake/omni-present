import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Shield, TrendingUp, Bot, Network, 
  Coins, Rocket, Globe, Brain, ChevronRight, Radio, Map 
} from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniPresent3DLogo from '../components/home/OmniPresent3DLogo';
import PhysicalAgentShowcase3D from '../components/home/PhysicalAgentShowcase3D';
import SpatialProjectionCanvas3D from '../components/omnipresence/SpatialProjectionCanvas3D';
import DraggableFeatureCard from '../components/home/DraggableFeatureCard';
import AdaptiveTokenomicsDisplay3D from '../components/home/AdaptiveTokenomicsDisplay3D';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [features, setFeatures] = useState([
    {
      icon: <Radio className="w-8 h-8" />,
      title: '3D Holographic Agents',
      description: 'Physical projections that move through your home and interact with your world',
      color: 'from-cyan-500 to-blue-500',
      link: '/OmniPresenceControlCenter'
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: 'Spatial Intelligence',
      description: 'AI-powered mapping and navigation in your physical environment',
      color: 'from-purple-500 to-pink-500',
      link: '/OmniPresenceControlCenter'
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Autonomous AI Agents',
      description: 'Self-learning agents that evolve, collaborate, and optimize',
      color: 'from-blue-500 to-cyan-500',
      link: '/AIManagement'
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Multi-Device Coordination',
      description: 'Seamless agent transitions across all your Omni devices',
      color: 'from-green-500 to-emerald-500',
      link: '/OmniPresenceControlCenter'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Advanced Simulations',
      description: 'Real-world economic models and emergent behavior prediction',
      color: 'from-orange-500 to-red-500',
      link: '/SimulationLab'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Security & Intelligence',
      description: 'Threat detection, compliance monitoring, and predictive analytics',
      color: 'from-indigo-500 to-blue-500',
      link: '/SecurityIntelligenceHub'
    }
  ]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.filter({}).limit(100),
    initialData: []
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations'],
    queryFn: () => base44.entities.AgentCollaboration.filter({}).limit(50),
    initialData: []
  });

  const { data: presences = [] } = useQuery({
    queryKey: ['agent-presences'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({}).limit(20),
    initialData: []
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['omni-devices'],
    queryFn: () => base44.entities.OmniDevice.filter({}).limit(20),
    initialData: []
  });

  const { data: spatialMaps = [] } = useQuery({
    queryKey: ['spatial-maps'],
    queryFn: () => base44.entities.SpatialMap.filter({}).limit(10),
    initialData: []
  });

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null) return;
    const newFeatures = [...features];
    const draggedFeature = newFeatures[draggedIndex];
    newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(index, 0, draggedFeature);
    setFeatures(newFeatures);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Physical Projections', value: presences.filter(p => p.projection_status === 'active').length, icon: <Bot className="w-6 h-6" /> },
    { label: 'Omni Devices', value: devices.filter(d => d.online_status).length, icon: <Radio className="w-6 h-6" /> },
    { label: 'Spatial Maps', value: spatialMaps.length, icon: <Map className="w-6 h-6" /> },
    { label: 'Real-World Ready', value: agents.length, icon: <Zap className="w-6 h-6" /> }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 px-6 py-2 text-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Next-Generation AI Platform
            </Badge>
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </h1>
            <p className="text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Where Your AI Agents <span className="text-cyan-400 font-semibold">Come to Life</span>
            </p>
            <p className="text-lg text-slate-400 mb-8 max-w-4xl mx-auto">
              Experience the future with autonomous digital projections that physically move and interact within your real-world environment. Design, deploy, and manage your personalized 3D agents as they seamlessly blend with your home or workspace, making your digital world truly Omni-Present.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl('AIManagement')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  Launch Platform
                  <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('OmniStaking')}>
                <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 text-lg px-8">
                  Explore Tokenomics
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* 3D Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <OmniPresent3DLogo />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Physical Agent Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Agents That Live in Your Space
            </h2>
            <p className="text-center text-slate-400 mb-6 text-lg">
              Watch your AI agents materialize as 3D holograms in your home
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <PhysicalAgentShowcase3D />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Real-time Spatial Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Live Spatial Projection Map
            </h2>
            <p className="text-center text-slate-400 mb-6 text-lg">
              See your agents moving in real-time across your physical environment
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <SpatialProjectionCanvas3D
                    presences={presences}
                    devices={devices}
                    spatialMaps={spatialMaps}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20"
          >
            {stats.map((stat, idx) => (
              <Card key={idx} className="bg-slate-900/60 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3 text-cyan-400">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Features Grid with Drag & Drop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            {features.map((feature, idx) => (
              <DraggableFeatureCard
                key={idx}
                feature={feature}
                index={idx}
                isDragging={draggedIndex === idx}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </motion.div>

          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Comprehensive AI Agent Platform
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg max-w-3xl mx-auto">
              Everything you need to build, deploy, and manage intelligent autonomous systems
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-6">
                  <Radio className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Physical Agent Projection</h3>
                  <p className="text-white/70 text-sm">
                    Deploy agents as 3D holographic projections in your physical space. They navigate autonomously, avoid obstacles, and interact with the real world.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <Map className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Spatial Intelligence Mapping</h3>
                  <p className="text-white/70 text-sm">
                    Upload 3D scans of your space. AI automatically detects furniture, people, pets, and creates optimal navigation paths for your agents.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardContent className="p-6">
                  <Zap className="w-12 h-12 text-orange-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Adaptive Learning Agents</h3>
                  <p className="text-white/70 text-sm">
                    Agents learn from every interaction, adapting their behavior based on your environment, schedule, and preferences automatically.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-6">
                  <Coins className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">DeFi Integration</h3>
                  <p className="text-white/70 text-sm">
                    Autonomous trading bots, yield optimization, liquidity management, and cross-chain arbitrage - all powered by AI decision-making.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-6">
                  <Shield className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Decentralized Governance</h3>
                  <p className="text-white/70 text-sm">
                    DAO proposals, automated voting, transparent decision-making, and blockchain-verified transactions across multiple chains.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <CardContent className="p-6">
                  <TrendingUp className="w-12 h-12 text-yellow-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Performance Analytics</h3>
                  <p className="text-white/70 text-sm">
                    Real-time monitoring, anomaly detection, predictive alerts, and comprehensive analytics dashboards for all your AI operations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Omni Devices Showcase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Your Omni Device Ecosystem
            </h2>
            <p className="text-center text-slate-400 mb-8 text-lg">
              Connect holographic projectors, AR glasses, smart displays, and more
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'holographic_projector', name: 'Holographic Projector', desc: 'Full 3D agent projection with spatial audio' },
                { type: 'ar_glasses', name: 'AR Glasses', desc: 'Personal agent visibility wherever you go' },
                { type: 'smart_tv', name: 'Smart Display', desc: 'Large-scale agent interaction screens' },
                { type: 'smart_mirror', name: 'Smart Mirror', desc: 'Agents appear beside you in mirrors' },
                { type: 'projection_drone', name: 'Projection Drone', desc: 'Mobile holographic projection following you' },
                { type: 'robotic_assistant', name: 'Robotic Platform', desc: 'Agents control physical robot bodies' }
              ].map((device, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-cyan-500/30 hover:border-cyan-500 transition-all">
                  <CardContent className="p-6">
                    <Radio className="w-10 h-10 text-cyan-400 mb-3" />
                    <h3 className="text-white font-bold text-lg mb-2">{device.name}</h3>
                    <p className="text-slate-400 text-sm">{device.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Key Capabilities */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Powered by Advanced Technologies
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              Enterprise-grade infrastructure for mission-critical AI operations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-500/20 rounded-lg p-3">
                      <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Machine Learning & Training</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Complete model lifecycle management with version control, automated monitoring, and performance tracking. Deploy models as agents with one click.
                      </p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• Custom dataset training</li>
                        <li>• Automated hyperparameter tuning</li>
                        <li>• Model marketplace integration</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-500/20 rounded-lg p-3">
                      <Network className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Agent Collaboration</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Agents autonomously form working groups, negotiate solutions, and coordinate complex multi-agent workflows with emergent goal achievement.
                      </p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• Real-time agent communication</li>
                        <li>• Autonomous role assignment</li>
                        <li>• Shared knowledge repositories</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500/20 rounded-lg p-3">
                      <Globe className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Immersive Simulations</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Run multiplayer simulations with real-time interventions, what-if analysis, and physics-based environments for accurate modeling.
                      </p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• Custom scenario designer</li>
                        <li>• Environmental factor configuration</li>
                        <li>• Export data for external analysis</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <Shield className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Blockchain & DeFi</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Cross-chain asset management, decentralized governance, automated trading strategies, and transparent on-chain verification.
                      </p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• Multi-chain wallet integration</li>
                        <li>• Yield farming optimization</li>
                        <li>• DAO voting and proposals</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>



          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              How Omni-Present Works
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              Four simple steps to bring your AI agents to life
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900/60 border-cyan-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-cyan-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-cyan-400 text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">Create Agent</h3>
                  <p className="text-slate-400 text-sm">Design your AI with personality, skills, and goals</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-400 text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">Map Your Space</h3>
                  <p className="text-slate-400 text-sm">Upload 3D scans or let AI auto-map your environment</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-pink-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-pink-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-pink-400 text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">Deploy Projection</h3>
                  <p className="text-slate-400 text-sm">Activate holographic projection on your Omni devices</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-400 text-2xl font-bold">4</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">Agent Lives</h3>
                  <p className="text-slate-400 text-sm">Watch your agent move, learn, and assist in real-time</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Tokenomics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Omni Token Ecosystem
            </h2>
            <p className="text-center text-slate-400 mb-8 text-lg">
              Stake, govern, and earn rewards in our decentralized economy
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-6">
                <AdaptiveTokenomicsDisplay3D />
              </CardContent>
            </Card>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Real-World Applications
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              See how organizations use Omni to revolutionize their operations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-cyan-500/30">
                <CardContent className="p-6">
                  <h3 className="text-cyan-400 font-bold text-lg mb-3">Financial Services</h3>
                  <p className="text-white/70 text-sm">
                    Hedge funds use our autonomous trading agents for 24/7 market monitoring, risk assessment, and portfolio optimization across multiple chains.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-purple-400 font-bold text-lg mb-3">Research & Development</h3>
                  <p className="text-white/70 text-sm">
                    Labs leverage our simulation platform to model complex systems, test hypotheses, and predict emergent behaviors before real-world deployment.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-orange-500/30">
                <CardContent className="p-6">
                  <h3 className="text-orange-400 font-bold text-lg mb-3">Enterprise Automation</h3>
                  <p className="text-white/70 text-sm">
                    Companies deploy agent teams that self-organize to handle customer support, data analysis, and workflow optimization with minimal oversight.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-purple-500/50">
              <CardContent className="py-16">
                <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Start Building with Omni Today
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Create your first autonomous agent, design custom simulations, or explore our AI Labs - all with no-code tools and enterprise-grade infrastructure.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to={createPageUrl('AIManagement')}>
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12">
                      Launch Platform
                      <Rocket className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl('AgentOrchestrationHub')}>
                    <Button size="lg" variant="outline" className="border-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/20 text-lg px-12">
                      View Orchestration
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}