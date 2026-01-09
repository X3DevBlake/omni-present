import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Shield, TrendingDown, Users, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIScenarioGenerator() {
  const [parameters, setParameters] = useState({
    learning_objective: 'adaptive decision-making',
    ethical_challenges: 'resource allocation under scarcity',
    resource_constraints: 'limited budget and time',
    complexity_level: 'high',
    agent_count: 4
  });

  const [generatedScenario, setGeneratedScenario] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateScenario = async () => {
    setGenerating(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a complex simulation scenario with these parameters:
      - Learning Objective: ${parameters.learning_objective}
      - Ethical Challenges: ${parameters.ethical_challenges}
      - Resource Constraints: ${parameters.resource_constraints}
      - Complexity: ${parameters.complexity_level}
      - Agents: ${parameters.agent_count}
      
      Create a novel scenario with emergent social dynamics, unexpected challenges, and tests for agent adaptability and collaboration under pressure.`,
      response_json_schema: {
        type: 'object',
        properties: {
          scenario_name: { type: 'string' },
          description: { type: 'string' },
          environment: {
            type: 'object',
            properties: {
              setting: { type: 'string' },
              initial_conditions: { type: 'array', items: { type: 'string' } },
              dynamic_events: { type: 'array', items: { type: 'string' } }
            }
          },
          agent_roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                objectives: { type: 'array', items: { type: 'string' } },
                constraints: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          ethical_dilemmas: { type: 'array', items: { type: 'string' } },
          emergent_dynamics: { type: 'array', items: { type: 'string' } },
          unexpected_challenges: { type: 'array', items: { type: 'string' } },
          success_criteria: { type: 'array', items: { type: 'string' } },
          difficulty_rating: { type: 'number' }
        }
      }
    });

    setGeneratedScenario(response);
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          AI-Driven Scenario Generator
        </h3>

        {/* Parameter Configuration */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Learning Objective</label>
            <input
              type="text"
              value={parameters.learning_objective}
              onChange={(e) => setParameters({ ...parameters, learning_objective: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Ethical Challenges</label>
            <input
              type="text"
              value={parameters.ethical_challenges}
              onChange={(e) => setParameters({ ...parameters, ethical_challenges: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Resource Constraints</label>
            <input
              type="text"
              value={parameters.resource_constraints}
              onChange={(e) => setParameters({ ...parameters, resource_constraints: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Complexity Level</label>
            <select
              value={parameters.complexity_level}
              onChange={(e) => setParameters({ ...parameters, complexity_level: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Number of Agents: {parameters.agent_count}</label>
            <input
              type="range"
              min="2"
              max="10"
              value={parameters.agent_count}
              onChange={(e) => setParameters({ ...parameters, agent_count: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={generateScenario}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {generating ? 'Generating Scenario...' : 'Generate AI Scenario'}
        </motion.button>

        {/* Generated Scenario */}
        {generatedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-xl">
              <h4 className="text-white font-bold text-lg mb-2">{generatedScenario.scenario_name}</h4>
              <p className="text-white/80 text-sm mb-4">{generatedScenario.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-white/60 text-xs">Difficulty:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`w-6 h-2 rounded ${
                        i <= generatedScenario.difficulty_rating ? 'bg-red-400' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h5 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Environment
                </h5>
                <p className="text-white/80 text-sm mb-2">{generatedScenario.environment.setting}</p>
                <p className="text-white/60 text-xs mb-2">Initial Conditions:</p>
                {generatedScenario.environment.initial_conditions.map((cond, idx) => (
                  <p key={idx} className="text-white/70 text-xs mb-1">• {cond}</p>
                ))}
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h5 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Dynamic Events
                </h5>
                {generatedScenario.environment.dynamic_events.map((event, idx) => (
                  <p key={idx} className="text-white/70 text-xs mb-2">⚡ {event}</p>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h5 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Agent Roles & Objectives
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {generatedScenario.agent_roles.map((role, idx) => (
                  <div key={idx} className="p-3 bg-black/20 rounded-lg">
                    <p className="text-white font-semibold text-sm mb-2">{role.role}</p>
                    <p className="text-white/60 text-xs mb-1">Objectives:</p>
                    {role.objectives.map((obj, oIdx) => (
                      <p key={oIdx} className="text-green-400 text-xs mb-1">✓ {obj}</p>
                    ))}
                    <p className="text-white/60 text-xs mb-1 mt-2">Constraints:</p>
                    {role.constraints.map((con, cIdx) => (
                      <p key={cIdx} className="text-orange-400 text-xs mb-1">⚠ {con}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h5 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ethical Dilemmas
                </h5>
                {generatedScenario.ethical_dilemmas.map((dilemma, idx) => (
                  <p key={idx} className="text-white/80 text-sm mb-2">⚖️ {dilemma}</p>
                ))}
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <h5 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Unexpected Challenges
                </h5>
                {generatedScenario.unexpected_challenges.map((challenge, idx) => (
                  <p key={idx} className="text-white/80 text-sm mb-2">⚡ {challenge}</p>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h5 className="text-green-400 font-bold mb-3">Emergent Social Dynamics</h5>
              {generatedScenario.emergent_dynamics.map((dynamic, idx) => (
                <p key={idx} className="text-white/80 text-sm mb-2">🔄 {dynamic}</p>
              ))}
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <h5 className="text-cyan-400 font-bold mb-3">Success Criteria</h5>
              {generatedScenario.success_criteria.map((criterion, idx) => (
                <p key={idx} className="text-white/80 text-sm mb-1">✓ {criterion}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}