import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function LiquidityPoolManager({ userEmail }) {
  const { data: pools = [] } = useQuery({
    queryKey: ['liquidityPools', userEmail],
    queryFn: () => base44.entities.LiquidityPool.filter(
      { user_email: userEmail },
      '-created_date',
      50
    ),
    enabled: !!userEmail
  });

  const totalLiquidity = pools.reduce((sum, pool) => sum + (pool.liquidity_provided || 0), 0);
  const totalFees = pools.reduce((sum, pool) => sum + (pool.fees_earned || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Total Liquidity Provided</p>
          <p className="text-2xl font-bold text-white">${totalLiquidity.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Fees Earned</p>
          <p className="text-2xl font-bold text-white">${totalFees.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">Active Pools</p>
          <p className="text-2xl font-bold text-white">{pools.length}</p>
        </motion.div>
      </div>

      {/* Pools List */}
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          Active Liquidity Pools
        </h3>

        {pools.length === 0 ? (
          <p className="text-white/60 text-center py-8">No liquidity pools yet</p>
        ) : (
          <div className="space-y-4">
            {pools.map((pool, idx) => {
              const impermanentLoss = (pool.impermanent_loss_percent || 0).toFixed(2);
              const apy = ((pool.fees_earned / pool.liquidity_provided) * 100 * 12).toFixed(2);

              return (
                <motion.div
                  key={pool.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">
                        {pool.token_a_symbol}/{pool.token_b_symbol} Pool
                      </p>
                      <p className="text-white/60 text-xs">{pool.chain}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">${(pool.liquidity_provided || 0).toFixed(2)}</p>
                      <p className="text-green-400 text-xs font-semibold">APY: {apy}%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-white/70 text-xs mb-1">Fee Earned</p>
                    <p className="text-green-400 text-sm font-semibold">${(pool.fees_earned || 0).toFixed(2)}</p>
                  </div>

                  {parseFloat(impermanentLoss) !== 0 && (
                    <div className="p-2 bg-yellow-500/10 rounded mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <p className="text-yellow-400 text-xs">
                        Impermanent Loss: {impermanentLoss}%
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-white/60">
                    <span>{pool.share_percent}% of pool</span>
                    <span>Value Range: ${(pool.price_lower || 0).toFixed(2)} - ${(pool.price_upper || 0).toFixed(2)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Risk Warning */}
      <Card className="bg-orange-500/10 border border-orange-500/30 p-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Liquidity Pool Risks
        </h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>• <span className="text-orange-400">Impermanent Loss:</span> Price divergence can reduce LP returns</li>
          <li>• <span className="text-orange-400">Smart Contract Risk:</span> Monitor pool contract audits</li>
          <li>• <span className="text-orange-400">Volatility Risk:</span> High price swings increase IL exposure</li>
          <li>• <span className="text-orange-400">Slippage:</span> Large position changes may incur losses</li>
        </ul>
      </Card>
    </div>
  );
}