import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Droplet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LiquidityPoolCard({ pool, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'extreme': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (parseFloat(amount) < pool.min_deposit) {
      toast.error(`Minimum deposit is ${pool.min_deposit}`);
      return;
    }
    onDeposit(pool, parseFloat(amount));
    setAmount('');
    setShowDeposit(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-xl mb-1">{pool.pool_name}</h3>
          <div className="text-white/60 text-sm">{pool.pool_type.replace('_', ' ').toUpperCase()}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(pool.risk_level)}`}>
          {pool.risk_level.toUpperCase()}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
        <div className="text-white/60 text-sm mb-1">Current APY</div>
        <div className="text-green-400 text-4xl font-bold">{pool.current_apy.toFixed(2)}%</div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Total Value Locked</span>
          <span className="text-white font-bold">{pool.total_value_locked.toLocaleString()} OMNI</span>
        </div>
        {pool.lock_period_days > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Lock Period
            </span>
            <span className="text-white">{pool.lock_period_days} days</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Min. Deposit</span>
          <span className="text-white">{pool.min_deposit} OMNI</span>
        </div>
      </div>

      {!showDeposit ? (
        <button
          onClick={() => setShowDeposit(true)}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
        >
          <Droplet className="w-5 h-5 inline mr-2" />
          Add Liquidity
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeposit(false)}
              className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              Deposit
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}