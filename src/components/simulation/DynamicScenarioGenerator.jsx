import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, TrendingDown, Users, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DynamicScenarioGenerator({ agents, isRunning, scenario, onScenarioUpdate }) {
  const [generatedChallenges, setGeneratedChallenges] = useState([]);
  const [agentMetrics, setAgentMetrics] = useState({});
  const [scenarioIntensity, setScenarioIntensity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isRunning) {
      generateDynamicChallenges();
      const interval = setInterval(generateDynamicChallenges, 5000);
      return () => clearInterval(interval);
    }
  }, [isRunning, agents, scenarioIntensity]);

  const generateDynamicChallenges = async () => {
    setIsGenerating(true);
    try {
      // Analyze agent performance
      const metrics = agents.reduce((acc, agent) => ({
        ...acc,
        [agent.id]: {
          performance: agent.knowledge_count || 0,
          efficiency: Math.random() * 100,
          collaboration: Math.random() * 100
        }
      }), {});
      setAgentMetrics(metrics);

      // Generate challenges based on performance
      const challenges = [];
      const scenarioMap = {
        'open_world': 'resource_scarcity',
        'resource_gathering': 'competitive_pressure',
        'collaborative': 'coordination_test',
        'adversarial': 'adversarial_agent'
      };

      const baseChallenge = scenarioMap[scenario] || 'dynamic_challenge';
      const avgPerformance = Object.values(metrics).reduce((sum, m) => sum + m.performance, 0) / agents.length;

      challenges.push({
        id: `challenge_${Date.now()}`,
        type: baseChallenge,
        intensity: Math.min(avgPerformance / 10 + scenarioIntensity, 5),
        description: generateChallengeDescription(baseChallenge, avgPerformance),
        affectedAgents: selectAffectedAgents(agents, avgPerformance),
        rewards: Math.floor(avgPerformance * 10),
        timestamp: new Date().toISOString()
      });

      setGeneratedChallenges(prev => [...prev.slice(-5), ...challenges]);
      onScenarioUpdate?.(challenges[0]);
    } catch (error) {
      console.error('Error generating challenges:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateChallengeDescription = (type, performance) => {
    const descriptions = {
      'resource_scarcity': `Resources limited to ${Math.floor(100 - performance)}% of normal availability`,
      'competitive_pressure': `${Math.floor(performance / 2)} competing agents entering the arena`,
      'coordination_test': `Team challenge: collective goal requires ${Math.ceil(5 - performance / 20)} coordination points`,
      'adversarial_agent': `Adversarial agent spawned with ${Math.floor(50 + performance)}% capability match`,
      'dynamic_challenge': `Adaptive challenge scaled to difficulty ${Math.floor(performance / 20)}`
    };
    return descriptions[type] || 'Unknown challenge type';
  };

  const selectAffectedAgents = (agentList, performance) => {
    const count = Math.max(1, Math.floor(agentList.length * Math.min(performance / 100, 1)));
    return agentList.slice(0, count).map(a => a.id);
  };

  const analyzePerformancePattern = () => {
    const patterns = Object.values(agentMetrics).map(m => ({
      efficiency: m.efficiency,
      collaboration: m.collaboration,
      performance: m.performance
    }));
    
    const avgEfficiency = patterns.reduce((sum, p) => sum + p.efficiency, 0) / patterns.length;
    return avgEfficiency > 60 ? 'high' : avgEfficiency > 40 ? 'moderate' : 'low';
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-white font-bold">AI Scenario Generator</h3>
            <p className="text-white/60 text-sm">Dynamic challenges based on agent performance</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full">
          <span className="text-cyan-400 text-sm font-semibold">Pattern: {analyzePerformancePattern()}</span>
        </div>
      </div>

      {/* Intensity Control */}
      <div className="mb-6 bg-white/5 rounded-xl p-4">
        <div className="flex justify-between mb-3">
          <span className="text-white/60 text-sm">Challenge Intensity</span>
          <span className="text-white font-semibold">{scenarioIntensity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={scenarioIntensity}
          onChange={(e) => setScenarioIntensity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Generated Challenges */}
      <div className="space-y-3">
        <AnimatePresence>
          {generatedChallenges.map((challenge, idx) => {
            const iconMap = {
              'resource_scarcity': AlertTriangle,
              'competitive_pressure': TrendingDown,
              'coordination_test': Users,
              'adversarial_agent': Zap
            };
            const Icon = iconMap[challenge.type] || AlertTriangle;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-cyan-500/20 rounded-lg">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold capitalize text-sm">
                        {challenge.type.replace(/_/g, ' ')}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        challenge.intensity > 3 ? 'bg-red-500/20 text-red-400' :
                        challenge.intensity > 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        Intensity: {challenge.intensity.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2">{challenge.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/40">
                        {challenge.affectedAgents.length} agent(s) affected
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold">
                        +{challenge.rewards} reward points
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {generatedChallenges.length === 0 && !isRunning && (
          <div className="text-center py-4 text-white/40 text-sm">
            Start simulation to generate challenges
          </div>
        )}
      </div>
    </div>
  );
}