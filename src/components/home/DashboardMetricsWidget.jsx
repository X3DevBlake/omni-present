import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardMetricsWidget({ userEmail }) {
  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 450 },
    { name: 'Mar', value: 520 },
    { name: 'Apr', value: 640 },
    { name: 'May', value: 580 },
    { name: 'Jun', value: 720 }
  ];

  const metrics = [
    { label: 'Portfolio Value', value: '$28,450', change: '+12.5%', icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Active Agents', value: '7', change: '+2', icon: Users, color: 'text-purple-400' },
    { label: 'AI Insights Today', value: '24', change: '+6', icon: Zap, color: 'text-yellow-400' },
    { label: 'Goals on Track', value: '5/6', change: '+1', icon: Target, color: 'text-green-400' }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span></h2>
          <p className="text-white/60">Key metrics at a glance</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <Icon className={`w-6 h-6 mb-2 ${metric.color}`} />
                <div className="text-white font-bold text-lg">{metric.value}</div>
                <div className="text-white/60 text-xs mb-2">{metric.label}</div>
                <div className="text-green-400 text-xs font-semibold">{metric.change}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        >
          <h3 className="text-white font-bold mb-4">Portfolio Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}