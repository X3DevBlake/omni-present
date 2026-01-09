import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Zap, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';

export default function OmniStaking() {
  const [user, setUser] = useState(null);
  const [stakes, setStakes] = useState([]);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(30);
  const [autoCompound, setAutoCompound] = useState(false);

  const stakingTiers = [
    { days: 30, apy: 5, name: '1 Month', color: 'from-blue-500 to-cyan-500' },
    { days: 90, apy: 8, name: '3 Months', color: 'from-purple-500 to-pink-500' },
    { days: 180, apy: 12, name: '6 Months', color: 'from-orange-500 to-red-500' },
    { days: 365, apy: 15, name: '1 Year', color: 'from-green-500 to-emerald-500' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await base44.auth.me();
    setUser(userData);

    const userStakes = await base44.entities.Stake.filter(
      { created_by: userData.email },
      '-created_date'
    );
    setStakes(userStakes);
  };

  const selectedTier = stakingTiers.find(t => t.days === duration);
  const estimatedRewards = amount ? (parseFloat(amount) * (selectedTier.apy / 100) * (duration / 365)).toFixed(2) : 0;

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    if (parseFloat(amount) > (user?.omni_balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - parseFloat(amount)
    });

    await base44.entities.Stake.create({
      amount: parseFloat(amount),
      apy: selectedTier.apy,
      duration_days: duration,
      start_date: new Date().toISOString(),
      end_date: moment().add(duration, 'days').toISOString(),
      auto_compound: autoCompound,
      status: 'active'
    });

    toast.success(`Staked ${amount} OMNI at ${selectedTier.apy}% APY!`);
    setAmount('');
    loadData();
  };

  const totalStaked = stakes.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);
  const totalEarned = stakes.reduce((sum, s) => sum + (s.earned || 0), 0);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Staking</span>
          </h1>
          <p className="text-white/60 text-lg">Earn passive rewards by locking your Omni tokens</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Total Staked</span>
            </div>
            <div className="text-purple-400 text-3xl font-bold">{totalStaked.toFixed(2)} OMNI</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Total Earned</span>
            </div>
            <div className="text-green-400 text-3xl font-bold">{totalEarned.toFixed(2)} OMNI</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60 text-sm">Available</span>
            </div>
            <div className="text-yellow-400 text-3xl font-bold">{(user?.omni_balance || 0).toFixed(2)} OMNI</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Form */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-6">Stake Omni</h3>

            <div className="mb-6">
              <label className="text-white/60 text-sm mb-2 block">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="text-white/60 text-sm mb-3 block">Staking Duration</label>
              <div className="grid grid-cols-2 gap-3">
                {stakingTiers.map(tier => (
                  <button
                    key={tier.days}
                    onClick={() => setDuration(tier.days)}
                    className={`p-4 rounded-xl border transition-all ${
                      duration === tier.days
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-white font-bold mb-1">{tier.name}</div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                      {tier.apy}% APY
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between mb-6 cursor-pointer">
              <span className="text-white/60">Auto-compound rewards</span>
              <input
                type="checkbox"
                checked={autoCompound}
                onChange={(e) => setAutoCompound(e.target.checked)}
                className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-cyan-500"
              />
            </label>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
              <div className="text-white/60 text-sm mb-1">Estimated Rewards</div>
              <div className="text-cyan-400 text-3xl font-bold">{estimatedRewards} OMNI</div>
              <div className="text-white/40 text-xs mt-1">After {duration} days</div>
            </div>

            <button
              onClick={handleStake}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              Stake Now
            </button>
          </div>

          {/* Active Stakes */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">Your Stakes</h3>
            <div className="space-y-4">
              {stakes.filter(s => s.status === 'active').map((stake, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-white/60 text-sm">Staked Amount</div>
                      <div className="text-white text-2xl font-bold">{stake.amount} OMNI</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm">APY</div>
                      <div className="text-green-400 text-2xl font-bold">{stake.apy}%</div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Earned</span>
                      <span className="text-green-400 font-bold">{(stake.earned || 0).toFixed(4)} OMNI</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Ends</span>
                      <span className="text-white">{moment(stake.end_date).format('MMM D, YYYY')}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{
                        width: `${(moment().diff(moment(stake.start_date), 'days') / stake.duration_days) * 100}%`
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}