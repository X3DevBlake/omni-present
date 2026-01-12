import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdaptiveLearningDashboard from '../components/training/AdaptiveLearningDashboard';

export default function AgentTrainingCenter() {
  const [agents, setAgents] = useState([]);
  const [training, setTraining] = useState([]);
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [agentsList, trainingList, deploymentList] = await Promise.all([
      base44.entities.HolographicAgent.list(),
      base44.entities.AgentTrainingModule.list(),
      base44.entities.AgentDeployment.list()
    ]);
    setAgents(agentsList);
    setTraining(trainingList);
    setDeployments(deploymentList);
  };

  const startTraining = async (agentId) => {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Start AI-driven training for agent ${agentId} with objective: performance_optimization`
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Agent Training & Deployment</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              Active Training
            </h3>
            {training.map(t => (
              <div key={t.id} className="bg-white/5 rounded p-3 mb-2">
                <p className="text-white font-semibold">{t.training_objective}</p>
                <p className="text-white/60 text-xs">{t.status}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">Deployments</h3>
            {deployments.map(d => (
              <div key={d.id} className="bg-white/5 rounded p-3 mb-2">
                <div className="flex justify-between">
                  <p className="text-white text-sm">{d.deployment_type}</p>
                  <span className={`text-xs px-2 py-1 rounded ${d.retraining_triggered ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                    {d.retraining_triggered ? 'Retraining' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {agents.length > 0 && (
            <AdaptiveLearningDashboard agentId={agents[0]?.id} />
          )}
        </div>
      </div>
    </div>
  );
}