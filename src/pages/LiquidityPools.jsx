import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, TrendingUp, Lock, AlertTriangle, Info, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedPoolCalculator from '../components/omni/EnhancedPoolCalculator';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';

export default function LiquidityPools() {
  const [pools, setPools] = useState([]);
  const [userDeposits, setUserDeposits] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await base44.auth.me();
    setUser(userData);

    let poolsData = await base44.entities.LiquidityPool.list();
    
    if (poolsData.length === 0) {
      poolsData = await createInitialPools();
    }

    // Calculate dynamic APY for each pool
    poolsData = poolsData.map(pool => ({
      ...pool,
      current_apy: calculateDynamicAPY(pool)
    }));

    setPools(poolsData);

    const deposits = await base44.entities.UserDeposit.filter(
      { created_by: userData.email, status: 'active' }
    );
    setUserDeposits(deposits);
  };

  const createInitialPools = async () => {
    const initialPools = [
      {
        pool_name: 'OMNI Mega Pool',
        token_pair: 'OMNI',
        base_apy: 850,
        max_apy: 1000,
        total_value_locked: 5000,
        pool_type: 'staking',
        risk_level: 'high',
        minimum_deposit: 50,
        lock_period_days: 90
      },
      {
        pool_name: 'OMNI/USDT LP',
        token_pair: 'OMNI/USDT',
        base_apy: 650,
        max_apy: 1000,
        total_value_locked: 12000,
        pool_type: 'liquidity',
        risk_level: 'medium',
        minimum_deposit: 100,
        lock_period_days: 30
      },
      {
        pool_name: 'OMNI/ETH Yield Farm',
        token_pair: 'OMNI/ETH',
        base_apy: 920,
        max_apy: 1000,
        total_value_locked: 8000,
        pool_type: 'farming',
        risk_level: 'extreme',
        minimum_deposit: 200,
        lock_period_days: 180
      },
      {
        pool_name: 'Stable OMNI Pool',
        token_pair: 'OMNI',
        base_apy: 250,
        max_apy: 500,
        total_value_locked: 50000,
        pool_type: 'staking',
        risk_level: 'low',
        minimum_deposit: 10,
        lock_period_days: 0
      }
    ];

    const created = [];
    for (const pool of initialPools) {
      const p = await base44.entities.LiquidityPool.create(pool);
      created.push(p);
    }
    return created;
  };

  const calculateDynamicAPY = (pool) => {
    // APY decreases as TVL increases
    // Formula: current_apy = base_apy * (1 - (tvl / (tvl + dampening_factor)))
    const dampeningFactor = 10000; // Adjust this to control how fast APY decreases
    const tvlImpact = pool.total_value_locked / (pool.total_value_locked + dampeningFactor);
    const dynamicAPY = pool.base_apy * (1 - tvlImpact * 0.7); // Max 70% reduction
    return Math.max(Math.min(dynamicAPY, pool.max_apy), pool.base_apy * 0.1);
  };

  const handleDeposit = async () => {
    if (!selectedPool || !depositAmount || parseFloat(depositAmount) < selectedPool.minimum_deposit) {
      toast.error(`Minimum deposit: ${selectedPool.minimum_deposit} OMNI`);
      return;
    }

    if (parseFloat(depositAmount) > (user?.omni_balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    // Update user balance
    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - parseFloat(depositAmount)
    });

    // Create deposit
    await base44.entities.UserDeposit.create({
      pool_id: selectedPool.id,
      amount: parseFloat(depositAmount),
      deposit_date: new Date().toISOString(),
      locked_until: moment().add(selectedPool.lock_period_days, 'days').toISOString(),
      apy_at_deposit: selectedPool.current_apy,
      status: 'active'
    });

    // Update pool TVL
    await base44.entities.LiquidityPool.update(selectedPool.id, {
      total_value_locked: selectedPool.total_value_locked + parseFloat(depositAmount)
    });

    toast.success(`Deposited ${depositAmount} OMNI at ${selectedPool.current_apy.toFixed(2)}% APY!`);
    setDepositAmount('');
    setSelectedPool(null);
    loadData();
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getPoolIcon = (type) => {
    switch (type) {
      case 'liquidity': return '💧';
      case 'staking': return '🔒';
      case 'farming': return '🌾';
      default: return '💰';
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">DeFi</span> Liquidity Pools
          </h1>
          <p className="text-white/60 text-lg">Earn up to 1000% APY with dynamic yield optimization</p>
        </motion.div>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm">Total Value Locked</span>
            </div>
            <div className="text-cyan-400 text-3xl font-bold">
              {pools.reduce((sum, p) => sum + p.total_value_locked, 0).toLocaleString()} OMNI
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Average APY</span>
            </div>
            <div className="text-green-400 text-3xl font-bold">
              {(pools.reduce((sum, p) => sum + p.current_apy, 0) / pools.length || 0).toFixed(1)}%
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60 text-sm">Your Deposits</span>
            </div>
            <div className="text-yellow-400 text-3xl font-bold">
              {userDeposits.reduce((sum, d) => sum + d.amount, 0).toFixed(2)} OMNI
            </div>
          </div>
        </div>

        {/* Pool Calculator */}
        {pools.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <EnhancedPoolCalculator pool={pools[0]} />
          </div>
        )}

        {/* Active Pools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {pools.filter(p => p.active).map((pool, i) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getPoolIcon(pool.pool_type)}</div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{pool.pool_name}</h3>
                    <div className="text-white/60 text-sm">{pool.token_pair}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(pool.risk_level)} bg-white/5`}>
                  {pool.risk_level.toUpperCase()}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
                <div className="text-white/60 text-sm mb-1">Current APY</div>
                <div className="text-green-400 text-4xl font-bold">{pool.current_apy.toFixed(2)}%</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">TVL</span>
                  <span className="text-white font-bold">{pool.total_value_locked.toLocaleString()} OMNI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Min. Deposit</span>
                  <span className="text-white">{pool.minimum_deposit} OMNI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Lock Period</span>
                  <span className="text-white">{pool.lock_period_days} days</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPool(pool)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
              >
                Deposit
              </button>
            </motion.div>
          ))}
        </div>

        {/* Deposit Modal */}
        {selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-white font-bold text-2xl mb-4">{selectedPool.pool_name}</h2>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                <div className="text-white/60 text-sm mb-1">You'll earn</div>
                <div className="text-cyan-400 text-3xl font-bold">{selectedPool.current_apy.toFixed(2)}% APY</div>
              </div>

              <div className="mb-6">
                <label className="text-white/60 text-sm mb-2 block">Deposit Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={`Min: ${selectedPool.minimum_deposit}`}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
                <div className="flex items-start gap-2 text-yellow-300 text-xs">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Risk Warning</p>
                    <p>Funds will be locked for {selectedPool.lock_period_days} days. APY varies with TVL.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPool(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:opacity-90"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}