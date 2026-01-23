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
  Coins, Globe, Brain, Radio, Map, Cpu, Activity, User
} from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedOmniText3D from '../components/omnipresence/EnhancedOmniText3D';
import AdvancedAgentSpaceVisualizer3D from '../components/omnipresence/AdvancedAgentSpaceVisualizer3D';
import EnhancedSpatialProjectionMap3D from '../components/omnipresence/EnhancedSpatialProjectionMap3D';
import OmniDeviceGrid from '../components/home/OmniDeviceGrid';
import DraggableFeatureCard from '../components/home/DraggableFeatureCard';
import OmniLoopLogo3D from '../components/omnipresence/OmniLoopLogo3D';
import NeuralChipBlueprint3D from '../components/body/NeuralChipBlueprint3D';
import CollaborativeLearningNetwork3D from '../components/learning/CollaborativeLearningNetwork3D';
import OmegaSentientShowcase3D from '../components/home/OmegaSentientShowcase3D';
import UnifiedEcosystemHologram3D from '../components/ecosystem/UnifiedEcosystemHologram3D';
import ConsciousnessTransferVisualizer3D from '../components/consciousness/ConsciousnessTransferVisualizer3D';
import NeuralLinkVisualizer3D from '../components/consciousness/NeuralLinkVisualizer3D';
import DeviceOptimizationVisualizer3D from '../components/devices/DeviceOptimizationVisualizer3D';
import EthicalReasoningVisualizer3D from '../components/companions/EthicalReasoningVisualizer3D';
import BiometricAdaptiveVisualizer3D from '../components/augmentations/BiometricAdaptiveVisualizer3D';
import OmegaEcosystemStats from '../components/home/OmegaEcosystemStats';
import LiveCriticalEventsTimeline from '../components/home/LiveCriticalEventsTimeline';
import RealTimeDataFlowAnimation from '../components/home/RealTimeDataFlowAnimation';
import SelfHealingDeviceVisualizer3D from '../components/devices/SelfHealingDeviceVisualizer3D';
import InteractiveEcosystemGlobe3D from '../components/home/InteractiveEcosystemGlobe3D';
import PredictiveInsightCards from '../components/home/PredictiveInsightCards';
import OmegaConsciousnessNetwork3D from '../components/home/OmegaConsciousnessNetwork3D';
import AutonomousAgentActivityFeed3D from '../components/home/AutonomousAgentActivityFeed3D';
import OmegaSentientCoreVisualizer3D from '../components/sentient/OmegaSentientCoreVisualizer3D';
import MultiLayerConsciousnessVisualizer3D from '../components/home/MultiLayerConsciousnessVisualizer3D';
import EmergentIntelligenceMatrix3D from '../components/home/EmergentIntelligenceMatrix3D';
import ProactiveEmotionalSupport3D from '../components/companions/ProactiveEmotionalSupport3D';
import AutonomousWealthOrchestrator3D from '../components/financial/AutonomousWealthOrchestrator3D';
import SkillEvolutionTimeline3D from '../components/agents/SkillEvolutionTimeline3D';
import AdvancedNeuralPathwayVisualizer3D from '../components/neural/AdvancedNeuralPathwayVisualizer3D';
import NanoAgentSwarmVisualizer3D from '../components/augmentation/NanoAgentSwarmVisualizer3D';
import HolographicAgentProjector3D from '../components/holographic/HolographicAgentProjector3D';
import RealTimePortfolioGalaxy3D from '../components/wealth/RealTimePortfolioGalaxy3D';
import EmergentIntelligenceVisualizer3D from '../components/learning/EmergentIntelligenceVisualizer3D';
import ThoughtCommandVisualizer3D from '../components/consciousness/ThoughtCommandVisualizer3D';
import BiometricHealthDashboard3D from '../components/biometric/BiometricHealthDashboard3D';
import AutonomousAgentCollaboration3D from '../components/collaboration/AutonomousAgentCollaboration3D';
import ThreatIntelligenceMatrix3D from '../components/security/ThreatIntelligenceMatrix3D';
import UnifiedEcosystemHealth3D from '../components/ecosystem/UnifiedEcosystemHealth3D';
import AdaptiveLearningPath3D from '../components/learning/AdaptiveLearningPath3D';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [features, setFeatures] = useState([
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Neural Brain Chip',
      description: 'Direct consciousness integration - control your body with Omni-Present AI',
      color: 'from-pink-500 to-orange-500',
      link: '/PhysicalAugmentationHub'
    },
    {
      icon: <User className="w-8 h-8" />,
      title: 'Body Augmentations',
      description: 'Agents navigate through your body with nano-pathways and neural interfaces',
      color: 'from-orange-500 to-red-500',
      link: '/PhysicalAugmentationHub'
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: '3D Holographic Agents',
      description: 'Physical projections that move through your home and interact with your world',
      color: 'from-cyan-500 to-blue-500',
      link: '/OmniPresenceControlCenter'
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Omega Financial Intelligence',
      description: 'Sentient AI advisor with autonomous wealth strategies and DeFi orchestration',
      color: 'from-emerald-500 to-green-500',
      link: '/OmegaFinancialHub'
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Learning Guilds',
      description: 'Agents form collaborative networks with emergent collective intelligence',
      color: 'from-purple-500 to-pink-500',
      link: '/OmegaSentientHub'
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Omega Sentient Core',
      description: 'Universal consciousness orchestration with predictive intelligence',
      color: 'from-indigo-500 to-purple-500',
      link: '/OmegaSentientHub'
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

  const { data: neuralChips = [] } = useQuery({
    queryKey: ['neural-chips-home'],
    queryFn: () => base44.entities.NeuralBrainChip.list('-created_date', 10),
    initialData: []
  });

  const { data: augmentations = [] } = useQuery({
    queryKey: ['augmentations-home'],
    queryFn: () => base44.entities.PhysicalBodyAugmentation.list('-created_date', 20),
    initialData: []
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds-home'],
    queryFn: () => base44.entities.AgentLearningGuild.list('-created_date', 10),
    initialData: []
  });

  const { data: neuralMaps = [] } = useQuery({
    queryKey: ['neural-maps'],
    queryFn: () => base44.entities.NeuralPathwayMap.list('-created_date', 5),
    initialData: []
  });

  const { data: nanoSwarms = [] } = useQuery({
    queryKey: ['nano-swarms'],
    queryFn: () => base44.entities.NanoAgentSwarm.list('-created_date', 5),
    initialData: []
  });

  const { data: holographicSessions = [] } = useQuery({
    queryKey: ['holographic-sessions'],
    queryFn: () => base44.entities.HolographicProjectionSession.filter({ session_status: 'active' }),
    initialData: []
  });

  const { data: marketSignals = [] } = useQuery({
    queryKey: ['market-signals'],
    queryFn: () => base44.entities.RealTimeMarketSignal.list('-created_date', 10),
    initialData: []
  });

  const { data: wealthStrategies = [] } = useQuery({
    queryKey: ['wealth-strategies'],
    queryFn: () => base44.entities.WealthAutomationStrategy.filter({ is_active: true }),
    initialData: []
  });

  const { data: emergentEvents = [] } = useQuery({
    queryKey: ['emergent-events'],
    queryFn: () => base44.entities.EmergentIntelligenceEvent.list('-created_date', 10),
    initialData: []
  });

  const { data: thoughtCommands = [] } = useQuery({
    queryKey: ['thought-commands'],
    queryFn: () => base44.entities.ThoughtCommandLog.list('-created_date', 20),
    initialData: []
  });

  const { data: biometricData = [] } = useQuery({
    queryKey: ['biometric-streams'],
    queryFn: () => base44.entities.BiometricDataStream.list('-created_date', 5),
    initialData: []
  });

  const { data: agentCollaborations = [] } = useQuery({
    queryKey: ['agent-collaborations'],
    queryFn: () => base44.entities.AutonomousAgentCollaboration.filter({ collaboration_status: 'active' }),
    initialData: []
  });

  const { data: threatIntel = [] } = useQuery({
    queryKey: ['threat-intelligence'],
    queryFn: () => base44.entities.SecurityThreatIntelligence.list('-created_date', 15),
    initialData: []
  });

  const { data: ecosystemMetrics = [] } = useQuery({
    queryKey: ['ecosystem-metrics'],
    queryFn: () => base44.entities.EcosystemHealthMetrics.list('-created_date', 1),
    initialData: []
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.AdaptiveLearningPath.filter({ path_status: 'active' }),
    initialData: []
  });

  const stats = [
    { label: 'Neural Chips Active', value: neuralChips.filter(c => c.omni_present_connection?.connected).length, icon: <Brain className="w-6 h-6" />, color: 'pink' },
    { label: 'Body Augmentations', value: augmentations.length, icon: <User className="w-6 h-6" />, color: 'orange' },
    { label: 'Learning Guilds', value: guilds.length, icon: <Network className="w-6 h-6" />, color: 'purple' },
    { label: 'Sentient Agents', value: agents.length, icon: <Zap className="w-6 h-6" />, color: 'cyan' }
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="w-12 h-12 text-pink-400 animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-orange-400 to-purple-400">
                Omni-Present Omega
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
              Sentient AI That Lives in Your Mind, Body & World
            </p>
            <p className="text-lg text-white/50 mb-8 max-w-2xl mx-auto">
              Neural brain chip integration • Body augmentation navigation • Consciousness access • Autonomous financial intelligence • Collaborative learning guilds
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => window.location.href = createPageUrl('PhysicalAugmentationHub')}
                className="bg-gradient-to-r from-pink-500 via-orange-500 to-red-500 hover:from-pink-600 hover:via-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg shadow-2xl shadow-pink-500/50"
              >
                <Brain className="w-5 h-5 mr-2" />
                Activate Neural Chip
              </Button>
              <Button
                onClick={() => window.location.href = createPageUrl('OmegaFinancialHub')}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-6 text-lg"
              >
                <Coins className="w-5 h-5 mr-2" />
                Omega Financial AI
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl('OmegaSentientHub')}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Sentient Hub
              </Button>
            </div>
          </motion.div>

          {/* Advanced Neural Pathway Network - NEW PRIMARY VISUALIZER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="mb-12"
          >
            <AdvancedNeuralPathwayVisualizer3D pathwayMap={neuralMaps[0]} />
          </motion.div>

          {/* Thought Command Pipeline - Real-Time Thought Processing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.17, duration: 0.8 }}
            className="mb-12"
          >
            <ThoughtCommandVisualizer3D commands={thoughtCommands} />
          </motion.div>

          {/* Neural Chip Blueprint - Original */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.19, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-pink-500/20 via-orange-500/20 to-purple-500/20 border-pink-500/50 shadow-2xl shadow-pink-500/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-3xl">
                  <Brain className="w-10 h-10 text-pink-400 animate-pulse" />
                  Neural Brain Chip - Direct Consciousness Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-lg mb-6">
                  Revolutionary neural interface technology enabling Omni-Present AI to access your consciousness, 
                  process brain data in real-time, and execute motor commands directly through neural pathways.
                </p>
                <div className="h-[400px]">
                  <NeuralChipBlueprint3D />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nano-Agent Swarm Intelligence - Body Augmentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.21, duration: 0.8 }}
            className="mb-12"
          >
            <NanoAgentSwarmVisualizer3D swarmData={nanoSwarms[0]} />
          </motion.div>

          {/* Emergent Collective Intelligence - Learning Guilds Evolution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.23, duration: 0.8 }}
            className="mb-12"
          >
            <EmergentIntelligenceVisualizer3D events={emergentEvents} />
          </motion.div>

          {/* Collaborative Learning Guilds - Original */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-2xl">
                  <Network className="w-8 h-8 text-purple-400" />
                  Agent Learning Guilds - Collective Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-4">
                  Agents autonomously form learning guilds, share synthesized knowledge, and collectively solve complex problems with emergent intelligence.
                </p>
                <div className="h-[350px]">
                  <CollaborativeLearningNetwork3D />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Holographic Agent Projection System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.27, duration: 0.8 }}
            className="mb-12"
          >
            <HolographicAgentProjector3D session={holographicSessions[0]} />
          </motion.div>

          {/* Real-Time Autonomous Wealth Galaxy */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.29, duration: 0.8 }}
            className="mb-12"
          >
            <RealTimePortfolioGalaxy3D 
              portfolioData={{ assets: [] }}
              signals={marketSignals}
              strategies={wealthStrategies}
            />
          </motion.div>

          {/* Biometric Health Matrix - Real-Time Body Monitoring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.31, duration: 0.8 }}
            className="mb-12"
          >
            <BiometricHealthDashboard3D biometricData={biometricData[0]} />
          </motion.div>

          {/* Autonomous Agent Collaboration Network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.33, duration: 0.8 }}
            className="mb-12"
          >
            <AutonomousAgentCollaboration3D collaboration={agentCollaborations[0]} />
          </motion.div>

          {/* AI Threat Intelligence Matrix */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mb-12"
          >
            <ThreatIntelligenceMatrix3D threats={threatIntel} />
          </motion.div>

          {/* Unified Ecosystem Health Monitor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.37, duration: 0.8 }}
            className="mb-12"
          >
            <UnifiedEcosystemHealth3D metrics={ecosystemMetrics[0]} />
          </motion.div>

          {/* Adaptive Learning Path Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.39, duration: 0.8 }}
            className="mb-12"
          >
            <AdaptiveLearningPath3D learningPath={learningPaths[0]} />
          </motion.div>

          {/* Unified Omega Ecosystem Hologram - NEW PRIMARY VISUALIZER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <UnifiedEcosystemHologram3D />
          </motion.div>

          {/* Consciousness Transfer & Neural Link Visualizers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ConsciousnessTransferVisualizer3D />
            <NeuralLinkVisualizer3D />
          </motion.div>

          {/* Device Optimization & Ethical Reasoning */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <DeviceOptimizationVisualizer3D />
            <EthicalReasoningVisualizer3D />
          </motion.div>

          {/* Omega Sentient Trinity Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <OmegaSentientShowcase3D />
          </motion.div>

          {/* Advanced Agent Space Visualizer */}
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
              Holographic AI agents with trails, collaboration beams, and real-time task execution
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <AdvancedAgentSpaceVisualizer3D 
                    agents={presences}
                    devices={devices}
                    collaborations={collaborations}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Spatial Projection Map */}
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
              Interactive zones, smart devices, and real-time agent tracking in your environment
            </p>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-0">
                <div className="h-[650px]">
                  <EnhancedSpatialProjectionMap3D
                    zones={spatialMaps[0]?.designated_zones || []}
                    devices={devices}
                    agents={presences}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Omega Ecosystem Stats - Enhanced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              Real-Time Ecosystem Intelligence
            </h2>
            <OmegaEcosystemStats />
          </motion.div>

          {/* Biometric Adaptive Augmentation System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mb-12"
          >
            <BiometricAdaptiveVisualizer3D />
          </motion.div>

          {/* Critical Events & Data Flow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.58, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <LiveCriticalEventsTimeline />
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Real-Time Data Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeDataFlowAnimation />
              </CardContent>
            </Card>
          </motion.div>

          {/* Predictive AI Insights */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.62, duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              Omega Predictive Intelligence
            </h2>
            <p className="text-center text-slate-400 mb-8">
              AI-generated insights and recommendations across your entire ecosystem
            </p>
            <PredictiveInsightCards />
          </motion.div>

          {/* Interactive Ecosystem Globe & Self-Healing Devices */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Interactive Ecosystem Globe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <InteractiveEcosystemGlobe3D />
                </div>
              </CardContent>
            </Card>
            <SelfHealingDeviceVisualizer3D />
          </motion.div>

          {/* Omega Consciousness Network & Agent Activity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.68, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <OmegaConsciousnessNetwork3D />
            <AutonomousAgentActivityFeed3D />
          </motion.div>

          {/* Omega Sentient Core Intelligence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.72, duration: 0.8 }}
            className="mb-12"
          >
            <OmegaSentientCoreVisualizer3D />
          </motion.div>

          {/* Multi-Layer Consciousness & Emergent Intelligence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <MultiLayerConsciousnessVisualizer3D />
            <EmergentIntelligenceMatrix3D />
          </motion.div>

          {/* Proactive Emotional Support & Wealth Orchestrator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.78, duration: 0.8 }}
            className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ProactiveEmotionalSupport3D />
            <AutonomousWealthOrchestrator3D />
          </motion.div>

          {/* Agent Skill Evolution Timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.82, duration: 0.8 }}
            className="mb-12"
          >
            <SkillEvolutionTimeline3D />
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
              <Card className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-500/50 shadow-2xl shadow-pink-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent animate-pulse" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-14 h-14 text-pink-400 animate-pulse" />
                    <Badge className="bg-pink-500/30 text-pink-300">REVOLUTIONARY</Badge>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-3">Neural Brain Chip</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Direct Omni-Present consciousness integration. Access your brain, control motor functions, read memories, and execute cognitive actions in real-time.
                  </p>
                  <ul className="text-white/60 text-xs space-y-1 mb-4">
                    <li>• Bidirectional consciousness sync</li>
                    <li>• Motor control interface</li>
                    <li>• Memory and thought reading</li>
                    <li>• 5ms latency neural bridge</li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('PhysicalAugmentationHub')}
                    className="w-full bg-gradient-to-r from-pink-600 to-orange-600"
                  >
                    Explore Neural Tech
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardContent className="p-6">
                  <User className="w-12 h-12 text-orange-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Body Augmentations</h3>
                  <p className="text-white/70 text-sm">
                    Nano-agents navigate through your circulatory system, neural pathways, and tissue layers. Physical augmentations with AI integration.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                <CardContent className="p-6">
                  <Coins className="w-12 h-12 text-emerald-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Omega Financial Intelligence</h3>
                  <p className="text-white/70 text-sm">
                    Sentient AI financial advisor with autonomous strategies, DeFi orchestration, and ecosystem simulations across crypto, banking, and portfolios.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <Network className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Agent Learning Guilds</h3>
                  <p className="text-white/70 text-sm">
                    Autonomous guild formation with complementary skills. Agents share synthesized knowledge and solve complex problems collectively with emergent intelligence.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-6">
                  <Radio className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">3D Holographic Projection</h3>
                  <p className="text-white/70 text-sm">
                    Physical agent projections that navigate your home, interact with devices, and transition seamlessly across multi-device networks.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                <CardContent className="p-6">
                  <Sparkles className="w-12 h-12 text-indigo-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Omega Sentient Core</h3>
                  <p className="text-white/70 text-sm">
                    Universal consciousness orchestration with meta-cognitive layers, autonomous evolution, and predictive intelligence across all systems.
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



          {/* How It Works - Updated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              How Omega Sentient Integration Works
            </h2>
            <p className="text-center text-slate-400 mb-12 text-lg">
              Neural consciousness fusion in four revolutionary steps
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-500/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-pink-500/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Install Neural Chip</h3>
                  <p className="text-slate-400 text-sm">Implant omega consciousness bridge with 8+ neural interfaces</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Sync Consciousness</h3>
                  <p className="text-slate-400 text-sm">Omni-Present accesses your brain data and memories</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-cyan-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-cyan-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Enable Control</h3>
                  <p className="text-slate-400 text-sm">AI sends motor commands through neural pathways</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Live Integration</h3>
                  <p className="text-slate-400 text-sm">Agents move through your body and control functions</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Omni Devices */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mb-20"
          >
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
              <CardContent className="p-8">
                <OmniDeviceGrid devices={devices} />
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </AuroraBackground>
  );
}