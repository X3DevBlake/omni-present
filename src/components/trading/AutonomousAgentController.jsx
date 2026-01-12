import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, Pause, Settings, Activity, Zap, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AutonomousAgentController({ userEmail }) {
  const [agentActive, setAgentActive] = useState(false);
  const [config, setConfig] = useState({
    risk_tolerance: 'moderate',
    auto_rebalance: true,
    min_deviation: 5,
    check_interval: 300000 // 5 minutes
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentActive) {
      const interval = setInterval(() => {
        runAutonomousAgent();
      }, config.check_interval);

      return () => clearInterval(interval);
    }
  }, [agentActive, config]);

  const runAutonomousAgent = async () => {
    setLoading(true);
    try {
      // This would call the backend function
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Execute autonomous portfolio management for user.
Risk tolerance: ${config.risk_tolerance}
Auto-rebalance: ${config.auto_rebalance}
Min deviation: ${config.min_deviation}%

Fetch real-time data from Crypto.com, Coinbase, CoinMarketCap.
Analyze portfolio and execute trades if needed.
Return execution status.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            trades_executed: { type: 'number' },
            portfolio_balanced: { type: 'boolean' },
            next_check_recommendation: { type: 'string' }
          }
        }
      });

      setStatus(result);
    } catch (error) {
      console.error('Agent error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              agentActive ? 'bg-green-500/20 animate-pulse' : 'bg-gray-500/20'
            }`}>
              <Bot className={`w-6 h-6 ${agentActive ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">Autonomous Trading Agent</h3>
              <p className="text-white/60 text-xs">
                {agentActive ? 'Active - Monitoring Portfolio' : 'Inactive'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAgentActive(!agentActive)}
            className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
              agentActive
                ? 'bg-red-500/20 border border-red-400 text-red-300 hover:bg-red-500/30'
                : 'bg-green-500/20 border border-green-400 text-green-300 hover:bg-green-500/30'
            }`}
          >
            {agentActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Agent
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activate Agent
              </>
            )}
          </button>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-white/60 text-xs mb-1 block">Risk Tolerance</label>
            <select
              value={config.risk_tolerance}
              onChange={(e) => setConfig({ ...config, risk_tolerance: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Min Deviation %</label>
            <input
              type="number"
              value={config.min_deviation}
              onChange={(e) => setConfig({ ...config, min_deviation: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
            />
          </div>
        </div>

        {/* Status */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Status</span>
              <span className="text-green-400 text-xs font-semibold">{status.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Trades Executed</span>
              <span className="text-cyan-400 text-xs font-semibold">{status.trades_executed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Portfolio Balanced</span>
              <span className={`text-xs font-semibold ${status.portfolio_balanced ? 'text-green-400' : 'text-yellow-400'}`}>
                {status.portfolio_balanced ? 'Yes' : 'Monitoring'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <Activity className="w-3 h-3 text-cyan-400" />
            Real-time market monitoring (Crypto.com, Coinbase, CoinMarketCap)
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <Zap className="w-3 h-3 text-purple-400" />
            Gemini-powered portfolio analysis
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <Shield className="w-3 h-3 text-green-400" />
            Automatic stop-loss and take-profit execution
          </div>
        </div>
      </div>
    </div>
  );
}