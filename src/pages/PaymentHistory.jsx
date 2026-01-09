import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Download } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function PaymentHistory() {
  const payments = [
    { id: 1, description: 'Blueprint Template Sale', amount: 19.99, date: '2026-01-08', type: 'earning' },
    { id: 2, description: 'Device Purchase', amount: -599.99, date: '2026-01-05', type: 'expense' },
    { id: 3, description: 'Agent Asset Sale', amount: 49.99, date: '2026-01-02', type: 'earning' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-white/60">View transactions and earnings</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">$1,249.87</div>
            <div className="text-white/60 text-sm">Total Earnings</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <CreditCard className="w-6 h-6 text-red-400 mb-2" />
            <div className="text-3xl font-bold text-white mb-1">$2,149.95</div>
            <div className="text-white/60 text-sm">Total Spent</div>
          </div>
        </div>

        <div className="space-y-3">
          {payments.map((payment, i) => (
            <motion.div key={payment.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div>
                <h3 className="text-white font-medium mb-1">{payment.description}</h3>
                <p className="text-white/60 text-sm">{payment.date}</p>
              </div>
              <div className={`text-xl font-bold ${payment.type === 'earning' ? 'text-green-400' : 'text-red-400'}`}>
                {payment.type === 'earning' ? '+' : ''}{payment.amount < 0 ? payment.amount : '+' + payment.amount}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}