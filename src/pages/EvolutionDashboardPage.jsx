import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, TrendingUp, Zap, Award } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EvolutionDashboardPage() {
  const data = Array.from({ length: 10 }, (_, i) => ({
    generation: i + 1,
    fitness: 50 + Math.random() * 50,
    diversity: 30 + Math.random() * 40
  }));

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Evolution Dashboard</h1>
          <p className="text-white/60">Track genetic algorithms and agent evolution progress</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Generation', value: '127', icon: GitBranch, color: 'purple' },
            { label: 'Best Fitness', value: '94.2', icon: TrendingUp, color: 'green' },
            { label: 'Mutations', value: '1.2K', icon: Zap, color: 'yellow' },
            { label: 'Elite Agents', value: '18', icon: Award, color: 'cyan' }
          ].map((stat, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Fitness Evolution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="generation" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Area type="monotone" dataKey="fitness" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              <Area type="monotone" dataKey="diversity" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}