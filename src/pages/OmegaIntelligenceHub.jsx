import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Network, Shield, Target, Users, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

// Original Components
import RealTimeSystemSync from '../components/omega/RealTimeSystemSync';
import SystemHealthOverview from '../components/omega/SystemHealthOverview';
import InteractiveKnowledgeGraph3D from '../components/omega/InteractiveKnowledgeGraph3D';
import SwarmPredictiveAnalytics3D from '../components/omega/SwarmPredictiveAnalytics3D';
import SwarmRootCauseAnalyzer3D from '../components/omega/SwarmRootCauseAnalyzer3D';
import SwarmMetricsDashboard from '../components/omega/SwarmMetricsDashboard';
import MissionSimulationViz3D from '../components/haas/MissionSimulationViz3D';
import AIMissionCommanderViz3D from '../components/haas/AIMissionCommanderViz3D';
import RecursiveHAASMonitor3D from '../components/omega/RecursiveHAASMonitor3D';
import SwarmOrchestrationLayer3D from '../components/omega/SwarmOrchestrationLayer3D';
import ThreatSimulationModule3D from '../components/omega/ThreatSimulationModule3D';
import AgentPersonalizationVisualizer3D from '../components/omega/AgentPersonalizationVisualizer3D';
import MultiAgentSimulationEnvironment3D from '../components/omega/MultiAgentSimulationEnvironment3D';
import CollectiveIntelligenceVisualizer3D from '../components/omega/CollectiveIntelligenceVisualizer3D';
import EmergentGoalVisualizer3D from '../components/omega/EmergentGoalVisualizer3D';
import DynamicTeamVisualizer3D from '../components/omega/DynamicTeamVisualizer3D';
import CollaborativeScenarioEditor from '../components/omega/CollaborativeScenarioEditor';
import IntegratedCommunicationHub from '../components/omega/IntegratedCommunicationHub';
import SharedKnowledgeRepository3D from '../components/omega/SharedKnowledgeRepository3D';
import EnhancedKnowledgeNetwork3D from '../components/omega/EnhancedKnowledgeNetwork3D';
import KnowledgeFusionLandscape3D from '../components/omega/KnowledgeFusionLandscape3D';
import AdvancedKnowledgeGraph3D from '../components/omega/AdvancedKnowledgeGraph3D';
import EthicsMonitorDashboard from '../components/omega/EthicsMonitorDashboard';
import SentientEthicalAdvisorDashboard3D from '../components/ethics/SentientEthicalAdvisorDashboard3D';
import EthicalDriftMonitorDashboard3D from '../components/ethics/EthicalDriftMonitorDashboard3D';
import ProactiveEthicalDriftMonitor3D from '../components/omega/ProactiveEthicalDriftMonitor3D';
import DynamicEthicalLandscapeViz3D from '../components/ethics/DynamicEthicalLandscapeViz3D';
import EthicalCouncilViz3D from '../components/ethics/EthicalCouncilViz3D';
import EthicalEvolutionPathViz3D from '../components/ethics/EthicalEvolutionPathViz3D';
import EthicalFrameworkEvolutionSimulator3D from '../components/omega/EthicalFrameworkEvolutionSimulator3D';
import EthicalLandscapeExplorer3D from '../components/omega/EthicalLandscapeExplorer3D';
import ComplianceSimulationModule3D from '../components/omega/ComplianceSimulationModule3D';
import PlanetaryOperationsDashboard3D from '../components/interplanetary/PlanetaryOperationsDashboard3D';
import InterplanetarySolarSystemViz3D from '../components/interplanetary/InterplanetarySolarSystemViz3D';
import AdaptiveModulationViz3D from '../components/interstellar/AdaptiveModulationViz3D';
import InterstellarNetworkViz3D from '../components/interstellar/InterstellarNetworkViz3D';
import RedCommDeviceBlueprint3D from '../components/interplanetary/RedCommDeviceBlueprint3D';
import GovernancePolicyVisualizer3D from '../components/planetary/GovernancePolicyVisualizer3D';
import PolicyImpactSimulator3D from '../components/planetary/PolicyImpactSimulator3D';
import GovernanceEthicalAuditTrail3D from '../components/planetary/GovernanceEthicalAuditTrail3D';
import AdaptiveGovernanceLearning3D from '../components/planetary/AdaptiveGovernanceLearning3D';
import LongTermImpactDashboard3D from '../components/planetary/LongTermImpactDashboard3D';
import InterstellarSimulationStudio3D from '../components/interstellar/InterstellarSimulationStudio3D';
import AutonomousAgentDashboard3D from '../components/interstellar/AutonomousAgentDashboard3D';
import ProtocolProposalVisualizer3D from '../components/interstellar/ProtocolProposalVisualizer3D';
import AgentCollaborationNetwork3D from '../components/interstellar/AgentCollaborationNetwork3D';
import SystemEvolutionDashboard3D from '../components/interplanetary/SystemEvolutionDashboard3D';
import EthicalAuditTrail from '../components/omega/EthicalAuditTrail';
import EthicalComplianceDashboard from '../components/omega/EthicalComplianceDashboard';
import EthicalFrameworkGenerator from '../components/omega/EthicalFrameworkGenerator';
import CommunicationTopology3D from '../components/omega/CommunicationTopology3D';
import CounterfactualSimulator3D from '../components/omega/CounterfactualSimulator3D';

// New Components
import AdvancedSimulation3D from '../components/simulation/AdvancedSimulation3D';
import AICoachInterface from '../components/coaching/AICoachInterface';

export default function OmegaIntelligenceHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 pb-16">
      <RealTimeSystemSync />
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Omega Intelligence Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Advanced AI capabilities: emergent goals, ethics monitoring, and causal reasoning
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-indigo-500/30">
            <Target className="w-8 h-8 text-indigo-400 mb-2" />
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-sm text-gray-400">Emergent Goals</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-green-500/30">
            <Shield className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">99.2%</div>
            <div className="text-sm text-gray-400">Ethical Compliance</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
            <Network className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">1,845</div>
            <div className="text-sm text-gray-400">Knowledge Nodes</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">23</div>
            <div className="text-sm text-gray-400">Dynamic Teams</div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-black/60 backdrop-blur-xl mb-8 text-[10px] lg:text-xs h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="adv_sim">Adv. Simulation</TabsTrigger>
            <TabsTrigger value="coaching">AI Coach</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="haas">HAAS</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="personalization">Personalize</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="collab">Collaborate</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="fusion">Fusion</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="drift">Drift</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="interplanetary">Inter-Planetary</TabsTrigger>
            <TabsTrigger value="governance">Governance AI</TabsTrigger>
            <TabsTrigger value="interstellar">Interstellar</TabsTrigger>
            <TabsTrigger value="upgrade">Auto-Upgrade</TabsTrigger>
          </TabsList>

          {/* New Advanced Simulation Tab */}
          <TabsContent value="adv_sim" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-black/50 border-white/10 overflow-hidden p-1">
                        <AdvancedSimulation3D scenario={{ name: "Adversarial Incursion", threat_level: "HIGH" }} />
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card className="bg-slate-900/50 border-white/10 p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-400" /> Active Scenarios
                        </h3>
                        <div className="space-y-3">
                            {["Urban Defense", "Cyber-Swarm Attack", "Resource Scarcity"].map((s, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded border border-white/5 hover:border-red-500/50 transition-colors cursor-pointer">
                                    <div className="font-semibold text-sm">{s}</div>
                                    <div className="text-xs text-slate-500 mt-1">Difficulty: Extreme</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
          </TabsContent>

          {/* New Coaching Tab */}
          <TabsContent value="coaching" className="animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-4xl mx-auto">
                <AICoachInterface agentId="AGENT-OMEGA-01" />
            </div>
          </TabsContent>

          {/* Existing Tabs */}
          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemHealthOverview />
                <InteractiveKnowledgeGraph3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SwarmPredictiveAnalytics3D />
                <SwarmRootCauseAnalyzer3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="metrics">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <SwarmMetricsDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="haas">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <MissionSimulationViz3D />
                <AIMissionCommanderViz3D />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecursiveHAASMonitor3D />
                  <SwarmOrchestrationLayer3D />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="threats">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ThreatSimulationModule3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="personalization">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <AgentPersonalizationVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="teams">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <DynamicTeamVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="collab">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CollaborativeScenarioEditor scenarioId="omega_collab_001" />
                <IntegratedCommunicationHub contextId="omega_intel_hub" />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="knowledge">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SharedKnowledgeRepository3D />
                <EnhancedKnowledgeNetwork3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="fusion">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <KnowledgeFusionLandscape3D />
                <AdvancedKnowledgeGraph3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ethics">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <EthicsMonitorDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="drift">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <SentientEthicalAdvisorDashboard3D />
                <EthicalDriftMonitorDashboard3D />
                <ProactiveEthicalDriftMonitor3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="evolution">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <DynamicEthicalLandscapeViz3D />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EthicalCouncilViz3D />
                  <EthicalEvolutionPathViz3D />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EthicalFrameworkEvolutionSimulator3D />
                  <EthicalLandscapeExplorer3D />
                </div>
                <ComplianceSimulationModule3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="interplanetary">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PlanetaryOperationsDashboard3D />
                  <InterplanetarySolarSystemViz3D />
                </div>
                <AdaptiveModulationViz3D />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InterstellarNetworkViz3D />
                  <RedCommDeviceBlueprint3D />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="governance">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <GovernancePolicyVisualizer3D />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PolicyImpactSimulator3D />
                  <GovernanceEthicalAuditTrail3D />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AdaptiveGovernanceLearning3D />
                  <LongTermImpactDashboard3D />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="interstellar">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-6">
                <InterstellarSimulationStudio3D />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AutonomousAgentDashboard3D />
                  <ProtocolProposalVisualizer3D />
                </div>
                <AgentCollaborationNetwork3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="upgrade">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <SystemEvolutionDashboard3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <EthicalAuditTrail />
            </motion.div>
          </TabsContent>

          <TabsContent value="compliance">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EthicalComplianceDashboard />
                <EthicalFrameworkGenerator />
              </div>
            </motion.div>
          </TabsContent>

        </Tabs>

        {/* Advanced Visualizations Section */}
        <section className="mt-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-8 text-center">
            Advanced Data Stream Visualizations
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <CommunicationTopology3D />
            <InteractiveKnowledgeGraph3D />
            <CounterfactualSimulator3D />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MultiAgentSimulationEnvironment3D />
            <CollectiveIntelligenceVisualizer3D />
          </div>
        </section>
      </section>
    </div>
  );
}