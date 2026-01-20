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
  Coins, Rocket, Globe, Brain, ChevronRight 
} from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Interactive3DStats from '../components/home/Interactive3DStats';
import EcosystemMap3D from '../components/home/EcosystemMap3D';
import OmniTokenEcosystem3D from '../components/3d/OmniTokenEcosystem3D';
import Tokenomics3DVisualizer from '../components/3d/Tokenomics3DVisualizer';
import InteractiveGlobe3D from '../components/home/InteractiveGlobe3D';
import FinancialGalaxy3DEnhanced from '../components/home/FinancialGalaxy3DEnhanced';
import AIEcosystemNetwork3D from '../components/home/AIEcosystemNetwork3D';
import RealtimeFeedsWidget from '../components/home/RealtimeFeedsWidget';
import HomeEnhanced3DSection from '../components/home/HomeEnhanced3DSection';
import DraggableFeatureCard from '../components/home/DraggableFeatureCard';
import RealtimeAgentActivityGlobe3D from '../components/home/RealtimeAgentActivityGlobe3D';
import EmergentBehaviorVisualizer3D from '../components/home/EmergentBehaviorVisualizer3D';
import AdaptiveTokenomicsDisplay3D from '../components/home/AdaptiveTokenomicsDisplay3D';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [features, setFeatures] = useState([
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Autonomous AI Agents',
      description: 'Self-learning agents that evolve, collaborate, and optimize',
      color: 'from-blue-500 to-cyan-500',
      link: '/AIManagement'
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'DeFi & Banking',
      description: 'Next-gen financial ecosystem with AI-driven risk management',
      color: 'from-green-500 to-emerald-500',
      link: '/EnhancedBankingHub'
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Cross-Chain Orchestration',
      description: 'Seamless multi-blockchain operations with intelligent routing',
      color: 'from-purple-500 to-pink-500',
      link: '/DecentralizedNetwork'
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
      title: 'Decentralized Governance',
      description: 'AI-driven proposals, voting, and automated enforcement',
      color: 'from-indigo-500 to-blue-500',
      link: '/AgentGovernance'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Portfolio Analytics',
      description: 'Comprehensive stress testing and cascading risk analysis',
      color: 'from-yellow-500 to-orange-500',
      link: '/DeFiRiskManagementSuite'
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
    { label: 'Active Agents', value: agents.length, icon: <Bot className="w-6 h-6" /> },
    { label: 'Collaborations', value: collaborations.length, icon: <Network className="w-6 h-6" /> },
    { label: 'Total Supply', value: '300M', icon: <Coins className="w-6 h-6" /> },
    { label: 'Platforms', value: '12+', icon: <Globe className="w-6 h-6" /> }
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
              Omni AI Ecosystem
            </h1>
            <p className="text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              An advanced platform for <span className="text-cyan-400 font-semibold">autonomous AI agents</span> that learn, collaborate, and evolve.
            </p>
            <p className="text-lg text-slate-400 mb-8 max-w-3xl mx-auto">
              Build intelligent multi-agent systems with emergent behaviors, orchestrate complex workflows, 
              run immersive simulations, and manage decentralized governance - all powered by cutting-edge AI and blockchain technology.
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

          {/* 3D Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-20"
          >
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <Interactive3DStats stats={stats} />
                </div>
              </CardContent>
            </Card>
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
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CardContent className="p-6">
                  <Bot className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">AI Agent Creation</h3>
                  <p className="text-white/70 text-sm">
                    Design autonomous agents with customizable personalities, goals, and learning parameters. Train them with your own datasets or use pre-built models.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <Network className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Multi-Agent Orchestration</h3>
                  <p className="text-white/70 text-sm">
                    Build complex workflows where agents collaborate, negotiate, and self-organize to achieve emergent goals without explicit instructions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardContent className="p-6">
                  <Brain className="w-12 h-12 text-orange-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Advanced Simulations</h3>
                  <p className="text-white/70 text-sm">
                    Run real-time collaborative simulations with physics engines, dynamic events, and what-if analysis tools for predictive modeling.
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

          {/* Ecosystem Map 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Agent Collaboration Network
            </h2>
            <p className="text-center text-slate-400 mb-8 text-lg">
              Visualize how agents interact, share knowledge, and form working groups
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <EcosystemMap3D agents={agents} collaborations={collaborations} />
                </div>
              </CardContent>
            </Card>
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



          {/* Emergent Behaviors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Emergent Behavior Detection
            </h2>
            <p className="text-center text-slate-400 mb-8 text-lg">
              Watch agents develop unexpected strategies and collaborative patterns
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <EmergentBehaviorVisualizer3D />
                </div>
              </CardContent>
            </Card>
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