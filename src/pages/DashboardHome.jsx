import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/components/hooks/usePageTransition';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '@/components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Brain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DashboardHome() {
  usePageTransition();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const quickStats = [
    { label: 'Active Agents', value: '12', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { label: 'Tasks Today', value: '47', icon: Activity, color: 'from-cyan-500 to-blue-500' },
    { label: 'Performance', value: '94%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Efficiency', value: '87%', icon: Zap, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Welcome back{user?.full_name ? ', ' + user.full_name.split(' ')[0] : ''}
          </h1>
          <p className="text-white/60">Your AI ecosystem at a glance</p>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${stat.color} p-6 border-0`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-white/40" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-black/40 border-white/10 p-6 hover:border-white/30 transition-all cursor-pointer">
            <h3 className="text-white font-bold text-lg mb-4">Recent Activity</h3>
            <p className="text-white/60 text-sm">No recent activities</p>
          </Card>
          <Card className="bg-black/40 border-white/10 p-6 hover:border-white/30 transition-all">
            <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Link to={createPageUrl('AIAnalyticsHub')}>
                <Button size="sm" variant="outline">Analytics</Button>
              </Link>
              <Link to={createPageUrl('TeamOrchestration')}>
                <Button size="sm" variant="outline">Teams</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}