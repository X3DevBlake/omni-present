import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AIScenarioIdeator() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateScenarios = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 creative AI simulation scenarios with agents, challenges, and objectives. Format as JSON array with: title, description, agents_needed, difficulty, objectives`,
        response_json_schema: {
          type: "object",
          properties: {
            scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  agents_needed: { type: "number" },
                  difficulty: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      setScenarios(response.scenarios || []);
    } catch (err) {
      console.error('Failed to generate scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-purple-400" />
        AI-Powered Scenario Ideation
      </h3>

      <Button 
        onClick={generateScenarios} 
        disabled={loading}
        className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? 'Generating...' : 'Generate Scenarios'}
      </Button>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {scenarios.map((scenario, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/20 rounded-lg p-4"
          >
            <h4 className="text-white font-bold mb-2">{scenario.title}</h4>
            <p className="text-white/70 text-sm mb-3">{scenario.description}</p>
            <div className="flex gap-2 flex-wrap mb-2">
              <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {scenario.agents_needed} agents
              </div>
              <div className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs">
                {scenario.difficulty}
              </div>
            </div>
            {scenario.objectives && (
              <div className="text-white/60 text-xs">
                {scenario.objectives.map((obj, j) => (
                  <div key={j}>• {obj}</div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}