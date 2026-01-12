import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersonalizedLearningModule({ agentId }) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    generatePersonalizedModules();
  }, [agentId]);

  const generatePersonalizedModules = async () => {
    const [interactions, kpis] = await Promise.all([
      base44.entities.AgentInteraction.list({ agent_id: agentId }),
      base44.entities.AgentKPI.list({ agent_id: agentId })
    ]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create personalized learning modules based on:
- ${interactions.length} past interactions
- Performance metrics: ${JSON.stringify(kpis[0] || {})}

Generate customized training modules addressing specific weaknesses.`,
      response_json_schema: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                focus_area: { type: 'string' },
                exercises: { type: 'array', items: { type: 'string' } },
                estimated_improvement: { type: 'number' }
              }
            }
          }
        }
      }
    });

    setModules(result.modules || []);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-purple-400" />
        Personalized Modules
      </h3>

      <div className="space-y-3">
        {modules.map((module, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <p className="text-white font-semibold text-sm">{module.title}</p>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                +{module.estimated_improvement}%
              </span>
            </div>
            <p className="text-white/60 text-xs mb-2">Focus: {module.focus_area}</p>
            <div className="space-y-1">
              {module.exercises?.slice(0, 2).map((ex, j) => (
                <p key={j} className="text-white/80 text-xs">• {ex}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}