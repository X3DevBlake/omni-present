import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, MousePointer, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import NavigationHeatmap3D from './NavigationHeatmap3D';

export default function NavigationAnalyticsDashboard({ navigationData }) {
  const stats = [
    {
      label: 'Pages Visited Today',
      value: navigationData?.navigation_sequence?.length || 0,
      icon: MousePointer,
      color: 'text-cyan-400'
    },
    {
      label: 'Avg Time Per Page',
      value: `${navigationData?.navigation_sequence?.reduce((acc, n) => acc + (n.duration_seconds || 0), 0) / (navigationData?.navigation_sequence?.length || 1) || 0}s`,
      icon: Clock,
      color: 'text-purple-400'
    },
    {
      label: 'Navigation Efficiency',
      value: `${(navigationData?.navigation_efficiency_score * 100).toFixed(0)}%`,
      icon: Zap,
      color: 'text-green-400'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-green-400" />
        Your Navigation Analytics
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-white/60 text-xs">{stat.label}</p>
                    <p className="text-white text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {navigationData && (
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Most Visited Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <NavigationHeatmap3D navigationData={navigationData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}