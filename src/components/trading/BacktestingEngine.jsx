import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Loader, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BacktestingEngine({ userEmail }) {
  const [strategy, setStrategy] = useState({
    name: '',
    entry_conditions: '',
    exit_conditions: '',
    position_size: 1000,
    timeframe: '30d'
  });
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runBacktest = async () => {
    setTesting(true);
    try {
      const prompt = `Backtest this trading strategy:

Strategy: ${strategy.name}
Entry Conditions: ${strategy.entry_conditions}
Exit Conditions: ${strategy.exit_conditions}
Position Size: $${strategy.position_size}
Timeframe: ${strategy.timeframe}

Use historical data and provide:
1. Total return %
2. Win rate
3. Max drawdown
4. Number of trades
5. Average profit per trade
6. Sharpe ratio
7. Trade-by-trade breakdown

Return as JSON.`;

      const backtestResults = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            total_return: { type: 'number' },
            win_rate: { type: 'number' },
            max_drawdown: { type: 'number' },
            num_trades: { type: 'number' },
            avg_profit: { type: 'number' },
            sharpe_ratio: { type: 'number' },
            trades: { type: 'array', items: { type: 'object' } }
          }
        }
      });

      setResults(backtestResults);
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Input */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-white font-bold">Define Strategy</h3>
        <input
          type="text"
          placeholder="Strategy Name"
          value={strategy.name}
          onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
        />
        <textarea
          placeholder="Entry Conditions (e.g., RSI < 30 and MACD positive)"
          value={strategy.entry_conditions}
          onChange={(e) => setStrategy({ ...strategy, entry_conditions: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-20"
        />
        <textarea
          placeholder="Exit Conditions (e.g., 15% profit or 5% loss)"
          value={strategy.exit_conditions}
          onChange={(e) => setStrategy({ ...strategy, exit_conditions: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-20"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/60 text-xs">Position Size</label>
            <input
              type="number"
              value={strategy.position_size}
              onChange={(e) => setStrategy({ ...strategy, position_size: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs">Timeframe</label>
            <select
              value={strategy.timeframe}
              onChange={(e) => setStrategy({ ...strategy, timeframe: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
        </div>
        <button
          onClick={runBacktest}
          disabled={testing}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Running Backtest...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Run Backtest
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Backtest Results
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded p-3">
                <p className="text-white/60 text-xs">Total Return</p>
                <p className="text-green-400 font-bold text-2xl">{results.total_return}%</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <p className="text-white/60 text-xs">Win Rate</p>
                <p className="text-cyan-400 font-bold text-2xl">{results.win_rate}%</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <p className="text-white/60 text-xs">Max Drawdown</p>
                <p className="text-red-400 font-bold text-2xl">{results.max_drawdown}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Performance Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Number of Trades</span>
                <span className="text-white font-semibold">{results.num_trades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Avg Profit/Trade</span>
                <span className="text-green-400 font-semibold">${results.avg_profit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Sharpe Ratio</span>
                <span className="text-cyan-400 font-semibold">{results.sharpe_ratio}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}