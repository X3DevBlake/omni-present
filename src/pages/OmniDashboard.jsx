import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AuroraBackground from '../components/omni/AuroraBackground';
import TransactionList from '../components/omni/TransactionList';
import OmniLeaderboard from '../components/omni/OmniLeaderboard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function OmniDashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const txs = await base44.entities.OmniTransaction.filter(
        { user_id: userData.id },
        '-created_date',
        50
      );
      setTransactions(txs);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const balanceHistory = [
    { date: 'Jan', balance: 100 },
    { date: 'Feb', balance: 150 },
    { date: 'Mar', balance: 200 },
    { date: 'Apr', balance: 180 },
    { date: 'May', balance: 250 },
    { date: 'Jun', balance: 300 },
  ];

  const transactionVolume = [
    { month: 'Jan', deposits: 50, withdrawals: 20 },
    { month: 'Feb', deposits: 80, withdrawals: 30 },
    { month: 'Mar', deposits: 60, withdrawals: 10 },
    { month: 'Apr', deposits: 90, withdrawals: 70 },
    { month: 'May', deposits: 100, withdrawals: 30 },
    { month: 'Jun', deposits: 75, withdrawals: 25 },
  ];

  const stats = [
    {
      label: 'Current Balance',
      value: (user?.omni_balance || 0).toFixed(2),
      unit: 'OMNI',
      change: '+12.5%',
      positive: true,
      icon: Wallet,
      color: 'text-cyan-400'
    },
    {
      label: 'Total Deposits',
      value: '450.00',
      unit: 'OMNI',
      change: '+8.2%',
      positive: true,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Total Spent',
      value: '156.50',
      unit: 'OMNI',
      change: '+5.1%',
      positive: false,
      icon: TrendingDown,
      color: 'text-red-400'
    },
    {
      label: 'Transactions',
      value: transactions.length,
      unit: '',
      change: '+15',
      positive: true,
      icon: Activity,
      color: 'text-purple-400'
    },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-white/60 text-lg">Complete overview of your Omni activity</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-white/60 text-sm mb-1">{stat.label}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
                {stat.unit && <span className="text-lg ml-1">{stat.unit}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Balance History */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold text-xl mb-4">Balance History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#00f5ff" fill="url(#balanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Transaction Volume */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold text-xl mb-4">Transaction Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transactionVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="deposits" fill="#10b981" />
                <Bar dataKey="withdrawals" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Transactions & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <h2 className="text-white font-bold text-2xl mb-4">All Transactions</h2>
            <TransactionList transactions={transactions} isLoading={loading} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <OmniLeaderboard />
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}