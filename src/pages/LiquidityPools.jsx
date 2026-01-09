import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, TrendingUp, Lock, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import LiquidityPoolCard from '../components/defi/LiquidityPoolCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';

export default function LiquidityPools() {
  const [pools, setPools] = useState([]);
  const [userDeposits, setUserDeposits] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializePools();
    loadUserData();
  }, []);

  const initializePools = async () => {
    const existingPools = await base44.entities.LiquidityPool.list();
    
    if (existingPools.length === 0) {
      const defaultPools = [
        {
          pool_name: 'OMNI Single Stake',
          token_a: 'OMNI',
          token_b: 'OMNI',
          base_apy: 1000,
          current_apy: 1000,
          total_value_locked: 0,
          reward_rate: 100000,
          pool_type: 'single_stake',
          risk_level: 'low',
          min_deposit: 10,
          lock_period_days: 0
        },
        {
          pool_name: 'OMNI/USDT LP',
          token_a: 'OMNI',
          token_b: 'USDT',
          base_apy: 800,
          current_apy: 800,
          total_value_locked: 0,
          reward_rate: 80000,
          pool_type: 'liquidity',
          risk_level: 'medium',
          min_deposit: 50,
          lock_period_days: 7
        },
        {
          pool_name: 'OMNI/ETH LP',
          token_a: 'OMNI',
          token_b: 'ETH',
          base_apy: 650,
          current_apy: 650,
          total_value_locked: 0,
          reward_rate: 65000,
          pool_type: 'liquidity',
          risk_level: 'medium',
          min_deposit: 100,
          lock_period_days: 14
        },
        {
          pool_name: 'Ultra Yield Farm',
          token_a: 'OMNI',
          token_b: 'LP',
          base_apy: 500,
          current_apy: 500,
          total_value_locked: 0,
          reward_rate: 50000,
          pool_type: 'yield_farm',
          risk_level: 'high',
          min_deposit: 200,
          lock_period_days: 30
        }
      ];

      for (const pool of defaultPools) {
        await base44.entities.LiquidityPool.create(pool);
      }
    }

    loadPools();
  };

  const loadPools = async () => {
    const allPools = await base44.entities.LiquidityPool.filter({ is_active: true });
    setPools(allPools);
  };

  const loadUserData = async () => {
    const userData = await base44.auth.me();
    setUser(userData);

    const deposits = await base44.entities.UserDeposit.filter(
      { created_by: userData.email, status: 'active' }
    );
    setUserDeposits(deposits);
  };

  const calculateDynamicAPY = (pool, additionalDeposit = 0) => {
    const newTVL = pool.total_value_locked + additionalDeposit;
    if (newTVL === 0) return pool.base_apy;
    
    // Dynamic APY formula: APY decreases as TVL increases
    const dynamicAPY = (pool.reward_rate / Math.sqrt(newTVL + 1000)) * 10;
    return Math.max(Math.min(dynamicAPY, pool.base_apy), pool.base_apy * 0.1); // Min 10% of base
  };

  const handleDeposit = async (pool, amount) => {
    if (!user || amount > (user.omni_balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    // Calculate new APY with this deposit
    const newAPY = calculateDynamicAPY(pool, amount);

    // Deduct from user balance
    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - amount
    });

    // Create deposit record
    await base44.entities.UserDeposit.create({
      pool_id: pool.id,
      amount: amount,
      token_type: pool.token_a,
      apy_at_deposit: newAPY,
      deposit_date: new Date().toISOString(),
      unlock_date: moment().add(pool.lock_period_days, 'days').toISOString(),
      status: pool.lock_period_days > 0 ? 'locked' : 'active',
      auto_compound: false,
      last_reward_calculation: new Date().toISOString()
    });

    // Update pool TVL and APY
    await base44.entities.LiquidityPool.update(pool.id, {
      total_value_locked: pool.total_value_locked + amount,
      current_apy: newAPY
    });

    toast.success(`Deposited ${amount} OMNI at ${newAPY.toFixed(2)}% APY!`);
    loadPools();
    loadUserData();
  };

  const totalDeposited = userDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalRewards = userDeposits.reduce((sum, d) => sum + (d.rewards_earned || 0), 0);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Liquidity <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Pools</span>
          </h1>
          <p className="text-white/60 text-lg">Earn up to 1000% APY by providing liquidity</p>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Droplet className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60">Total Deposited</span>
            </div>
            <div className="text-cyan-400 text-3xl font-bold">{totalDeposited.toFixed(2)} OMNI</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/60">Rewards Earned</span>
            </div>
            <div className="text-green-400 text-3xl font-bold">{totalRewards.toFixed(4)} OMNI</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span className="text-white/60">Active Positions</span>
            </div>
            <div className="text-purple-400 text-3xl font-bold">{userDeposits.length}</div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-300 text-sm">
            <strong>Dynamic APY:</strong> APY adjusts based on total deposits. Higher deposits = lower APY, but still extremely competitive rates.
          </div>
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <LiquidityPoolCard
              key={pool.id}
              pool={pool}
              onDeposit={handleDeposit}
            />
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}