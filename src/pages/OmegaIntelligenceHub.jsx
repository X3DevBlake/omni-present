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
        <Tabs defaultValue="haas" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-black/60 backdrop-blur-xl mb-8 text-xs lg:text-sm">
            <TabsTrigger value="haas">HAAS</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="dilemmas">Dilemmas</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="comms">Comms</TabsTrigger>
            <TabsTrigger value="causal">Causal</TabsTrigger>
          </TabsList>

          <TabsContent value="haas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RecursiveHAASMonitor3D />
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

          <TabsContent value="planning">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CrossAgentPlanner3D />
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

          <TabsContent value="dilemmas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EthicalDilemmaSimulator3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="knowledge">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <KnowledgeGraph3DBuilder />
            </motion.div>
          </TabsContent>

          <TabsContent value="comms">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AgentCommunicationFlow3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="causal">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CausalReasoningEngine3D />
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}