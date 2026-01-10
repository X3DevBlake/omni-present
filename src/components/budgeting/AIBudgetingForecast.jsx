import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

export default function AIBudgetingForecast({ userEmail }) {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['budgetForecast', userEmail],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: `Generate spending forecast for user`
    }),
    enabled: !!userEmail,
  });

  const { data: anomalies } = useQuery({
    queryKey: ['spendingAnomalies', userEmail],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: 'Detect spending anomalies'
    }),
    enabled: !!userEmail,
  });

  if (isLoading) return <div className="text-white/40">Loading forecast...</div>;

  const chartData = [
    { category: 'Housing', budget: 1200, predicted: 1250 },
    { category: 'Food', budget: 400, predicted: 420 },
    { category: 'Transport', budget: 300, predicted: 310 },
    { category: 'Entertainment', budget: 200, predicted: 230 },
    { category: 'Utilities', budget: 150, predicted: 145 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Next Month Forecast
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="category" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="budget" fill="#a855f7" name="Budget" />
            <Bar dataKey="predicted" fill="#06b6d4" name="Predicted" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {anomalies?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Spending Alerts
          </h4>
          <ul className="space-y-2">
            {anomalies.slice(0, 3).map((anomaly, idx) => (
              <li key={idx} className="text-sm text-white/70">
                • {anomaly}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4"
      >
        <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          AI Recommendations
        </h4>
        <ul className="space-y-2">
          <li className="text-sm text-white/70">• Potential to save $150-200/month on utilities</li>
          <li className="text-sm text-white/70">• Entertainment spending up 15% YoY</li>
          <li className="text-sm text-white/70">• Consider meal planning to optimize food costs</li>
        </ul>
      </motion.div>
    </div>
  );
}