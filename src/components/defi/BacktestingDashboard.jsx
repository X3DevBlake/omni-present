import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Target, Loader, Play, ZapOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function BacktestingDashboard() {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [timeframe, setTimeframe] = useState('3mo');

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const strats = await base44.entities.TradingStrategy.list('-created_date', 10);
      setStrategies(strats);
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  };

  const defineNewStrategy = async () => {
    if (!objectiveInput.trim()) return;
    setLoading(true);
    
    try {
      const user = await base44.auth.me();
      const strategy = await base44.integrations.Core.InvokeLLM({
        prompt: `Define DeFi trading strategy:
        Objective: ${objectiveInput}
        Risk Tolerance: moderate
        
        Create specific entry/exit rules, position sizing, and rebalancing logic.`,
      });

      setSelectedStrategy(strategy);
      setObjectiveInput('');
      loadStrategies();
    } catch (error) {
      console.error('Error defining strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const runBacktest = async () => {
    if (!selectedStrategy) return;
    setLoading(true);

    try {
      const results = await base44.integrations.Core.InvokeLLM({
        prompt: `Backtest strategy over ${timeframe}:
        Strategy: ${JSON.stringify(selectedStrategy)}
        
        Return:
        1. Equity curve (daily)
        2. Metrics: Sharpe, Drawdown, Win rate
        3. Benchmark comparison
        4. Trade log
        5. Risk analysis`,
        response_json_schema: {
          type: 'object',
          properties: {
            equityCurve: { type: 'array' },
            metrics: { type: 'object' },
            benchmarkComparison: { type: 'object' },
            trades: { type: 'array' },
            recommendations: { type: 'array' },
          },
        },
      });

      setBacktestResults(results);
    } catch (error) {
      console.error('Error backtesting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
          <TabsTrigger value="strategies" className="flex items-center gap-1">
            <Target className="w-3 h-3" /> Strategies
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Backtest
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Analysis
          </TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-white font-bold">Define Strategy with Gemini</p>
            <div className="space-y-2">
              <textarea
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                placeholder="Describe your strategy objective (e.g., 'Maximize yield farming returns while keeping risk below 5% drawdown')..."
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm h-20 resize-none"
              />
              <button
                onClick={defineNewStrategy}
                disabled={loading || !objectiveInput.trim()}
                className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin inline" /> : 'Define Strategy'}
              </button>
            </div>
          </div>

          {/* Strategy List */}
          <div className="space-y-2">
            {strategies.map((strat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStrategy(strat)}
                className={`bg-white/5 border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedStrategy?.id === strat.id
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-white font-bold text-sm">{strat.strategy_name}</p>
                <p className="text-white/60 text-xs">Created: {new Date(strat.created_date).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Backtest Tab */}
        <TabsContent value="backtest" className="space-y-3">
          {selectedStrategy ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <p className="text-white font-bold">{selectedStrategy.strategy_name}</p>
                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Timeframe:</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="1mo">1 Month</option>
                    <option value="3mo">3 Months</option>
                    <option value="1y">1 Year</option>
                    <option value="2y">2 Years</option>
                  </select>
                </div>
                <button
                  onClick={runBacktest}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-green-500/20 border border-green-400 rounded text-green-300 hover:bg-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Running Backtest...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Backtest
                    </>
                  )}
                </button>
              </div>

              {backtestResults && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  <p className="text-white font-bold text-sm">Equity Curve</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={backtestResults.equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis stroke="#ffffff40" />
                      <YAxis stroke="#ffffff40" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e' }} />
                      <Line type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60">Select a strategy to backtest</p>
            </div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-3">
          {backtestResults?.metrics && (
            <div className="grid grid-cols-2 gap-3">
              <MetricBox label="Total Return" value={backtestResults.metrics.totalReturn} suffix="%" />
              <MetricBox label="Sharpe Ratio" value={backtestResults.metrics.sharpeRatio} />
              <MetricBox label="Max Drawdown" value={backtestResults.metrics.maxDrawdown} suffix="%" />
              <MetricBox label="Win Rate" value={backtestResults.metrics.winRate} suffix="%" />
            </div>
          )}

          {backtestResults?.recommendations && (
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3 space-y-2">
              <p className="text-cyan-300 font-bold text-sm">AI Recommendations</p>
              {backtestResults.recommendations.map((rec, idx) => (
                <p key={idx} className="text-white/70 text-xs">• {rec}</p>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricBox({ label, value, suffix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/5 border border-white/10 rounded p-3"
    >
      <p className="text-white/60 text-xs">{label}</p>
      <p className="text-cyan-300 font-bold text-lg">{value?.toFixed(2)}{suffix}</p>
    </motion.div>
  );
}