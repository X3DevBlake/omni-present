import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuroraBackground from '../components/omni/AuroraBackground';
import ScenarioEditor from '../components/simulation/ScenarioEditor';
import MultiAgentVisualizer from '../components/simulation/MultiAgentVisualizer';
import ABTestingModule from '../components/simulation/ABTestingModule';
import DataReplayAnalytics from '../components/simulation/DataReplayAnalytics';
import EnvironmentBuilder from '../components/simulation/EnvironmentBuilder';

export default function SimulationLabs() {
  const [activeScenario, setActiveScenario] = useState(null);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            🧪 Simulation Labs
          </h1>
          <p className="text-white/60">Advanced tools for scenario testing, agent visualization, and strategy optimization</p>
        </motion.div>

        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-cyan-500/20">
              📋 Scenarios
            </TabsTrigger>
            <TabsTrigger value="visualization" className="data-[state=active]:bg-cyan-500/20">
              🎬 Visualization
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-cyan-500/20">
              🧪 A/B Testing
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500/20">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="environment" className="data-[state=active]:bg-cyan-500/20">
              🌍 Environment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <ScenarioEditor onSave={setActiveScenario} />
            </motion.div>
          </TabsContent>

          <TabsContent value="visualization" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {activeScenario ? (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded p-4">
                    <p className="text-white/70 text-sm">Running scenario: <span className="font-bold text-cyan-400">{activeScenario.name}</span></p>
                  </div>
                  <MultiAgentVisualizer 
                    agentCount={activeScenario.agentCount} 
                    duration={activeScenario.duration}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  Create and save a scenario first to visualize it
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="testing" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <ABTestingModule />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <DataReplayAnalytics />
            </motion.div>
          </TabsContent>

          <TabsContent value="environment" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <EnvironmentBuilder />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}