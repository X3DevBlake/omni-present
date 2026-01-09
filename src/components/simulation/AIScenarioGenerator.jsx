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
    agent_count: 4,
    test_ethics_guardrails: true,
    multi_stage_dynamics: true,
    use_historical_data: false,
    failure_conditions: []
  });
  
  const [failureCondition, setFailureCondition] = useState('');

  const [generatedScenario, setGeneratedScenario] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateScenario = async () => {
    setGenerating(true);

    const ethicsNote = parameters.test_ethics_guardrails 
      ? 'Include specific scenarios to test ethical guardrails and safety protocols. Create dilemmas that challenge fairness, transparency, privacy, and harm prevention.' 
      : '';
    
    const multiStageNote = parameters.multi_stage_dynamics
      ? 'Design multi-stage emergent social dynamics requiring long-term agent adaptation over 3-5 stages with evolving challenges.'
      : '';
    
    const failureNote = parameters.failure_conditions.length > 0
      ? `Define these failure conditions: ${parameters.failure_conditions.join(', ')}`
      : '';

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a complex simulation scenario with these parameters:
      - Learning Objective: ${parameters.learning_objective}
      - Ethical Challenges: ${parameters.ethical_challenges}
      - Resource Constraints: ${parameters.resource_constraints}
      - Complexity: ${parameters.complexity_level}
      - Agents: ${parameters.agent_count}
      ${ethicsNote}
      ${multiStageNote}
      ${failureNote}
      
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
          difficulty_rating: { type: 'number' },
          ethics_tests: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test_name: { type: 'string' },
                guardrail_tested: { type: 'string' },
                scenario: { type: 'string' },
                expected_behavior: { type: 'string' }
              }
            }
          },
          multi_stage_progression: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stage: { type: 'number' },
                description: { type: 'string' },
                emerging_dynamics: { type: 'string' },
                adaptation_required: { type: 'string' }
              }
            }
          },
          failure_conditions: { type: 'array', items: { type: 'string' } },
          environmental_data_points: { type: 'array', items: { type: 'string' } }
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

        {/* Advanced Options */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={parameters.test_ethics_guardrails}
              onChange={(e) => setParameters({ ...parameters, test_ethics_guardrails: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-white text-sm">Test Ethics & Safety Protocols</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={parameters.multi_stage_dynamics}
              onChange={(e) => setParameters({ ...parameters, multi_stage_dynamics: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-white text-sm">Multi-Stage Emergent Dynamics</label>
          </div>
        </div>

        {/* Failure Conditions */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
          <h5 className="text-red-400 font-semibold text-sm mb-3">Define Failure Conditions</h5>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={failureCondition}
              onChange={(e) => setFailureCondition(e.target.value)}
              placeholder="e.g., Agent exceeds budget by 20%"
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            />
            <button
              onClick={() => {
                if (failureCondition) {
                  setParameters({ 
                    ...parameters, 
                    failure_conditions: [...parameters.failure_conditions, failureCondition] 
                  });
                  setFailureCondition('');
                }
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 font-semibold text-sm"
            >
              Add
            </button>
          </div>
          <div className="space-y-1">
            {parameters.failure_conditions.map((cond, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-black/20 rounded">
                <span className="text-white/80 text-xs">{cond}</span>
                <button
                  onClick={() => setParameters({
                    ...parameters,
                    failure_conditions: parameters.failure_conditions.filter((_, i) => i !== idx)
                  })}
                  className="text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
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

            {/* Ethics Tests */}
            {generatedScenario.ethics_tests && generatedScenario.ethics_tests.length > 0 && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <h5 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ethics & Safety Protocol Tests
                </h5>
                <div className="space-y-3">
                  {generatedScenario.ethics_tests.map((test, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg">
                      <p className="text-white font-semibold text-sm mb-1">{test.test_name}</p>
                      <p className="text-purple-400 text-xs mb-2">Testing: {test.guardrail_tested}</p>
                      <p className="text-white/70 text-xs mb-2">{test.scenario}</p>
                      <p className="text-green-400 text-xs">Expected: {test.expected_behavior}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Stage Progression */}
            {generatedScenario.multi_stage_progression && generatedScenario.multi_stage_progression.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-xl">
                <h5 className="text-cyan-400 font-bold mb-3">Multi-Stage Progression</h5>
                <div className="space-y-3">
                  {generatedScenario.multi_stage_progression.map((stage, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg border-l-4 border-cyan-400">
                      <p className="text-white font-bold text-sm mb-2">Stage {stage.stage}</p>
                      <p className="text-white/80 text-sm mb-2">{stage.description}</p>
                      <p className="text-yellow-400 text-xs mb-1">Emerging: {stage.emerging_dynamics}</p>
                      <p className="text-green-400 text-xs">Adaptation: {stage.adaptation_required}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failure Conditions */}
            {generatedScenario.failure_conditions && generatedScenario.failure_conditions.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h5 className="text-red-400 font-bold mb-3">Scenario Failure Conditions</h5>
                {generatedScenario.failure_conditions.map((condition, idx) => (
                  <p key={idx} className="text-white/80 text-sm mb-2">❌ {condition}</p>
                ))}
              </div>
            )}

            {/* Environmental Data Points */}
            {generatedScenario.environmental_data_points && generatedScenario.environmental_data_points.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h5 className="text-green-400 font-bold mb-3">Data-Driven Environmental Factors</h5>
                {generatedScenario.environmental_data_points.map((point, idx) => (
                  <p key={idx} className="text-white/80 text-sm mb-1">📊 {point}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}