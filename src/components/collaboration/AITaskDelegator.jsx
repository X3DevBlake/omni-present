import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Brain, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function AITaskDelegator() {
  const [tasks, setTasks] = useState([]);
  const [delegating, setDelegating] = useState(false);

  const analyzeTasks = async () => {
    setDelegating(true);
    
    const [agents, simulations] = await Promise.all([
      base44.entities.HolographicAgent.list(),
      base44.entities.WorldSimulation.list()
    ]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze ${agents.length} agents across ${simulations.length} simulations.
      
Identify optimal task delegation based on:
- Agent skill complementarity
- Simulation goals alignment
- Current workload distribution

Generate delegation plan with task assignments.`,
      response_json_schema: {
        type: 'object',
        properties: {
          delegations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task_name: { type: 'string' },
                assigned_agents: { type: 'array', items: { type: 'string' } },
                simulation_ids: { type: 'array', items: { type: 'string' } },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setTasks(result.delegations);
    setDelegating(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-cyan-400" />
        AI Task Delegator
      </h3>

      <Button onClick={analyzeTasks} disabled={delegating} className="w-full mb-4 bg-cyan-500 hover:bg-cyan-600">
        <Brain className="w-4 h-4 mr-2" />
        {delegating ? 'Analyzing...' : 'Analyze & Delegate'}
      </Button>

      <div className="space-y-3">
        {tasks.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-white font-semibold text-sm">{task.task_name}</p>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-white/60 text-xs mb-2">{task.reasoning}</p>
            <div className="flex gap-2 flex-wrap">
              {task.assigned_agents?.map((agent, j) => (
                <span key={j} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  {agent}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}