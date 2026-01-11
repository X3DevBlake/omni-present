import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function CryptoPortfolioTracker({ userEmail }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['cryptoAssets', userEmail],
    queryFn: () => base44.entities.CryptoAsset.filter(
      { user_email: userEmail },
      '-created_date',
      50
    ),
    enabled: !!userEmail
  });

  const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
  const totalInvested = assets.reduce((sum, asset) => sum + (asset.invested_amount || 0), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Amount Invested</p>
          <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${totalGain >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-4`}
        >
          <p className={`text-sm font-semibold mb-1 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>Total Gain/Loss</p>
          <p className={`text-2xl font-bold flex items-center gap-1 ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            ${Math.abs(totalGain).toFixed(2)}
            {totalGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4"
        >
          <p className="text-cyan-400 text-sm font-semibold mb-1">ROI</p>
          <p className={`text-2xl font-bold ${parseFloat(gainPercent) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {gainPercent}%
          </p>
        </motion.div>
      </div>

      {/* Assets List */}
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Crypto Assets
        </h3>
        
        {assets.length === 0 ? (
          <p className="text-white/60 text-center py-8">No crypto assets yet</p>
        ) : (
          <div className="space-y-4">
            {assets.map((asset, idx) => {
              const assetGain = (asset.current_value || 0) - (asset.invested_amount || 0);
              const assetGainPercent = asset.invested_amount > 0 
                ? ((assetGain / asset.invested_amount) * 100).toFixed(2)
                : 0;
              const portfolioPercent = totalValue > 0 
                ? ((asset.current_value / totalValue) * 100).toFixed(1)
                : 0;

              return (
                <motion.div
                  key={asset.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-bold text-sm uppercase">{asset.symbol}</p>
                      <p className="text-white/60 text-xs">{asset.blockchain}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">${(asset.current_value || 0).toFixed(2)}</p>
                      <p className={`text-xs font-semibold ${assetGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {assetGain >= 0 ? '+' : ''}{assetGainPercent}%
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{asset.quantity} tokens</span>
                      <span>{portfolioPercent}% of portfolio</span>
                    </div>
                    <Progress value={parseFloat(portfolioPercent)} className="h-1.5" />
                  </div>

                  <div className="flex justify-between text-xs text-white/60">
                    <span>Entry: ${(asset.entry_price || 0).toFixed(6)}</span>
                    <span>Current: ${(asset.current_price || 0).toFixed(6)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Risk Assessment */}
      <Card className="bg-yellow-500/10 border border-yellow-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Risk Assessment
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-white/80">
          <div>
            <p className="text-yellow-400 font-semibold mb-1">Portfolio Concentration</p>
            <p>Check if holdings are diversified across multiple assets</p>
          </div>
          <div>
            <p className="text-yellow-400 font-semibold mb-1">Chain Risk</p>
            <p>Monitor exposure to different blockchains</p>
          </div>
          <div>
            <p className="text-yellow-400 font-semibold mb-1">Volatility</p>
            <p>Review price swings and adjust positions as needed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}