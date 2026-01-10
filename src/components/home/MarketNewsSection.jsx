import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, NewspaperIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MarketNewsSection() {
  const { data: markets = [] } = useQuery({
    queryKey: ['topMarkets'],
    queryFn: () => base44.entities.MarketAsset.list().catch(() => [])
  });

  const topMovers = (markets || [])
    .filter(m => m && m.price_change_24h !== undefined)
    .sort((a, b) => Math.abs(b.price_change_24h || 0) - Math.abs(a.price_change_24h || 0))
    .slice(0, 6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <NewspaperIcon className="w-10 h-10 text-cyan-400" />
            Market <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Trends</span>
          </h2>
          <p className="text-white/60">Real-time market movements and sentiment analysis</p>
        </motion.div>

        {topMovers.length === 0 ? (
          <div className="text-center py-8 text-white/40">No market data available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMovers.map((market, idx) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{market.symbol}</h3>
                    <p className="text-white/60 text-sm">{market.name}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${market.price_change_24h >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {market.price_change_24h >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">${market.current_price?.toFixed(2) || 'N/A'}</div>
                  <div className={`text-sm font-semibold ${market.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {market.price_change_24h >= 0 ? '+' : ''}{market.price_change_24h?.toFixed(2) || 0}%
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{market.sector}</span>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                    {Math.abs(market.sentiment_score || 0) > 0.5 ? '🔥 Hot' : '📊 Stable'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}