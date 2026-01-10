import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpDown } from 'lucide-react';

export default function MultiCurrencyWallet() {
  const currencies = [
    { code: 'USD', name: 'US Dollar', balance: 12500, icon: '🇺🇸', change: 2.3 },
    { code: 'EUR', name: 'Euro', balance: 8300, icon: '🇪🇺', change: -1.2 },
    { code: 'BTC', name: 'Bitcoin', balance: 0.45, icon: '₿', change: 5.8 },
    { code: 'ETH', name: 'Ethereum', balance: 2.3, icon: 'Ξ', change: 3.4 }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-cyan-400" />
        Multi-Currency Wallet
      </h3>

      <div className="space-y-3">
        {currencies.map((curr) => (
          <motion.div
            key={curr.code}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{curr.icon}</div>
              <div>
                <div className="text-white font-bold">{curr.code}</div>
                <div className="text-white/60 text-sm">{curr.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{curr.balance}</div>
              <div className={`text-sm ${curr.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {curr.change > 0 ? '+' : ''}{curr.change}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}