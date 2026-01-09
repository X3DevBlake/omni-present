import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import moment from 'moment';

export default function TransactionList({ transactions, isLoading }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Loader className="w-4 h-4 text-yellow-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const getTypeIcon = (type) => {
    const isIncoming = ['deposit', 'cashback', 'bonus'].includes(type);
    return isIncoming ? (
      <ArrowDownLeft className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-400" />
    );
  };

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getAmountColor = (type) => {
    const isIncoming = ['deposit', 'cashback', 'bonus'].includes(type);
    return isIncoming ? 'text-green-400' : 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-white/60">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => (
        <motion.div
          key={tx.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                {getTypeIcon(tx.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{getTypeLabel(tx.type)}</span>
                  {getStatusIcon(tx.status)}
                </div>
                <div className="text-white/40 text-xs">
                  {tx.created_date ? moment(tx.created_date).format('MMM D, YYYY HH:mm') : 'Just now'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-bold text-lg ${getAmountColor(tx.type)}`}>
                {['deposit', 'cashback', 'bonus'].includes(tx.type) ? '+' : '-'}
                {tx.amount} {tx.currency?.toUpperCase()}
              </div>
              {tx.transaction_hash && (
                <div className="text-white/40 text-xs font-mono">
                  {tx.transaction_hash.slice(0, 6)}...{tx.transaction_hash.slice(-4)}
                </div>
              )}
            </div>
          </div>

          {tx.metadata?.note && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <p className="text-white/60 text-sm">{tx.metadata.note}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}