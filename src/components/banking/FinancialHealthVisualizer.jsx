import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function FinancialHealthVisualizer({ userEmail }) {
  const { data: healthScore } = useQuery({
    queryKey: ['healthScore', userEmail],
    queryFn: () => base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-created_date', 1).then(res => res[0]),
    enabled: !!userEmail
  });

  if (!healthScore) {
    return (
      <div className="text-center py-12 text-white/60">
        No financial health data available yet.
      </div>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 750) return 'from-green-500 to-emerald-600';
    if (score >= 650) return 'from-blue-500 to-cyan-600';
    if (score >= 550) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const metrics = [
    {
      label: 'Savings Ratio',
      value: (healthScore.savings_ratio || 0).toFixed(1),
      unit: '%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Debt Ratio',
      value: (healthScore.debt_ratio || 0).toFixed(1),
      unit: '%',
      icon: AlertTriangle,
      color: 'text-red-400',
      inverse: true
    },
    {
      label: 'Emergency Fund',
      value: (healthScore.emergency_fund_months || 0).toFixed(1),
      unit: 'months',
      icon: Activity,
      color: 'text-cyan-400'
    },
    {
      label: 'Portfolio Diversity',
      value: (healthScore.investment_diversity || 0).toFixed(0),
      unit: '%',
      icon: Zap,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${getHealthColor(healthScore.overall_score)} rounded-2xl p-8 text-center text-white`}
      >
        <p className="text-white/80 mb-2 uppercase tracking-widest text-sm">Overall Financial Health</p>
        <h2 className="text-7xl font-bold mb-4">{healthScore.overall_score}</h2>
        <p className="text-white/80">out of 850</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const displayValue = metric.inverse ? 100 - parseInt(metric.value) : parseInt(metric.value);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{metric.label}</h3>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>

              <div className="mb-3">
                <p className={`text-3xl font-bold ${metric.color}`}>
                  {metric.value}<span className="text-lg">{metric.unit}</span>
                </p>
              </div>

              <Progress value={displayValue} className="h-2" />
            </motion.div>
          );
        })}
      </div>

      {/* Credit Score Details */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-6">
        <h3 className="text-white font-bold mb-6">Credit Score Breakdown</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {healthScore.credit_score}
            </div>
            <p className="text-white/60 text-sm">Credit Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-2">
              {healthScore.fraud_risk_level}
            </div>
            <p className="text-white/60 text-sm">Fraud Risk</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {healthScore.investment_diversity}%
            </div>
            <p className="text-white/60 text-sm">Diversified</p>
          </div>
        </div>
      </Card>

      {/* Recommendations Section */}
      {healthScore.recommendations && healthScore.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
          <h3 className="text-white font-bold mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {healthScore.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-black/20 rounded-lg border-l-4 border-purple-500"
              >
                <p className="text-white font-semibold mb-1">{rec.title}</p>
                <p className="text-white/70 text-sm mb-2">{rec.description}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  rec.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {rec.impact} Impact
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}