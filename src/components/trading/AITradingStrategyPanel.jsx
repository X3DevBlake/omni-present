import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';


export default function AITradingStrategyPanel({ userEmail }) {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [preferences, setPreferences] = useState({
    risk_level: 'moderate',
    portfolio_size: 10000,
    target_assets: ['ETH', 'BTC', 'USDT']
  });

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('ai-trading-engine', { 
        user_email: userEmail, 
        preferences, 
        action: 'generate_strategy' 
      });
      setStrategy(response.data.strategy);
    } catch (error) {
      console.error('Error generating strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action) => {
    setExecuting(true);
    try {
      await base44.functions.invoke('ai-trading-engine', {
        user_email: userEmail,
        action: 'execute_trade',
        trade_data: {
          symbol: action.symbol,
          action_type: action.type,
          amount: action.amount,
          price_limit: action.entry_point
        }
      });
      alert(`Trade executed: ${action.type} ${action.symbol}`);
    } catch (error) {
      alert(`Trade failed: ${error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-white font-bold">Strategy Preferences</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-white/60 text-xs">Risk Level</label>
            <select
              value={preferences.risk_level}
              onChange={(e) => setPreferences({ ...preferences, risk_level: e.target.value })}
              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-white/60 text-xs">Portfolio Size</label>
            <input
              type="number"
              value={preferences.portfolio_size}
              onChange={(e) => setPreferences({ ...preferences, portfolio_size: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
            />
          </div>
        </div>
        <button
          onClick={generateStrategy}
          disabled={loading}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate AI Strategy
            </>
          )}
        </button>
      </div>

      {/* Strategy Display */}
      {strategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-lg">{strategy.strategy_name}</h3>
              <span className="text-cyan-400 font-semibold text-sm">
                {strategy.confidence_score}% Confidence
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">Risk Level</p>
                <p className="text-white font-semibold capitalize">{strategy.risk_level}</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">Expected ROI</p>
                <p className="text-green-400 font-semibold">{strategy.expected_roi}%</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">Time Horizon</p>
                <p className="text-white font-semibold capitalize">{strategy.time_horizon}</p>
              </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Market Sentiment</h4>
            <div className="space-y-2">
              {Object.entries(strategy.market_sentiment || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-white/60 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Recommended Actions</h4>
            <div className="space-y-3">
              {strategy.recommended_actions?.map((action, idx) => (
                <div key={idx} className="bg-white/5 rounded p-3 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {action.type === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-bold ${action.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {action.type?.toUpperCase()} {action.symbol}
                      </span>
                    </div>
                    <span className="text-white text-sm">${action.amount}</span>
                  </div>
                  <div className="text-xs text-white/60 space-y-1">
                    <p>Entry: ${action.entry_point} • Exit: ${action.exit_point}</p>
                    <p>Expected Profit: {action.expected_profit}%</p>
                  </div>
                  <button
                    onClick={() => executeAction(action)}
                    disabled={executing}
                    className="mt-2 w-full px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-xs font-semibold hover:bg-cyan-500/30 disabled:opacity-50"
                  >
                    {executing ? 'Executing...' : 'Execute Trade'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* News Analysis */}
          {strategy.news_analysis?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">News Impact Analysis</h4>
              <div className="space-y-2">
                {strategy.news_analysis.slice(0, 3).map((news, idx) => (
                  <div key={idx} className="bg-white/5 rounded p-2">
                    <p className="text-white text-xs">{news.headline || news.title}</p>
                    <p className="text-white/60 text-xs mt-1">
                      Impact: <span className="text-cyan-400">{news.impact}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}