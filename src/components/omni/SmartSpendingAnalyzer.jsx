import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SmartSpendingAnalyzer() {
  const insights = [
    {
      type: 'savings',
      icon: TrendingDown,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      title: 'Potential Savings Identified',
      message: 'You could save $45/month by switching to a different internet provider',
      action: 'View Options'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      title: 'Budget Alert',
      message: 'You\'re approaching your shopping budget limit (93% used)',
      action: 'Adjust Budget'
    },
    {
      type: 'tip',
      icon: Lightbulb,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      title: 'Smart Tip',
      message: 'Shopping on Tuesdays typically saves you 12% based on your history',
      action: 'Learn More'
    },
    {
      type: 'success',
      icon: CheckCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      title: 'Goal Progress',
      message: 'You\'re on track to save $500 this month - 87% complete!',
      action: 'View Goals'
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold text-xl mb-4">AI-Powered Insights</h3>
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${insight.bgColor} border ${insight.borderColor} rounded-xl p-4`}
        >
          <div className="flex items-start gap-4">
            <div className={`${insight.color}`}>
              <insight.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className={`${insight.color} font-bold mb-1`}>{insight.title}</h4>
              <p className="text-white/80 text-sm mb-3">{insight.message}</p>
              <button className={`px-4 py-2 ${insight.bgColor} ${insight.color} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}>
                {insight.action}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}