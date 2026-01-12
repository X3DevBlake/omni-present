import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function CurriculumGenerator({ agentId }) {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCurriculum = async () => {
    setLoading(true);
    
    const [kpis, deployments] = await Promise.all([
      base44.entities.AgentKPI.list({ agent_id: agentId }),
      base44.entities.AgentDeployment.list({ agent_id: agentId })
    ]);

    const skillGaps = [];
    if (kpis[0]?.efficiency < 70) skillGaps.push('efficiency_optimization');
    if (kpis[0]?.response_time > 3) skillGaps.push('response_speed');
    if (deployments[0]?.performance_metrics?.success_rate < 80) skillGaps.push('task_completion');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate training curriculum for AI agent with skill gaps: ${skillGaps.join(', ')}
      
Create adaptive learning modules with difficulty levels and estimated duration.`,
      response_json_schema: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                module_name: { type: 'string' },
                difficulty: { type: 'string' },
                estimated_duration: { type: 'number' },
                topics: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    const created = await base44.entities.TrainingCurriculum.create({
      agent_id: agentId,
      skill_gaps_identified: skillGaps,
      learning_modules: result.modules,
      current_difficulty: 'beginner',
      completion_rate: 0
    });

    setCurriculum(created);
    setLoading(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        Curriculum Generator
      </h3>

      {!curriculum ? (
        <Button onClick={generateCurriculum} disabled={loading} className="w-full bg-purple-500 hover:bg-purple-600">
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Generate AI Curriculum'}
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded p-3">
            <p className="text-white/60 text-xs mb-2">Identified Skill Gaps:</p>
            <div className="flex gap-2 flex-wrap">
              {curriculum.skill_gaps_identified.map(gap => (
                <span key={gap} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                  {gap}
                </span>
              ))}
            </div>
          </div>

          {curriculum.learning_modules?.map((module, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white font-semibold">{module.module_name}</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {module.difficulty}
                </span>
              </div>
              <p className="text-white/60 text-xs mb-2">{module.estimated_duration} hours</p>
              <div className="space-y-1">
                {module.topics?.slice(0, 3).map((topic, j) => (
                  <p key={j} className="text-white/80 text-xs">• {topic}</p>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}