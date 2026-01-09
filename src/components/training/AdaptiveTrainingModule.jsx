import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Award, Play, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdaptiveTrainingModule() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Agent-Alpha', level: 3, successRate: 78, strengths: ['analysis'], weaknesses: ['speed'] },
    { id: 2, name: 'Agent-Beta', level: 5, successRate: 92, strengths: ['collaboration'], weaknesses: ['creativity'] }
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [trainingScenario, setTrainingScenario] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  const generateLearningPath = async (agent) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a personalized learning path for AI agent "${agent.name}" with success rate ${agent.successRate}%, strengths in ${agent.strengths.join(', ')}, and weaknesses in ${agent.weaknesses.join(', ')}. Include 5 progressive training modules.`,
      response_json_schema: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                difficulty: { type: 'string' },
                duration: { type: 'string' },
                focus_area: { type: 'string' },
                expected_improvement: { type: 'number' }
              }
            }
          }
        }
      }
    });

    setLearningPath(response.modules);
  };

  const generateAdaptiveScenario = async (agent) => {
    const difficulty = agent.successRate > 80 ? 'hard' : agent.successRate > 60 ? 'medium' : 'easy';
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a ${difficulty} training scenario for agent to practice ${agent.weaknesses[0]}. Include problem description, success criteria, and collaboration opportunities.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          difficulty: { type: 'string' },
          objectives: { type: 'array', items: { type: 'string' } },
          collaboration_required: { type: 'boolean' },
          success_criteria: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setTrainingScenario(response);
  };

  const runSimulation = async () => {
    setSimulationRunning(true);
    
    // Simulate training
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const improvement = Math.random() * 15 + 5;
    setSimulationResults({
      completed: true,
      successRate: Math.min(100, selectedAgent.successRate + improvement),
      improvement: improvement,
      skillsGained: ['Enhanced ' + selectedAgent.weaknesses[0], 'Problem-solving level ' + (selectedAgent.level + 1)],
      timeToComplete: '2m 34s'
    });
    
    setSimulationRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Adaptive Training System</h3>

        {/* Agent Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {agents.map(agent => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedAgent(agent);
                setLearningPath(null);
                setTrainingScenario(null);
                setSimulationResults(null);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold">{agent.name}</h4>
                <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-400 text-xs font-semibold">
                  Level {agent.level}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Success Rate</span>
                  <span className="text-green-400 font-bold">{agent.successRate}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: `${agent.successRate}%` }} />
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-400">✓ {agent.strengths.join(', ')}</span>
                  <span className="text-orange-400">⚠ {agent.weaknesses.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedAgent && (
          <>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => generateLearningPath(selectedAgent)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Generate Learning Path
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => generateAdaptiveScenario(selectedAgent)}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Create Scenario
              </motion.button>
            </div>

            {/* Learning Path */}
            {learningPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
              >
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Personalized Learning Path
                </h4>
                <div className="space-y-2">
                  {learningPath.map((module, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{idx + 1}. {module.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          module.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          module.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Focus: {module.focus_area}</span>
                        <span className="text-cyan-400">+{module.expected_improvement}% improvement</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Training Scenario */}
            {trainingScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">{trainingScenario.title}</h4>
                  <p className="text-white/70 text-sm mb-3">{trainingScenario.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-xs mb-2">Objectives:</p>
                      {trainingScenario.objectives.map((obj, idx) => (
                        <p key={idx} className="text-white text-sm">• {obj}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-2">Success Criteria:</p>
                      {trainingScenario.success_criteria.map((crit, idx) => (
                        <p key={idx} className="text-green-400 text-sm">✓ {crit}</p>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={runSimulation}
                    disabled={simulationRunning}
                    className="w-full px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {simulationRunning ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full" />
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Training Simulation
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Simulation Results */}
            {simulationResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl"
              >
                <h4 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Training Complete!
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">New Success Rate</p>
                    <p className="text-3xl font-bold text-green-400">{simulationResults.successRate.toFixed(1)}%</p>
                    <p className="text-green-400 text-sm mt-1">+{simulationResults.improvement.toFixed(1)}% improvement</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Time to Complete</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.timeToComplete}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-white/60 text-sm mb-2">Skills Gained:</p>
                  <div className="flex gap-2 flex-wrap">
                    {simulationResults.skillsGained.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}