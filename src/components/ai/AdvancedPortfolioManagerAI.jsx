import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdvancedPortfolioManagerAI() {
  const [aiStatus, setAiStatus] = useState('analyzing');
  const [predictions, setPredictions] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate AI predictions
      const mockPredictions = [
        { asset: 'BTC', action: 'BUY', confidence: 87, reason: 'Strong bullish indicators detected' },
        { asset: 'ETH', action: 'HOLD', confidence: 72, reason: 'Consolidation phase expected' },
        { asset: 'OMNI', action: 'BUY', confidence: 94, reason: 'Upcoming protocol upgrade momentum' }
      ];
      setPredictions(mockPredictions);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const executeAITrade = async (prediction) => {
    setAiStatus('executing');
    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const trade = {
        asset: prediction.asset,
        action: prediction.action,
        amount: Math.random() * 1000,
        timestamp: new Date().toISOString(),
        profit: (Math.random() * 10 - 2).toFixed(2)
      };
      
      setExecutedTrades([trade, ...executedTrades].slice(0, 10));
      toast.success(`AI executed ${prediction.action} for ${prediction.asset}`);
      setAiStatus('monitoring');
    } catch (err) {
      toast.error('Trade execution failed');
      setAiStatus('error');
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Advanced AI Portfolio Manager
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          aiStatus === 'analyzing' ? 'bg-blue-500/20 text-blue-400' :
          aiStatus === 'executing' ? 'bg-yellow-500/20 text-yellow-400' :
          aiStatus === 'monitoring' ? 'bg-green-500/20 text-green-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {aiStatus.toUpperCase()}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            AI Predictions
          </h4>
          <div className="space-y-3">
            {predictions.map((pred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold">{pred.asset}</div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    pred.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    pred.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pred.action}
                  </div>
                </div>
                <div className="text-white/60 text-sm mb-2">{pred.reason}</div>
                <div className="flex items-center justify-between">
                  <div className="text-cyan-400 text-sm">Confidence: {pred.confidence}%</div>
                  <button
                    onClick={() => executeAITrade(pred)}
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs font-bold"
                  >
                    Execute
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent AI Trades
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {executedTrades.map((trade, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-bold text-sm">{trade.asset} - {trade.action}</div>
                  <div className={`text-sm font-bold ${parseFloat(trade.profit) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(trade.profit) > 0 ? '+' : ''}{trade.profit}%
                  </div>
                </div>
                <div className="text-white/60 text-xs">
                  {new Date(trade.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}