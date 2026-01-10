import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export default function CryptoTokenGrid() {
  const { data: tokens = [] } = useQuery({
    queryKey: ['cryptoTokens'],
    queryFn: () => base44.entities.CryptoToken.list().catch(() => []),
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Available Tokens</h3>

      {tokens.length === 0 ? (
        <div className="text-center py-8 text-white/40">No tokens available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token, idx) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/50 rounded-lg p-4 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold">{token.symbol}</h4>
                    <span className="text-xs text-white/50">{token.name}</span>
                  </div>
                  <p className="text-white/60 text-xs mt-1">{token.blockchain}</p>
                </div>
                <div className={`p-2 rounded ${
                  token.price_change_24h >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {token.price_change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-2xl font-bold text-white">${token.current_price?.toFixed(2)}</p>
                <p className={`text-sm font-semibold ${token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.price_change_24h >= 0 ? '+' : ''}{token.price_change_24h?.toFixed(2)}%
                </p>
              </div>

              <div className="space-y-2 text-xs text-white/60 mb-3">
                <div className="flex justify-between">
                  <span>Volume</span>
                  <span className="text-white">${(token.volume_24h / 1e6)?.toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply</span>
                  <span className="text-white">{(token.circulating_supply / 1e6)?.toFixed(0)}M</span>
                </div>
              </div>

              {token.staking_apy && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400">{token.staking_apy}% APY</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}