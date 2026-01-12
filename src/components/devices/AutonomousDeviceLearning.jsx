import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Eye, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function AutonomousDeviceLearning({ agentId }) {
  const [learning, setLearning] = useState(false);
  const [observations, setObservations] = useState([]);

  const observeAndLearn = async () => {
    setLearning(true);
    
    const devices = await base44.entities.RealWorldDevice.list();
    const learnedBehaviors = [];

    for (const device of devices.slice(0, 2)) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Observe device behavior through experimentation:
Device: ${device.device_name}
Type: ${device.os_type}

Learn optimal interaction patterns through trial and error.`,
        response_json_schema: {
          type: 'object',
          properties: {
            learned_pattern: { type: 'string' },
            optimal_commands: { type: 'array', items: { type: 'string' } },
            confidence: { type: 'number' }
          }
        }
      });

      learnedBehaviors.push({
        device: device.device_name,
        ...result
      });

      await base44.entities.AutonomousSkillDiscovery.create({
        agent_id: agentId,
        skill_name: `${device.device_name}_control`,
        discovery_method: 'observation',
        confidence_level: result.confidence,
        training_iterations: 10
      });
    }

    setObservations(learnedBehaviors);
    setLearning(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-cyan-400" />
        Autonomous Learning
      </h3>

      <Button onClick={observeAndLearn} disabled={learning} className="w-full mb-4 bg-cyan-500 hover:bg-cyan-600">
        <Brain className="w-4 h-4 mr-2" />
        {learning ? 'Learning...' : 'Observe & Learn'}
      </Button>

      <div className="space-y-3">
        {observations.map((obs, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-white font-semibold text-sm">{obs.device}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs">{obs.confidence}%</span>
              </div>
            </div>
            <p className="text-white/60 text-xs mb-2">{obs.learned_pattern}</p>
            <div className="flex gap-1 flex-wrap">
              {obs.optimal_commands?.slice(0, 3).map((cmd, j) => (
                <span key={j} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                  {cmd}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}