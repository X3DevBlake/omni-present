import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealTimeMarketFeed() {
  const [marketData, setMarketData] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to real-time updates
    const unsubscribe = base44.entities.CryptoAsset.subscribe((event) => {
      if (event.type === 'update') {
        setMarketData(prev => {
          const index = prev.findIndex(item => item.id === event.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = event.data;
            return updated;
          }
          return prev;
        });
      }
    });

    setIsLive(true);
    return () => {
      unsubscribe();
      setIsLive(false);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const assets = await base44.entities.CryptoAsset.list('-market_cap', 20);
      setMarketData(assets);
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Live Market Feed
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white/60 text-xs">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="grid gap-2 max-h-[600px] overflow-y-auto">
        {marketData.map((asset, idx) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{asset.symbol?.slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{asset.symbol}</p>
                  <p className="text-white/60 text-xs">{asset.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-bold">${asset.current_price?.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {asset.price_change_24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${asset.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.price_change_24h >= 0 ? '+' : ''}{asset.price_change_24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-white/60">Volume 24h</p>
                <p className="text-white font-semibold">${(asset.volume_24h / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-white/60">Market Cap</p>
                <p className="text-white font-semibold">${(asset.market_cap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-white/60">7d Change</p>
                <p className={`font-semibold ${asset.price_change_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.price_change_7d >= 0 ? '+' : ''}{asset.price_change_7d?.toFixed(2)}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}