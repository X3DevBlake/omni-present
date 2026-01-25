import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketPredictionDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState(['BTC', 'ETH', 'SOL', 'MATIC']);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('ai-trading-engine', { symbols, action: 'analyze_predictions' });
      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg">Market Predictions</h3>
        <button
          onClick={loadPredictions}
          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-sm hover:bg-cyan-500/30"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {predictions.map((pred, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-bold text-lg">{pred.symbol}</h4>
                <p className="text-white/60 text-xs capitalize">{pred.sentiment}</p>
              </div>
              <span className="text-cyan-400 font-semibold text-sm">
                {pred.confidence}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">24h</p>
                <p className={`font-bold ${pred.price_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pred.price_24h > 0 ? '+' : ''}{pred.price_24h}%
                </p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">7d</p>
                <p className={`font-bold ${pred.price_7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pred.price_7d > 0 ? '+' : ''}{pred.price_7d}%
                </p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs">30d</p>
                <p className={`font-bold ${pred.price_30d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pred.price_30d > 0 ? '+' : ''}{pred.price_30d}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-white/60">Support: </span>
                <span className="text-green-400 font-semibold">${pred.support_level}</span>
              </div>
              <div>
                <span className="text-white/60">Resistance: </span>
                <span className="text-red-400 font-semibold">${pred.resistance_level}</span>
              </div>
              <div>
                <span className="text-white/60">Volatility: </span>
                <span className="text-yellow-400 font-semibold">{pred.volatility}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}