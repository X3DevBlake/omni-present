import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CreditCard, Wallet, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OmniBankDashboard({ userEmail }) {
  const [showBalance, setShowBalance] = React.useState(true);
  
  const { data: accounts = [] } = useQuery({
    queryKey: ['bankAccounts', userEmail],
    queryFn: () => base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []),
    enabled: !!userEmail,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['omniCards', userEmail],
    queryFn: () => base44.entities.OmniCard.filter({ user_email: userEmail }).catch(() => []),
    enabled: !!userEmail,
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold opacity-80">Total Balance</h3>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/20 rounded">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <h2 className="text-4xl font-bold mb-2">
            {showBalance ? `$${totalBalance?.toFixed(2)}` : '••••••'}
          </h2>

          <div className="flex gap-8 text-xs opacity-80">
            <div>
              <p>Accounts</p>
              <p className="text-lg font-bold">{accounts.length}</p>
            </div>
            <div>
              <p>Cards</p>
              <p className="text-lg font-bold">{cards.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accounts Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-cyan-400" />
          Your Accounts
        </h3>

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-white/40">No accounts yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account, idx) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white/70 text-sm capitalize">{account.account_type}</p>
                    <p className="text-white font-bold text-lg">${account.balance?.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    account.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {account.status}
                  </span>
                </div>
                <p className="text-white/50 text-xs">•••• {account.account_number?.slice(-4)}</p>
                {account.interest_rate && (
                  <p className="text-cyan-400 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {account.interest_rate}% APY
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          Your Cards
        </h3>

        {cards.length === 0 ? (
          <div className="text-center py-8 text-white/40">No cards yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-lg p-4 border text-white relative overflow-hidden ${
                  card.tier === 'platinum' ? 'bg-gradient-to-r from-amber-700 to-yellow-600 border-yellow-500/30'
                  : card.tier === 'gold' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border-yellow-500/30'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 border-white/10'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold opacity-80 capitalize">{card.card_type}</span>
                    <span className="text-xs font-bold capitalize">{card.tier}</span>
                  </div>
                  <p className="font-mono text-lg mb-3 tracking-widest">•••• •••• •••• {card.card_number?.slice(-4)}</p>
                  <div className="flex justify-between text-xs opacity-75">
                    <span>{card.expiry_date}</span>
                    <span className={card.status === 'active' ? 'text-green-300' : 'text-red-300'}>{card.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}