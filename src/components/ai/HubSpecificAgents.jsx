import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Brain, Cpu, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HubSpecificAgents({ hubType = 'omni' }) {
  const [agents, setAgents] = useState([]);
  const [activeStrategies, setActiveStrategies] = useState({});
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    loadHubAgents();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, [hubType]);

  const loadHubAgents = async () => {
    try {
      const user = await base44.auth.me();
      const userAgents = await base44.entities.Agent.filter({ created_by: user.email });
      const hubAgents = enrichAgentsForHub(userAgents, hubType);
      setAgents(hubAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const enrichAgentsForHub = (agents, hub) => {
    const capabilities = {
      omni: {
        strategies: ['automated_trading', 'risk_management', 'portfolio_rebalancing', 'arbitrage_detection'],
        metrics: ['roi', 'sharpe_ratio', 'max_drawdown', 'win_rate']
      },
      labs: {
        strategies: ['hypothesis_testing', 'data_analysis', 'pattern_discovery', 'knowledge_synthesis'],
        metrics: ['discoveries', 'accuracy', 'learning_rate', 'insights_generated']
      },
      simulation: {
        strategies: ['emergent_behavior', 'adversarial_learning', 'coalition_formation', 'adaptive_strategy'],
        metrics: ['behavior_complexity', 'adaptability', 'cooperation_score', 'innovation_index']
      },
      devices: {
        strategies: ['predictive_maintenance', 'autonomous_operation', 'resource_optimization', 'anomaly_detection'],
        metrics: ['uptime', 'efficiency', 'failures_prevented', 'optimization_gains']
      }
    };

    return agents.map(agent => ({
      ...agent,
      capabilities: capabilities[hub] || capabilities.omni,
      status: 'active'
    }));
  };

  const updateMetrics = async () => {
    const newMetrics = {};
    agents.forEach(agent => {
      newMetrics[agent.id] = {
        primary: Math.floor(Math.random() * 40) + 60,
        secondary: Math.floor(Math.random() * 30) + 50,
        efficiency: Math.floor(Math.random() * 20) + 80
      };
    });
    setMetrics(newMetrics);
  };

  const toggleStrategy = (agentId, strategy) => {
    setActiveStrategies(prev => ({
      ...prev,
      [agentId]: prev[agentId] === strategy ? null : strategy
    }));
  };

  const getHubColor = (hub) => {
    const colors = {
      omni: { bg: 'purple-500', border: 'purple-500' },
      labs: { bg: 'pink-500', border: 'pink-500' },
      simulation: { bg: 'amber-500', border: 'amber-500' },
      devices: { bg: 'cyan-500', border: 'cyan-500' }
    };
    return colors[hub] || colors.omni;
  };

  const getHubLabel = (hub) => {
    const labels = {
      omni: 'Trading & Risk',
      labs: 'Research & Discovery',
      simulation: 'Emergent Behaviors',
      devices: 'Maintenance & Operations'
    };
    return labels[hub] || 'Agents';
  };

  const colors = getHubColor(hubType);

  return (
    <div className={`bg-black/40 backdrop-blur-xl border border-${colors.border}/30 rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className={`w-6 h-6 text-${colors.bg}`} />
          <div>
            <h3 className="text-white font-bold">{getHubLabel(hubType)} Agents</h3>
            <p className="text-white/60 text-sm">Hub-optimized autonomous agents</p>
          </div>
        </div>
        <span className={`px-3 py-1 bg-${colors.bg}/20 border border-${colors.border}/50 rounded-full text-${colors.bg} text-sm font-semibold`}>
          {agents.length} active
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {agents.map((agent, idx) => {
            const agentMetrics = metrics[agent.id];
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-r from-${colors.bg}/10 to-${colors.bg}/5 border border-${colors.border}/20 rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
                    <p className="text-white/60 text-xs">{agent.status}</p>
                  </div>
                  {agentMetrics && (
                    <div className="text-right">
                      <div className={`text-lg font-bold text-${colors.bg}`}>{agentMetrics.primary}%</div>
                      <div className="text-white/40 text-xs">Performance</div>
                    </div>
                  )}
                </div>

                {/* Strategies Grid */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {agent.capabilities.strategies.slice(0, 2).map(strategy => (
                    <button
                      key={strategy}
                      onClick={() => toggleStrategy(agent.id, strategy)}
                      className={`text-xs px-2 py-1 rounded-md capitalize transition-all ${
                        activeStrategies[agent.id] === strategy
                          ? `bg-${colors.bg}/30 border border-${colors.border}/50 text-white`
                          : `bg-white/5 border border-white/10 text-white/60 hover:bg-white/10`
                      }`}
                    >
                      {strategy.split('_').join(' ')}
                    </button>
                  ))}
                </div>

                {/* Metrics */}
                {agentMetrics && (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${colors.bg}/60 to-${colors.bg}`}
                        style={{ width: `${agentMetrics.efficiency}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/60">{agentMetrics.efficiency}%</div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {agents.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            No agents deployed yet. Create one in the agent manager.
          </div>
        )}
      </div>
    </div>
  );
}