import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketDataFeed() {
  const [marketData, setMarketData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('OMNI');
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    generateMarketData();
    const interval = setInterval(updateMarketData, 3000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  const generateMarketData = () => {
    const assets = {
      OMNI: { price: 245.32, change: 2.45, sentiment: 'bullish' },
      ETH: { price: 2543.87, change: -1.23, sentiment: 'neutral' },
      BTC: { price: 42156.89, change: 3.12, sentiment: 'bullish' },
      USDT: { price: 1.0, change: 0.01, sentiment: 'stable' }
    };

    const historicalData = [...Array(20)].map((_, i) => {
      const basePrice = assets[selectedAsset].price;
      const volatility = Math.sin(i / 5) * basePrice * 0.02;
      return {
        time: `${20 - i}h`,
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.05 + volatility
      };
    }).reverse();

    setMarketData(historicalData);
    setSentiment(assets[selectedAsset]);
  };

  const updateMarketData = () => {
    setMarketData(prev => {
      if (prev.length === 0) return prev;
      const newData = [...prev.slice(1)];
      const lastPrice = prev[prev.length - 1].price;
      newData.push({
        time: 'now',
        price: lastPrice + (Math.random() - 0.5) * lastPrice * 0.02
      });
      return newData;
    });

    setSentiment(prev => prev ? {
      ...prev,
      price: prev.price + (Math.random() - 0.5) * prev.price * 0.01,
      change: prev.change + (Math.random() - 0.5) * 2
    } : null);
  };

  return (
    <div className="space-y-4">
      {/* Asset Selection */}
      <div className="flex gap-2">
        {['OMNI', 'ETH', 'BTC', 'USDT'].map(asset => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedAsset === asset
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Price Card */}
      {sentiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black/60 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                ${sentiment.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                {sentiment.change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <span className={sentiment.change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {sentiment.change > 0 ? '+' : ''}{sentiment.change.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Sentiment Badge */}
            <div className={`px-3 py-2 rounded-lg font-semibold text-sm capitalize ${
              sentiment.sentiment === 'bullish' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : sentiment.sentiment === 'bearish'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {sentiment.sentiment}
            </div>
          </div>

          {/* Chart */}
          <div className="h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(0,245,255,0.3)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#00f5ff"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Market Alerts */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-blue-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-xs">24h Volume</span>
          </div>
          <div className="text-white font-bold">${(Math.random() * 500 + 300).toFixed(0)}M</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-xs">Volatility</span>
          </div>
          <div className="text-white font-bold">{(Math.random() * 40 + 15).toFixed(1)}%</div>
        </motion.div>
      </div>

      {/* News Sentiment */}
      <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-3">
        <div className="text-white/60 text-xs mb-2">Market Sentiment</div>
        <div className="space-y-2">
          {[
            { title: 'ETH gains despite market turmoil', sentiment: 'positive' },
            { title: 'DeFi protocols see increased TVL', sentiment: 'positive' },
            { title: 'Regulatory concerns weigh on market', sentiment: 'negative' }
          ].map((news, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                news.sentiment === 'positive' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-white/70">{news.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}