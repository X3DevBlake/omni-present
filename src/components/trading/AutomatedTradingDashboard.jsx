import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AutomatedTradingDashboard({ userEmail }) {
  const { data: trades = [], refetch } = useQuery({
    queryKey: ['automatedTrades', userEmail],
    queryFn: () => userEmail ? base44.entities.TradeExecution.filter({ user_email: userEmail }).catch(() => []) : [],
    refetchInterval: 5000
  });

  const executed = trades.filter(t => t.status === 'executed');
  const successful = trades.filter(t => t.status === 'executed' && (t.profit_loss || 0) > 0);
  const totalValue = trades.reduce((sum, t) => sum + (t.total_value || 0), 0);
  const totalPnL = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Automated Trading</h3>
        </div>
        <Button size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Total Trades</p>
          <p className="text-2xl font-bold text-white mt-1">{trades.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Executed</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{executed.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Win Rate</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {executed.length > 0 ? ((successful.length / executed.length) * 100).toFixed(1) : 0}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className={`rounded-lg p-3 border ${
            totalPnL >= 0
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <p className="text-white/60 text-xs">Total P&L</p>
          <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPnL.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-3">Recent Trades</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {trades.slice(0, 10).map((trade, idx) => (
            <motion.div
              key={trade.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-bold">{trade.asset_symbol}</p>
                  <Badge className={trade.trade_type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {trade.trade_type.toUpperCase()}
                  </Badge>
                  <Badge className={`bg-white/10 text-white/70`}>
                    {trade.status}
                  </Badge>
                </div>
                <p className="text-white/60 text-xs">
                  {trade.quantity} @ ${trade.price || 'N/A'} • Confidence: {(trade.prediction_confidence || 0).toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                {trade.status === 'executed' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}