import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, AlertTriangle, TrendingUp, Brain, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIFeedbackSystem({ agents, scenario, onAgentUpdate }) {
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      evaluateAgentPerformance();
    }, 5000);
    return () => clearInterval(interval);
  }, [agents, scenario]);

  const evaluateAgentPerformance = async () => {
    for (const agent of agents) {
      const performance = calculatePerformance(agent, scenario);
      const feedback = generateFeedback(agent, performance);
      
      // Apply rewards/penalties
      if (feedback.reward !== 0) {
        await applyFeedback(agent, feedback);
        
        setFeedbackLog(prev => [{
          id: Date.now(),
          agentId: agent.id,
          agentName: agent.name,
          type: feedback.type,
          message: feedback.message,
          reward: feedback.reward,
          timestamp: new Date()
        }, ...prev.slice(0, 19)]);
      }

      setAgentPerformance(prev => ({
        ...prev,
        [agent.id]: performance
      }));
    }
  };

  const calculatePerformance = (agent, scenario) => {
    const baseScore = 50;
    const knowledgeBonus = (agent.knowledge_count || 0) * 2;
    const scenarioMultiplier = {
      resource_gathering: Math.random() * 30,
      collaborative: Math.random() * 25,
      adversarial: Math.random() * 35,
      open_world: Math.random() * 20
    }[scenario] || 20;

    return Math.min(100, baseScore + knowledgeBonus + scenarioMultiplier);
  };

  const generateFeedback = (agent, performance) => {
    if (performance > 80) {
      return {
        type: 'reward',
        message: `Excellent performance in ${scenario}`,
        reward: 10,
        learningAdjustment: 1.2
      };
    } else if (performance < 40) {
      return {
        type: 'penalty',
        message: `Needs improvement in ${scenario}`,
        reward: -5,
        learningAdjustment: 0.8
      };
    } else {
      return {
        type: 'neutral',
        message: 'Moderate performance',
        reward: 0,
        learningAdjustment: 1.0
      };
    }
  };

  const applyFeedback = async (agent, feedback) => {
    // Update agent's perception rate based on performance
    const newPerceptionRate = adjustPerceptionRate(
      agent.perception_rate || '247 zeptoseconds',
      feedback.learningAdjustment
    );

    await base44.entities.Agent.update(agent.id, {
      perception_rate: newPerceptionRate,
      omni_budget: (agent.omni_budget || 0) + feedback.reward
    });

    if (onAgentUpdate) onAgentUpdate(agent.id, feedback);

    if (feedback.type === 'reward') {
      toast.success(`${agent.name} earned reward!`, { icon: '🏆' });
    }
  };

  const adjustPerceptionRate = (currentRate, multiplier) => {
    const value = parseFloat(currentRate);
    const newValue = Math.max(1, value / multiplier);
    return `${newValue.toFixed(0)} zeptoseconds`;
  };

  const getFeedbackIcon = (type) => {
    switch(type) {
      case 'reward': return Award;
      case 'penalty': return AlertTriangle;
      default: return Zap;
    }
  };

  const getFeedbackColor = (type) => {
    switch(type) {
      case 'reward': return 'green';
      case 'penalty': return 'red';
      default: return 'yellow';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Performance Dashboard */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold text-xl">AI Feedback System</h3>
        </div>

        <div className="space-y-3">
          {agents.map(agent => {
            const performance = agentPerformance[agent.id] || 50;
            return (
              <div key={agent.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{agent.name}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${performance > 70 ? 'text-green-400' : 'text-yellow-400'}`} />
                    <span className="text-white">{performance.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${performance > 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${performance}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="mt-2 text-xs text-white/60">
                  Budget: {agent.omni_budget || 0} OMNI | Rate: {agent.perception_rate || 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Log */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Feedback Log</h3>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {feedbackLog.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              Waiting for agent performance data...
            </div>
          ) : (
            feedbackLog.map(log => {
              const Icon = getFeedbackIcon(log.type);
              const color = getFeedbackColor(log.type);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-${color}-500/10 border border-${color}-500/30 rounded-lg p-3`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${color}-400 flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="text-white text-sm font-semibold">{log.agentName}</div>
                      <div className="text-white/70 text-xs">{log.message}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-${color}-400 text-xs`}>
                          {log.reward > 0 ? '+' : ''}{log.reward} OMNI
                        </span>
                        <span className="text-white/40 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}