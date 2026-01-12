import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, Loader, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  generateBudgetForecast,
  calculateFinancialHealthScore,
  detectFraudulentActivity
} from '../../functions/banking/ai-budget-forecaster';

export default function AIFinancialAdvisor({ userEmail }) {
  const [forecast, setForecast] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) loadData();
  }, [userEmail]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [forecastData, healthData, alertsData] = await Promise.all([
        generateBudgetForecast(userEmail),
        calculateFinancialHealthScore(userEmail),
        detectFraudulentActivity(userEmail)
      ]);

      setForecast(forecastData);
      setHealthScore(healthData);
      setFraudAlerts(alertsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      {healthScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-white font-bold text-lg">Financial Health Score</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <ScoreCard
              label="Overall Score"
              value={healthScore.overall_score}
              max={850}
              color="cyan"
            />
            <ScoreCard
              label="Credit Score"
              value={healthScore.credit_score}
              max={850}
              color="green"
            />
            <ScoreCard
              label="Savings Ratio"
              value={`${healthScore.savings_ratio}%`}
              color="blue"
            />
            <ScoreCard
              label="Emergency Fund"
              value={`${healthScore.emergency_fund_months} mo`}
              color="purple"
            />
          </div>

          <div className="space-y-2">
            <p className="text-white/60 text-sm font-semibold">AI Recommendations:</p>
            {healthScore.recommendations?.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="bg-white/5 rounded p-3">
                <p className="text-white/80 text-sm">• {rec.description || rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Budget Forecast */}
      {forecast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h3 className="text-white font-bold text-lg">Next Month Forecast</h3>
            <span className="ml-auto text-cyan-400 text-sm font-semibold">
              {forecast.confidence_score}% Confidence
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded p-4">
              <p className="text-white/60 text-xs mb-1">Income</p>
              <p className="text-green-400 font-bold text-xl">
                ${forecast.predicted_income?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 rounded p-4">
              <p className="text-white/60 text-xs mb-1">Spending</p>
              <p className="text-red-400 font-bold text-xl">
                ${forecast.predicted_spending?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 rounded p-4">
              <p className="text-white/60 text-xs mb-1">Savings</p>
              <p className="text-cyan-400 font-bold text-xl">
                ${forecast.savings_potential?.toLocaleString()}
              </p>
            </div>
          </div>

          {forecast.anomalies_detected?.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Anomalies Detected:</p>
              {forecast.anomalies_detected.map((anomaly, idx) => (
                <div key={idx} className="bg-yellow-500/10 rounded p-2 mb-2">
                  <p className="text-white/80 text-xs">
                    {anomaly.category}: {anomaly.change_percent}% change - {anomaly.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h3 className="text-white font-bold text-lg">Fraud Alerts</h3>
          </div>

          <div className="space-y-3">
            {fraudAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`bg-white/5 rounded p-4 border ${
                  alert.severity === 'critical'
                    ? 'border-red-400/50'
                    : alert.severity === 'high'
                    ? 'border-orange-400/50'
                    : 'border-yellow-400/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{alert.alert_type}</p>
                    <p className="text-white/60 text-xs">{alert.description}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-white/50 text-xs">{alert.ai_explanation}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={loadData}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg"
      >
        <Sparkles className="w-4 h-4" />
        Refresh AI Analysis
      </button>
    </div>
  );
}

function ScoreCard({ label, value, max, color }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="bg-white/5 rounded p-3">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className={`${colorClasses[color]} font-bold text-2xl`}>
        {typeof value === 'number' ? Math.round(value) : value}
        {max && <span className="text-white/40 text-sm">/{max}</span>}
      </p>
    </div>
  );
}