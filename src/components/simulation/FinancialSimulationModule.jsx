import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3, Settings, Pause } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function FinancialSimulationModule() {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Bull Market', volatility: 0.1, trend: 0.05, description: 'Steady upward market movement' },
    { id: 2, name: 'Bear Market', volatility: 0.2, trend: -0.03, description: 'Declining market conditions' },
    { id: 3, name: 'High Volatility', volatility: 0.4, trend: 0, description: 'Extreme price swings' }
  ]);
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationData, setSimulationData] = useState([]);
  const [agents, setAgents] = useState([
    { id: 1, name: 'Conservative Bot', strategy: 'hold' },
    { id: 2, name: 'Aggressive Bot', strategy: 'trade' },
    { id: 3, name: 'Balanced Bot', strategy: 'rebalance' }
  ]);
  const [agentResults, setAgentResults] = useState({});

  const runSimulation = async () => {
    if (!selectedScenario) {
      toast.error('Select a scenario');
      return;
    }

    setIsRunning(true);
    const data = [];
    let prices = { BTC: 50000, ETH: 3000, USDT: 1 };

    for (let i = 0; i < 100; i++) {
      const volatility = selectedScenario.volatility * (Math.random() - 0.5) * 2;
      const trend = selectedScenario.trend;

      prices.BTC = Math.max(1000, prices.BTC * (1 + trend + volatility));
      prices.ETH = Math.max(100, prices.ETH * (1 + trend + volatility * 1.5));

      data.push({
        time: i,
        BTC: Math.round(prices.BTC),
        ETH: Math.round(prices.ETH),
        scenario: selectedScenario.name
      });
    }

    setSimulationData(data);

    const results = {};
    agents.forEach(agent => {
      const finalPrice = data[data.length - 1];
      const strategy = agent.strategy;
      let return_pct = 0;

      if (strategy === 'hold') {
        return_pct = ((finalPrice.BTC - 50000) / 50000) * 100;
      } else if (strategy === 'trade') {
        return_pct = ((finalPrice.BTC - 50000) / 50000) * 100 * 1.5;
      } else if (strategy === 'rebalance') {
        return_pct = ((finalPrice.BTC - 50000) / 50000) * 100 * 0.8;
      }

      results[agent.id] = {
        name: agent.name,
        return: return_pct.toFixed(2),
        finalPortfolio: Math.round(100000 * (1 + return_pct / 100))
      };
    });

    setAgentResults(results);
    setIsRunning(false);
    toast.success('Simulation complete!');
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <motion.button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario)}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedScenario.id === scenario.id
                ? 'bg-cyan-500/20 border-cyan-500/60'
                : 'bg-black/40 border-white/10 hover:border-white/30'
            }`}
          >
            <p className="text-white font-bold">{scenario.name}</p>
            <p className="text-white/60 text-xs mt-1">{scenario.description}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-white/50">Volatility: {(scenario.volatility * 100).toFixed(0)}%</p>
              <p className={scenario.trend > 0 ? 'text-green-400' : scenario.trend < 0 ? 'text-red-400' : 'text-white/50'}>
                Trend: {(scenario.trend * 100).toFixed(1)}%
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={runSimulation}
        disabled={isRunning}
        whileHover={{ scale: 1.02 }}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isRunning ? 'Running Simulation...' : 'Run Simulation'}
      </motion.button>

      {simulationData.length > 0 && (
        <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Market Price Evolution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(0,245,255,0.3)' }} />
              <Legend />
              <Line type="monotone" dataKey="BTC" stroke="#f7931a" strokeWidth={2} />
              <Line type="monotone" dataKey="ETH" stroke="#627eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold">Agent Strategy Performance</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
            >
              <p className="text-white font-bold text-sm">{agent.name}</p>
              <p className="text-white/60 text-xs capitalize">{agent.strategy} strategy</p>
              {agentResults[agent.id] ? (
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <p className={`font-bold ${
                    parseFloat(agentResults[agent.id].return) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {agentResults[agent.id].return}% return
                  </p>
                  <p className="text-white/60 text-xs">
                    Portfolio: ${agentResults[agent.id].finalPortfolio.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-white/40 text-xs pt-2">Run simulation to see results</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}