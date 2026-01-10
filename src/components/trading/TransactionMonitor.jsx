import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TransactionMonitor({ userEmail }) {
  const { data: transactions = [] } = useQuery({
    queryKey: ['automatedTransactions', userEmail],
    queryFn: () => userEmail ? base44.entities.AutomatedTransaction.filter({ user_email: userEmail }).catch(() => []) : [],
    refetchInterval: 3000
  });

  const pending = transactions.filter(t => t.status === 'pending');
  const completed = transactions.filter(t => t.status === 'completed');
  const failed = transactions.filter(t => t.status === 'failed');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-bold">Transaction Monitor</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs font-bold">PENDING</p>
          <p className="text-2xl font-bold text-white mt-1">{pending.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-xs font-bold">COMPLETED</p>
          <p className="text-2xl font-bold text-white mt-1">{completed.length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-xs font-bold">FAILED</p>
          <p className="text-2xl font-bold text-white mt-1">{failed.length}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-3">Recent Transactions</h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {transactions.slice(0, 15).map((tx, idx) => (
            <motion.div
              key={tx.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${getStatusColor(tx.status)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">${tx.amount?.toFixed(2)}</p>
                    <Badge className="bg-white/10 text-white/70">
                      {tx.transaction_type}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-xs">
                    {tx.trigger_rule || tx.trigger_condition?.type || 'Manual'}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {tx.recipient} • {tx.payment_gateway}
                  </p>
                </div>
                <div className="text-right">
                  {tx.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {tx.status === 'pending' && (
                    <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}