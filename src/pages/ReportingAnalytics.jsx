import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportingAnalytics() {
  const data = [
    { month: 'Jan', users: 120, revenue: 45000 },
    { month: 'Feb', users: 145, revenue: 52000 },
    { month: 'Mar', users: 168, revenue: 61000 },
    { month: 'Apr', users: 190, revenue: 68000 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Reporting & Analytics</h1>
          <p className="text-white/60">Business intelligence dashboards</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '623', icon: Users, color: 'blue' },
            { label: 'Monthly Revenue', value: '$68K', icon: TrendingUp, color: 'green' },
            { label: 'Active Devices', value: '1,240', icon: Activity, color: 'purple' },
            { label: 'Growth Rate', value: '+23%', icon: BarChart3, color: 'cyan' }
          ].map((metric, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-white/60 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Growth Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}