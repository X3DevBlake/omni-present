import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock, Zap } from 'lucide-react';

export default function PredictiveAlertsPanel() {
  const [activeTab, setActiveTab] = useState('all');

  const alerts = [
    {
      id: 1,
      type: 'Conflict Risk',
      title: 'Potential Agent Disagreement',
      description: 'Portfolio Manager and Risk Analyzer showing divergent signals on tech allocation',
      probability: 0.82,
      timeframe: 'Within 24-48 hours',
      severity: 'high',
      mitigation: 'Schedule consensus meeting',
    },
    {
      id: 2,
      type: 'Market Risk',
      title: 'Volatility Spike Forecasted',
      description: 'Model predicts elevated volatility in equity markets next week due to Fed decision',
      probability: 0.76,
      timeframe: 'Within 7 days',
      severity: 'medium',
      mitigation: 'Consider hedging positions',
    },
    {
      id: 3,
      type: 'Action Deadline',
      title: 'Tax-Loss Harvesting Window',
      description: 'Optimal time to execute tax-loss harvesting: Dec 15-22 (3 trading days before year-end)',
      probability: 0.95,
      timeframe: 'Next week',
      severity: 'medium',
      mitigation: 'Review positions for harvesting',
    },
    {
      id: 4,
      type: 'System Alert',
      title: 'Cache Performance Degradation',
      description: 'Database query response times trending up by 8% week-over-week',
      probability: 0.68,
      timeframe: 'Within 2 weeks',
      severity: 'low',
      mitigation: 'Monitor and optimize queries',
    },
  ];

  const filterAlerts = (tab) => {
    if (tab === 'all') return alerts;
    return alerts.filter(a => a.type.toLowerCase().includes(tab.toLowerCase()));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Conflict Risk': return AlertTriangle;
      case 'Market Risk': return TrendingDown;
      case 'Action Deadline': return Clock;
      case 'System Alert': return Zap;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const filtered = filterAlerts(activeTab);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'Conflict Risk', 'Market Risk', 'Action Deadline', 'System Alert'].map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 text-sm transition-all ${
              activeTab === tab
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {filtered.map((alert, idx) => {
          const Icon = getIcon(alert.type);
          const colorClass = getSeverityColor(alert.severity);
          const colorMap = { red: 'red-400', yellow: 'yellow-400', blue: 'blue-400', gray: 'gray-400' };
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`border-l-4 p-4 rounded-lg bg-white/5 border-b border-r border-white/10 ${
                colorClass === 'red' ? 'border-l-red-400' : colorClass === 'yellow' ? 'border-l-yellow-400' : 'border-l-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${colorMap[colorClass]}/10`}>
                  <Icon className={`w-5 h-5 text-${colorMap[colorClass]}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-white font-bold text-sm">{alert.title}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-${colorMap[colorClass]}/20 text-${colorMap[colorClass]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{alert.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-white/60">Probability</p>
                      <p className="text-cyan-400 font-bold">{(alert.probability * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-white/60">Timeframe</p>
                      <p className="text-white/80 font-semibold">{alert.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Recommended Action</p>
                      <p className="text-white/80 font-semibold">{alert.mitigation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-4"
      >
        <p className="text-white/80 text-sm">
          <span className="font-bold text-cyan-400">{filtered.length}</span> predictive alerts active. 
          System analyzing 847 data points across markets, portfolios, and agent behavior.
        </p>
      </motion.div>
    </div>
  );
}