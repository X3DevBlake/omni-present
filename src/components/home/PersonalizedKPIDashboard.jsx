import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Activity, Users, Cpu, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedKPIDashboard({ kpis = [] }) {
  const defaultKPIs = [
    { label: 'Active Agents', value: 12, change: 8.5, trend: 'up', icon: Cpu, color: 'text-purple-400' },
    { label: 'Collaborations', value: 5, change: -2.1, trend: 'down', icon: Users, color: 'text-pink-400' },
    { label: 'System Health', value: 98, change: 0, trend: 'stable', icon: Activity, color: 'text-green-400' },
    { label: 'Security Score', value: 87, change: 5.3, trend: 'up', icon: Shield, color: 'text-cyan-400' }
  ];

  const displayKPIs = kpis.length > 0 ? kpis : defaultKPIs;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-green-400" />
        Your Dashboard
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayKPIs.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-white">
                    {kpi.value}
                  </div>
                  {kpi.change !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(kpi.trend)}
                      <span className={kpi.trend === 'up' ? 'text-green-400' : kpi.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                        {Math.abs(kpi.change)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}