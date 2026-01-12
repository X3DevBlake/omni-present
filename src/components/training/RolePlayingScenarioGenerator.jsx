import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function RolePlayingScenarioGenerator({ agentId }) {
  const [scenario, setScenario] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateScenario = async () => {
    setGenerating(true);
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate dynamic role-playing scenario for AI agent training.

Include:
- Complex problem requiring adaptability
- Multiple decision points
- Realistic constraints
- Success criteria`,
      response_json_schema: {
        type: 'object',
        properties: {
          scenario_name: { type: 'string' },
          description: { type: 'string' },
          role: { type: 'string' },
          challenges: { type: 'array', items: { type: 'string' } },
          success_metrics: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setScenario(result);
    setGenerating(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Play className="w-5 h-5 text-green-400" />
        Role-Playing Scenarios
      </h3>

      <Button onClick={generateScenario} disabled={generating} className="w-full mb-4 bg-green-500 hover:bg-green-600">
        <Sparkles className="w-4 h-4 mr-2" />
        {generating ? 'Generating...' : 'Generate Scenario'}
      </Button>

      {scenario && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded p-4"
        >
          <h4 className="text-white font-bold mb-2">{scenario.scenario_name}</h4>
          <p className="text-white/80 text-sm mb-3">{scenario.description}</p>
          
          <div className="mb-3">
            <p className="text-green-400 text-xs font-semibold mb-1">Your Role:</p>
            <p className="text-white/80 text-xs">{scenario.role}</p>
          </div>

          <div className="mb-3">
            <p className="text-orange-400 text-xs font-semibold mb-1">Challenges:</p>
            {scenario.challenges?.map((ch, i) => (
              <p key={i} className="text-white/80 text-xs">• {ch}</p>
            ))}
          </div>

          <div>
            <p className="text-cyan-400 text-xs font-semibold mb-1">Success Criteria:</p>
            {scenario.success_metrics?.map((sm, i) => (
              <p key={i} className="text-white/80 text-xs">✓ {sm}</p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}