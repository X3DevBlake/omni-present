import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Globe, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function CrossChainBridgeManager({ userEmail }) {
  const { data: transfers = [] } = useQuery({
    queryKey: ['crossChainTransfers', userEmail],
    queryFn: () => base44.entities.AutomatedTransaction.filter(
      { user_email: userEmail },
      '-created_date',
      50
    ),
    enabled: !!userEmail
  });

  const totalTransferred = transfers.reduce((sum, t) => sum + (t.amount || 0), 0);
  const successfulTransfers = transfers.filter(t => t.status === 'completed').length;
  const successRate = transfers.length > 0 
    ? ((successfulTransfers / transfers.length) * 100).toFixed(1)
    : 0;

  const chains = {
    ethereum: { color: '#627eea', name: 'Ethereum' },
    polygon: { color: '#8247e5', name: 'Polygon' },
    arbitrum: { color: '#28a0f0', name: 'Arbitrum' },
    optimism: { color: '#ff0420', name: 'Optimism' },
    bsc: { color: '#f3ba2f', name: 'BSC' }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Total Transferred</p>
          <p className="text-2xl font-bold text-white">${totalTransferred.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Successful Transfers</p>
          <p className="text-2xl font-bold text-white">{successfulTransfers}/{transfers.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-white">{successRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4"
        >
          <p className="text-cyan-400 text-sm font-semibold mb-1">Total Transfers</p>
          <p className="text-2xl font-bold text-white">{transfers.length}</p>
        </motion.div>
      </div>

      {/* Transfers List */}
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-400" />
          Recent Cross-Chain Transfers
        </h3>

        {transfers.length === 0 ? (
          <p className="text-white/60 text-center py-8">No cross-chain transfers yet</p>
        ) : (
          <div className="space-y-3">
            {transfers.slice(0, 10).map((transfer, idx) => {
              const sourceChain = transfer.from_chain || 'Unknown';
              const destChain = transfer.to_chain || 'Unknown';
              
              return (
                <motion.div
                  key={transfer.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-right">
                        <p className="text-white/70 text-xs uppercase font-semibold">{sourceChain}</p>
                      </div>
                      <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white/70 text-xs uppercase font-semibold">{destChain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">${(transfer.amount || 0).toFixed(2)}</p>
                      <span className={`text-xs font-semibold ${
                        transfer.status === 'completed' 
                          ? 'text-green-400' 
                          : transfer.status === 'pending'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                  </div>

                  {transfer.status === 'pending' && (
                    <div className="mb-2">
                      <Progress value={60} className="h-1.5" />
                      <p className="text-white/50 text-xs mt-1">Estimated time: 2-5 minutes</p>
                    </div>
                  )}

                  {transfer.fee_paid && (
                    <p className="text-white/60 text-xs">Bridge Fee: ${(transfer.fee_paid || 0).toFixed(4)}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Chain Networks */}
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Supported Networks
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          {Object.entries(chains).map(([key, chain]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="p-4 bg-black/20 rounded-lg border border-white/5 text-center"
            >
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-2"
                style={{ backgroundColor: chain.color, opacity: 0.3 }}
              />
              <p className="text-white font-semibold text-sm">{chain.name}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Bridge Safety Info */}
      <Card className="bg-yellow-500/10 border border-yellow-500/30 p-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Bridge Safety Information
        </h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>• <span className="text-yellow-400">Double-check addresses</span> before confirming transfers</li>
          <li>• <span className="text-yellow-400">Confirm network routes</span> to avoid sending to wrong chains</li>
          <li>• <span className="text-yellow-400">Verify bridge liquidity</span> for large transfers</li>
          <li>• <span className="text-yellow-400">Monitor gas prices</span> on destination chain</li>
        </ul>
      </Card>
    </div>
  );
}