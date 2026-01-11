import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Eye, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function AdvancedAnomalyDetector() {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const anomalies = {
    subscription: [
      {
        id: 1,
        service: 'Fitness Premium',
        severity: 'high',
        monthlyImpact: 29.99,
        explanation: 'No activity detected for 45 days. Last used: Nov 15, 2025.',
        recommendation: 'Cancel unused subscription to save $360/year',
        status: 'unused',
      },
      {
        id: 2,
        service: 'Cloud Storage x2',
        severity: 'medium',
        monthlyImpact: 9.99,
        explanation: 'Duplicate subscription detected. You have two active accounts.',
        recommendation: 'Consolidate to one account and cancel duplicate',
        status: 'duplicate',
      },
      {
        id: 3,
        service: 'Streaming Service',
        severity: 'medium',
        monthlyImpact: 4.99,
        explanation: 'Price increased from $9.99/mo to $14.99/mo (50% increase)',
        recommendation: 'Review new pricing tier or consider cancellation',
        status: 'price_increase',
      },
    ],
    investment: [
      {
        id: 4,
        assetClass: 'Technology',
        severity: 'high',
        previousAllocation: 25,
        currentAllocation: 42,
        explanation: 'Tech allocation jumped 17% without explicit trades. Market movement accounts for 8%, remaining 9% unexplained.',
        recommendation: 'Review recent purchases or consider rebalancing to target 30%',
        status: 'overweight',
      },
      {
        id: 5,
        assetClass: 'Emerging Markets',
        severity: 'low',
        previousAllocation: 10,
        currentAllocation: 7,
        explanation: 'Slight underweight due to market volatility. Within normal range.',
        recommendation: 'Monitor; may rebalance if drops below 6%',
        status: 'watch',
      },
    ],
    fraud: [
      {
        id: 6,
        merchant: 'Unknown Merchant XYZ',
        severity: 'critical',
        amount: 157.43,
        riskIndicators: ['New merchant', 'Unusual category', 'Different country'],
        confidence: 85,
        recommendation: 'Verify immediately. Consider blocking card if not recognized.',
        status: 'flagged',
      },
      {
        id: 7,
        merchant: 'Amazon',
        severity: 'medium',
        amount: 0.01,
        riskIndicators: ['Micro-charge pattern', 'Card verification'],
        confidence: 45,
        recommendation: 'This is likely a legitimate card verification test charge.',
        status: 'verified',
      },
    ],
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 border-red-400 text-red-400',
      high: 'bg-orange-500/20 border-orange-400 text-orange-400',
      medium: 'bg-yellow-500/20 border-yellow-400 text-yellow-400',
      low: 'bg-blue-500/20 border-blue-400 text-blue-400',
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'high':
        return <Zap className="w-5 h-5" />;
      case 'medium':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/20 rounded-lg p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Advanced Anomaly Detection
            </h3>
            <p className="text-white/60 text-sm mt-1">Subscriptions, investments, fraud detection & AI explanations</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-red-400">
              {Object.values(anomalies).flat().length}
            </p>
            <p className="text-white/60 text-xs">Total Anomalies</p>
          </div>
        </div>
      </motion.div>

      {/* Anomalies by Category */}
      {Object.entries(anomalies).map(([category, items]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {/* Category Header */}
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {category === 'subscription' && '💳'}
                {category === 'investment' && '📈'}
                {category === 'fraud' && '🔒'}
              </span>
              <div className="text-left">
                <p className="text-white font-bold capitalize">{category} Anomalies</p>
                <p className="text-white/60 text-xs">
                  {items.length} detected • {items.filter(i => i.severity === 'critical' || i.severity === 'high').length} critical/high
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              items.some(i => i.severity === 'critical')
                ? 'bg-red-500/20 text-red-400'
                : items.some(i => i.severity === 'high')
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-white/10 text-white/60'
            }`}>
              {expandedCategories[category] ? '−' : '+'}
            </span>
          </motion.button>

          {/* Category Items */}
          <AnimatePresence>
            {expandedCategories[category] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pl-4"
              >
                {items.map((anomaly, idx) => (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedAnomaly(anomaly)}
                    className={`p-4 bg-white/5 border rounded-lg cursor-pointer transition-all hover:border-white/30 ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(anomaly.severity)}
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {anomaly.service || anomaly.assetClass || anomaly.merchant}
                        </p>
                        <p className="text-white/70 text-sm mt-1">{anomaly.explanation}</p>
                        {anomaly.monthlyImpact && (
                          <p className="text-white/80 text-xs mt-2">
                            Monthly Impact: ${anomaly.monthlyImpact.toFixed(2)}
                          </p>
                        )}
                        {anomaly.amount && (
                          <p className="text-white/80 text-xs mt-2">
                            Amount: ${anomaly.amount.toFixed(2)}
                          </p>
                        )}
                        {anomaly.previousAllocation !== undefined && (
                          <p className="text-white/80 text-xs mt-2">
                            {anomaly.previousAllocation}% → {anomaly.currentAllocation}% ({anomaly.currentAllocation - anomaly.previousAllocation:+d}%)
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Detailed View */}
      {selectedAnomaly && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-white font-bold text-lg">
              {selectedAnomaly.service || selectedAnomaly.assetClass || selectedAnomaly.merchant}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedAnomaly(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-white/60 text-sm mb-1">Detailed Explanation</p>
              <p className="text-white/80">{selectedAnomaly.explanation}</p>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-1">AI-Generated Recommendation</p>
              <div className="bg-white/5 border border-white/10 rounded p-3">
                <p className="text-cyan-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{selectedAnomaly.recommendation}</span>
                </p>
              </div>
            </div>

            {selectedAnomaly.riskIndicators && (
              <div>
                <p className="text-white/60 text-sm mb-2">Risk Indicators</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnomaly.riskIndicators.map((indicator, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-xs">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedAnomaly.confidence && (
              <div>
                <p className="text-white/60 text-sm mb-1">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedAnomaly.confidence}%` }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    />
                  </div>
                  <span className="text-white font-bold">{selectedAnomaly.confidence}%</span>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="w-full mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
            >
              Take Action
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}