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
            <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Autonomous agents. Decentralized governance. Cross-chain orchestration.
              <br />
              <span className="text-blue-400 font-semibold">The future of AI-driven automation is here.</span>
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

          {/* Ecosystem Map 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              AI Agent Ecosystem
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <EcosystemMap3D agents={agents} collaborations={collaborations} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Phase 1: Interactive Globe 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              Global Agent Activity
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <InteractiveGlobe3D agents={agents} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Phase 1: Financial Galaxy 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              Personal Financial Galaxy
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <FinancialGalaxy3DEnhanced />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Phase 1: AI Ecosystem Network */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              AI Ecosystem Network
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <AIEcosystemNetwork3D agents={agents} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Phase 1: Real-time Feeds Widget */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              Real-Time Activity Feed
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700 p-6">
              <CardContent className="p-0">
                <RealtimeFeedsWidget />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tokenomics 3D Visualizer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Omni Tokenomics
            </h2>
            <p className="text-center text-slate-400 mb-8 text-lg">
              300 Million Total Supply • Deflationary Mechanics • Staking Rewards
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[700px]">
                  <Tokenomics3DVisualizer />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Token Ecosystem 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              Omni Token Utility
            </h2>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <OmniTokenEcosystem3D />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced 3D Analytics Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white">
              Live Analytics & Insights
            </h2>
            <HomeEnhanced3DSection />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-purple-500/50">
              <CardContent className="py-16">
                <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                <h2 className="text-4xl font-bold mb-4 text-white">
                  Ready to Transform Your AI Operations?
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join the autonomous AI revolution. Deploy, orchestrate, and scale intelligent agents across platforms.
                </p>
                <Link to={createPageUrl('AIManagement')}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12">
                    Get Started Now
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}