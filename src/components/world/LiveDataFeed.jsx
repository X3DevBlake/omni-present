import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function LiveDataFeed({ onDataUpdate }) {
  const [liveData, setLiveData] = useState({
    agentActivity: 0,
    economicFlow: 0,
    socialDynamics: 0,
    environmentalChange: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        agentActivity: Math.random() * 100,
        economicFlow: Math.random() * 1000,
        socialDynamics: Math.random() * 100,
        environmentalChange: Math.random() * 50,
        timestamp: Date.now()
      };
      
      setLiveData(newData);
      onDataUpdate?.(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Agent Activity', value: liveData.agentActivity.toFixed(0), icon: Users, color: 'cyan' },
    { label: 'Economic Flow', value: `$${liveData.economicFlow.toFixed(0)}`, icon: DollarSign, color: 'green' },
    { label: 'Social Dynamics', value: liveData.socialDynamics.toFixed(0), icon: TrendingUp, color: 'purple' },
    { label: 'Environment', value: liveData.environmentalChange.toFixed(0), icon: Activity, color: 'orange' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map(metric => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            className={`bg-${metric.color}-500/10 border border-${metric.color}-500/30 rounded-xl p-4`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className={`w-5 h-5 text-${metric.color}-400 mb-2`} />
            <div className="text-white/60 text-xs mb-1">{metric.label}</div>
            <div className={`text-${metric.color}-400 text-2xl font-bold`}>{metric.value}</div>
          </motion.div>
        );
      })}
    </div>
  );
}