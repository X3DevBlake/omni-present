import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wallet, TrendingUp, CreditCard, Users, ArrowUpRight, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniToken3D from '../components/omni/OmniToken3D';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function OmniHome() {
  const [user, setUser] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const transactions = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id },
        '-created_date',
        5
      );
      setRecentTransactions(transactions);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Buy Omni', icon: TrendingUp, page: 'BuyOmni', color: 'from-green-500 to-emerald-500' },
    { label: 'Sell/Swap', icon: ArrowUpRight, page: 'SellOmni', color: 'from-orange-500 to-red-500' },
    { label: 'Deposit', icon: Wallet, page: 'DepositOmni', color: 'from-blue-500 to-indigo-500' },
    { label: 'Withdraw', icon: ArrowUpRight, page: 'WithdrawOmni', color: 'from-purple-500 to-pink-500' },
    { label: 'My Card', icon: CreditCard, page: 'OmniCardManagement', color: 'from-cyan-500 to-blue-500' },
    { label: 'Agents', icon: Users, page: 'AgentBudget', color: 'from-pink-500 to-rose-500' },
  ];

  const stats = [
    { label: 'Omni Balance', value: user?.omni_balance || 0, unit: 'OMNI', color: 'text-cyan-400' },
    { label: 'ETH Balance', value: user?.eth_balance || 0, unit: 'ETH', color: 'text-purple-400' },
    { label: 'USDT Balance', value: user?.usdt_balance || 0, unit: 'USDT', color: 'text-green-400' },
    { label: 'Card Tier', value: user?.card_tier || 'Pioneer', unit: '', color: 'text-yellow-400' },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni Hub</span>
          </h1>
          <p className="text-white/60 text-lg">Your gateway to the Omni token ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3D Token Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OmniToken3D height="400px" />
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
              >
                <div className="text-white/60 text-sm mb-2">{stat.label}</div>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
                  {stat.unit && <span className="text-lg ml-1">{stat.unit}</span>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-white font-bold text-2xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={createPageUrl(action.page)}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all text-center"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium text-sm">{action.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-2xl">Recent Activity</h2>
            <Link
              to={createPageUrl('OmniDashboard')}
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium capitalize">{tx.type}</div>
                    <div className="text-white/60 text-sm">{tx.currency?.toUpperCase()}</div>
                  </div>
                  <div className={`text-lg font-bold ${
                    ['deposit', 'cashback', 'bonus'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {['deposit', 'cashback', 'bonus'].includes(tx.type) ? '+' : '-'}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              No recent transactions
            </div>
          )}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link to={createPageUrl('BridgeOmni')} className="group">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <Zap className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-white font-bold mb-2">Bridge Tokens</h3>
              <p className="text-white/60 text-sm">Move Omni across different networks seamlessly</p>
            </div>
          </Link>

          <Link to={createPageUrl('OmniCardStore')} className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <CreditCard className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-white font-bold mb-2">Omni Card</h3>
              <p className="text-white/60 text-sm">Get up to 12% cashback with premium tiers</p>
            </div>
          </Link>

          <Link to={createPageUrl('AgentECommerceSettings')} className="group">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
              <Users className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-white font-bold mb-2">Agent Shopping</h3>
              <p className="text-white/60 text-sm">Enable AI agents to make purchases autonomously</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}