import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RealTimeTrendAnalyzer() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTrends = [
        {
          metric: 'Agent Efficiency',
          value: Math.floor(Math.random() * 20 + 80),
          change: Math.random() > 0.5 ? 'up' : 'down',
          percentage: Math.floor(Math.random() * 10 + 1)
        },
        {
          metric: 'Workflow Success Rate',
          value: Math.floor(Math.random() * 15 + 85),
          change: Math.random() > 0.3 ? 'up' : 'down',
          percentage: Math.floor(Math.random() * 8 + 1)
        },
        {
          metric: 'API Response Time',
          value: Math.floor(Math.random() * 50 + 50),
          change: Math.random() > 0.5 ? 'down' : 'up',
          percentage: Math.floor(Math.random() * 12 + 1)
        },
        {
          metric: 'Resource Utilization',
          value: Math.floor(Math.random() * 30 + 60),
          change: Math.random() > 0.6 ? 'up' : 'down',
          percentage: Math.floor(Math.random() * 5 + 1)
        }
      ];
      
      setTrends(newTrends);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-500" />
          Real-Time Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {trends.map((trend, idx) => trend ? (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">{trend?.metric}</p>
                {trend?.change === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{trend?.value}%</span>
                <Badge variant={trend?.change === 'up' ? 'default' : 'destructive'} className="text-xs">
                  {trend?.change === 'up' ? '+' : '-'}{trend?.percentage}%
                </Badge>
              </div>
            </motion.div>
          ) : null)}
        </div>
      </CardContent>
    </Card>
  );
}