import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import moment from 'moment';

export default function TransactionList({ transactions = [], isLoading = false }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'withdraw': return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'swap': case 'bridge': return <ArrowRightLeft className="w-5 h-5 text-purple-400" />;
      default: return <ArrowRightLeft className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed': case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-white/60">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-white/60">No transactions yet</div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-white/60 text-sm font-medium p-4">Type</th>
              <th className="text-left text-white/60 text-sm font-medium p-4">Amount</th>
              <th className="text-left text-white/60 text-sm font-medium p-4">Status</th>
              <th className="text-left text-white/60 text-sm font-medium p-4">Date</th>
              <th className="text-left text-white/60 text-sm font-medium p-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <motion.tr
                key={tx.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(tx.type)}
                    <span className="text-white capitalize">{tx.type}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`font-bold ${
                    ['deposit', 'cashback', 'bonus'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {['deposit', 'cashback', 'bonus'].includes(tx.type) ? '+' : '-'}
                    {tx.amount} {tx.currency?.toUpperCase()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span className="text-white/80 capitalize text-sm">{tx.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-white/60 text-sm">
                    {moment(tx.created_date).format('MMM D, YYYY h:mm A')}
                  </div>
                </td>
                <td className="p-4">
                  {tx.transaction_hash ? (
                    <code className="text-cyan-400 text-xs">
                      {tx.transaction_hash.substring(0, 10)}...
                    </code>
                  ) : tx.metadata?.agent_name ? (
                    <span className="text-purple-400 text-xs">{tx.metadata.agent_name}</span>
                  ) : (
                    <span className="text-white/40 text-xs">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}