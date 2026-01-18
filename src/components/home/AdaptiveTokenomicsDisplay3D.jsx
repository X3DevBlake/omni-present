import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';

export default function AdaptiveTokenomicsDisplay3D() {
  const { data: stakes = [] } = useQuery({
    queryKey: ['homeTokenStakes'],
    queryFn: () => base44.entities.OmniStake.filter({}).limit(100),
    refetchInterval: 5000
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['homeTokens'],
    queryFn: () => base44.entities.CryptoToken.filter({}).limit(50),
    refetchInterval: 6000
  });

  const totalStaked = stakes.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
  const uniqueStakers = new Set(stakes.map(s => s.user_email)).size;
  const avgStakeSize = stakes.length > 0 ? totalStaked / stakes.length : 0;

  const distributionData = [
    { name: 'Staked', value: Math.round(totalStaked), color: '#3b82f6' },
    { name: 'Circulating', value: 250000000 - Math.round(totalStaked), color: '#10b981' },
    { name: 'Reserve', value: 50000000, color: '#f59e0b' }
  ];

  const stakingTiers = [
    { tier: 'Bronze', min: 0, max: 1000, stakers: stakes.filter(s => parseFloat(s.amount || 0) < 1000).length },
    { tier: 'Silver', min: 1000, max: 10000, stakers: stakes.filter(s => {
      const amt = parseFloat(s.amount || 0);
      return amt >= 1000 && amt < 10000;
    }).length },
    { tier: 'Gold', min: 10000, max: 100000, stakers: stakes.filter(s => {
      const amt = parseFloat(s.amount || 0);
      return amt >= 10000 && amt < 100000;
    }).length },
    { tier: 'Platinum', min: 100000, max: Infinity, stakers: stakes.filter(s => parseFloat(s.amount || 0) >= 100000).length }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Staked', value: `$${totalStaked.toLocaleString()}`, icon: '📊', change: '+12%' },
          { label: 'Active Stakers', value: uniqueStakers.toLocaleString(), icon: '👥', change: '+8%' },
          { label: 'Avg Stake Size', value: `$${avgStakeSize.toLocaleString()}`, icon: '💰', change: '+5%' }
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <Badge className="bg-green-500/20 text-green-400 text-xs">{metric.change}</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
            <p className="text-xl font-bold text-white">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Token Distribution & Staking Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Pie */}
        <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Token Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-white">{((item.value / 300000000) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staking Tiers */}
        <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Staker Tiers</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stakingTiers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="tier" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="stakers" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Governance & Rewards */}
      <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Governance & Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Annual Yield', value: '12.5%', icon: <TrendingUp className="w-4 h-4" /> },
              { label: 'Governance Power', value: `${uniqueStakers}M OMNI`, icon: <Activity className="w-4 h-4" /> },
              { label: 'Next Epoch', value: '14 Days', icon: '⏱️' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  {typeof item.icon === 'string' ? <span>{item.icon}</span> : item.icon}
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
                <p className="text-lg font-bold text-white">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}