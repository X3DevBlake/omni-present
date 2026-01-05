import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DynamicScenarioGenerator({ show, onClose, onScenarioGenerated, currentState }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenarios, setGeneratedScenarios] = useState([]);
  const [scenarioComplexity, setScenarioComplexity] = useState('medium');

  const generateScenarios = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on current simulation state:
        - Population: ${currentState.population}
        - Resources: ${JSON.stringify(currentState.resources)}
        - Emergent Behaviors: ${currentState.emergentBehaviors?.join(', ')}
        - Complexity Level: ${scenarioComplexity}
        
        Generate 5 dynamic scenarios that would challenge or evolve this society. Include:
        1. Novel environmental hazards (natural disasters, climate changes)
        2. Unexpected social conflicts (ideology clashes, resource disputes)
        3. Rare discoveries (new technologies, resources)
        4. External events (migrations, invasions, alliances)
        5. Cultural shifts (new traditions, belief systems)
        
        Each scenario should have triggers, effects, and expected agent responses.`,
        response_json_schema: {
          type: "object",
          properties: {
            scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  triggers: { type: "array", items: { type: "string" } },
                  effects: { type: "object" },
                  expectedResponses: { type: "array", items: { type: "string" } },
                  duration: { type: "integer" }
                }
              }
            }
          }
        }
      });

      setGeneratedScenarios(result.scenarios || []);
      toast.success('Scenarios generated!');
    } catch (error) {
      toast.error('Failed to generate scenarios');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyScenario = (scenario) => {
    onScenarioGenerated(scenario);
    toast.success(`Applying: ${scenario.name}`);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Dynamic Scenario Generator</h3>
              <p className="text-white/60">AI-powered evolving challenges</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Scenario Complexity</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high', 'extreme'].map(level => (
                  <button key={level} onClick={() => setScenarioComplexity(level)} className={`px-4 py-2 rounded-lg text-sm capitalize ${scenarioComplexity === level ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300' : 'bg-white/5 text-white/60'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateScenarios} disabled={isGenerating} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50">
              {isGenerating ? 'Generating...' : 'Generate Scenarios'}
            </button>
          </div>

          {generatedScenarios.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Generated Scenarios</h4>
              {generatedScenarios.map((scenario, i) => (
                <div key={i} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-yellow-300 font-semibold">{scenario.name}</h5>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          scenario.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          scenario.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>{scenario.severity}</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70">{scenario.type}</span>
                      </div>
                    </div>
                    <button onClick={() => applyScenario(scenario)} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded hover:bg-yellow-500/30 text-sm">
                      Apply
                    </button>
                  </div>
                  <p className="text-white/60 text-sm mb-2">{scenario.description}</p>
                  <div className="text-xs text-white/50">Duration: {scenario.duration}s</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}