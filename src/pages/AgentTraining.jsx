import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentTrainingInterface from '../components/training/AgentTrainingInterface';
import AgentEvolutionVisualizer3D from '../components/coaching/AgentEvolutionVisualizer3D';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function AgentTraining() {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Fetch a default agent to show visualization immediately
  useEffect(() => {
    base44.entities.Agent.list({ limit: 1 }).then(agents => {
      if (agents.length > 0) setSelectedAgentId(agents[0].id);
    });
  }, []);
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Agent Training</h1>
          </div>
          <p className="text-white/60 text-lg">
            Fine-tune your AI agents with custom datasets and advanced parameters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AgentTrainingInterface onAgentSelect={setSelectedAgentId} />
          </div>
          <div>
            {selectedAgentId ? (
              <AgentEvolutionVisualizer3D agentId={selectedAgentId} />
            ) : (
              <div className="h-[500px] flex items-center justify-center border border-white/10 rounded-lg bg-black/20 text-white/40">
                Select an agent to view evolution
              </div>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}