import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Network, GitBranch, Shield, Target, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmergentGoalVisualizer3D from '../components/omega/EmergentGoalVisualizer3D';
import KnowledgeGraph3DBuilder from '../components/omega/KnowledgeGraph3DBuilder';
import AgentCommunicationFlow3D from '../components/omega/AgentCommunicationFlow3D';
import CausalReasoningEngine3D from '../components/omega/CausalReasoningEngine3D';
import EthicsMonitorDashboard from '../components/omega/EthicsMonitorDashboard';
import RecursiveHAASMonitor3D from '../components/omega/RecursiveHAASMonitor3D';
import CrossAgentPlanner3D from '../components/omega/CrossAgentPlanner3D';
import EthicalDilemmaSimulator3D from '../components/omega/EthicalDilemmaSimulator3D';
import SystemHealthOverview from '../components/omega/SystemHealthOverview';
import DynamicTeamVisualizer3D from '../components/omega/DynamicTeamVisualizer3D';
import EthicalFrameworkGenerator from '../components/omega/EthicalFrameworkGenerator';
import DashboardWidgetManager from '../components/omega/DashboardWidgetManager';
import InteractiveKnowledgeGraph3D from '../components/omega/InteractiveKnowledgeGraph3D';
import CommunicationTopology3D from '../components/omega/CommunicationTopology3D';
import CounterfactualSimulator3D from '../components/omega/CounterfactualSimulator3D';
import MultiAgentSimulationEnvironment3D from '../components/omega/MultiAgentSimulationEnvironment3D';
import CollectiveIntelligenceVisualizer3D from '../components/omega/CollectiveIntelligenceVisualizer3D';
import AIPersonalizationEngine from '../components/omega/AIPersonalizationEngine';
import ExternalIntegrationsPanel from '../components/omega/ExternalIntegrationsPanel';
import SwarmPredictiveAnalytics3D from '../components/omega/SwarmPredictiveAnalytics3D';
import SwarmRootCauseAnalyzer3D from '../components/omega/SwarmRootCauseAnalyzer3D';
import SwarmMetricsDashboard from '../components/omega/SwarmMetricsDashboard';
import CollaborativeScenarioEditor from '../components/omega/CollaborativeScenarioEditor';
import IntegratedCommunicationHub from '../components/omega/IntegratedCommunicationHub';
import SharedKnowledgeRepository3D from '../components/omega/SharedKnowledgeRepository3D';
import EthicalComplianceDashboard from '../components/omega/EthicalComplianceDashboard';
import EthicalAuditTrail from '../components/omega/EthicalAuditTrail';
import ThreatSimulationModule3D from '../components/omega/ThreatSimulationModule3D';
import DecentralizedKnowledgeNetwork3D from '../components/omega/DecentralizedKnowledgeNetwork3D';
import ProactiveEthicalDriftMonitor3D from '../components/omega/ProactiveEthicalDriftMonitor3D';
import AgentPersonalizationVisualizer3D from '../components/omega/AgentPersonalizationVisualizer3D';
import KnowledgeFusionLandscape3D from '../components/omega/KnowledgeFusionLandscape3D';
import EthicalFrameworkEvolutionSimulator3D from '../components/omega/EthicalFrameworkEvolutionSimulator3D';

export default function OmegaIntelligenceHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 pb-16">
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
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced AI capabilities: emergent goals, ethics monitoring, and causal reasoning
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-indigo-500/30"
          >
            <Target className="w-8 h-8 text-indigo-400 mb-2" />
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-sm text-gray-400">Emergent Goals</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-green-500/30"
          >
            <Shield className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">99.2%</div>
            <div className="text-sm text-gray-400">Ethical Compliance</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30"
          >
            <Network className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">1,845</div>
            <div className="text-sm text-gray-400">Knowledge Nodes</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30"
          >
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="haas">HAAS</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="personalization">Personalize</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="collab">Collaborate</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="fusion">Fusion</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="drift">Drift</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemHealthOverview />
                <InteractiveKnowledgeGraph3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SwarmPredictiveAnalytics3D />
                <SwarmRootCauseAnalyzer3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="metrics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SwarmMetricsDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="haas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RecursiveHAASMonitor3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="threats">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ThreatSimulationModule3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="personalization">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AgentPersonalizationVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="simulation">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MultiAgentSimulationEnvironment3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="collective">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CollectiveIntelligenceVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="goals">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EmergentGoalVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="teams">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DynamicTeamVisualizer3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="collab">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CollaborativeScenarioEditor scenarioId="omega_collab_001" />
                <IntegratedCommunicationHub contextId="omega_intel_hub" />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="knowledge">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SharedKnowledgeRepository3D />
                <DecentralizedKnowledgeNetwork3D />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="fusion">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <KnowledgeFusionLandscape3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="ethics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EthicsMonitorDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="drift">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProactiveEthicalDriftMonitor3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="evolution">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EthicalFrameworkEvolutionSimulator3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="audit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EthicalAuditTrail />
            </motion.div>
          </TabsContent>

          <TabsContent value="compliance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EthicalComplianceDashboard />
                <EthicalFrameworkGenerator />
              </div>
            </motion.div>
          </TabsContent>


        </Tabs>

        {/* Advanced Visualizations Section */}
        <section className="mt-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
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