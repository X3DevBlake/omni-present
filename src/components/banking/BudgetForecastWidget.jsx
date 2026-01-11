import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function BudgetForecastWidget({ userEmail }) {
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);

  const { data: forecast } = useQuery({
    queryKey: ['budgetForecast', userEmail, currentMonth],
    queryFn: () =>
      base44.entities.AIBudgetForecast.filter(
        { user_email: userEmail },
        '-created_date',
        1
      ).then(res => res[0]),
    enabled: !!userEmail
  });

  if (!forecast) {
    return (
      <Card className="bg-black/40 border border-white/10 p-6">
        <p className="text-white/60 text-center">Loading budget forecast...</p>
      </Card>
    );
  }

  const savingsAmount = forecast.predicted_income - forecast.predicted_spending;
  const savingsPercent = (savingsAmount / forecast.predicted_income * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Predicted Income</p>
          <p className="text-2xl font-bold text-white">${forecast.predicted_income.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <p className="text-orange-400 text-sm font-semibold mb-1">Predicted Spending</p>
          <p className="text-2xl font-bold text-white">${forecast.predicted_spending.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${savingsAmount > 0 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-4`}
        >
          <p className={`text-sm font-semibold mb-1 ${savingsAmount > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {savingsAmount > 0 ? 'Potential Savings' : 'Deficit'}
          </p>
          <p className={`text-2xl font-bold ${savingsAmount > 0 ? 'text-cyan-300' : 'text-red-300'}`}>
            ${Math.abs(savingsAmount).toFixed(2)}
          </p>
          <p className="text-xs text-white/60 mt-1">{savingsPercent}% of income</p>
        </motion.div>
      </div>

      {/* Spending breakdown */}
      {forecast.spending_by_category && (
        <Card className="bg-black/40 border border-white/10 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            Spending Forecast by Category
          </h3>
          <div className="space-y-4">
            {Object.entries(forecast.spending_by_category).map(([category, amount], idx) => {
              const percent = (amount / forecast.predicted_spending * 100).toFixed(0);
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-white capitalize font-medium">{category}</p>
                    <span className="text-white/70 text-sm">
                      ${amount.toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <Progress value={parseInt(percent)} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Anomalies */}
      {forecast.anomalies_detected && forecast.anomalies_detected.length > 0 && (
        <Card className="bg-yellow-500/10 border border-yellow-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Spending Anomalies Detected
          </h3>
          <div className="space-y-3">
            {forecast.anomalies_detected.map((anomaly, idx) => (
              <div key={idx} className="p-3 bg-black/20 rounded-lg">
                <p className="text-yellow-300 font-semibold capitalize text-sm mb-1">
                  {anomaly.category} {anomaly.change_percent > 0 ? '↑' : '↓'}
                </p>
                <p className="text-white/70 text-xs">{anomaly.reason}</p>
                <p className="text-yellow-400 text-xs font-semibold mt-1">
                  Change: {anomaly.change_percent > 0 ? '+' : ''}{anomaly.change_percent}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {forecast.recommendations && forecast.recommendations.length > 0 && (
        <Card className="bg-cyan-500/10 border border-cyan-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            AI Budget Recommendations
          </h3>
          <ul className="space-y-2">
            {forecast.recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 text-white/80 text-sm"
              >
                <span className="text-cyan-400 font-bold mt-0.5">→</span>
                <span>{rec}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      )}

      {/* Confidence score */}
      <div className="text-center">
        <p className="text-white/60 text-sm mb-2">Forecast Confidence</p>
        <div className="flex items-center justify-center gap-2">
          <Progress value={forecast.confidence_score} className="w-32 h-2" />
          <span className="text-cyan-400 font-bold text-sm">{forecast.confidence_score}%</span>
        </div>
      </div>
    </div>
  );
}