import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Sliders, Plus, Trash2 } from 'lucide-react';

export default function AnomalyDetectionPanel() {
  const [sensitivity, setSensitivity] = useState(70);
  const [customRules, setCustomRules] = useState([
    { id: 1, name: 'High Volatility + Low Performance', condition: 'volatility > 30% AND agent_accuracy < 75%', enabled: true },
    { id: 2, name: 'Unusual Volume Spike', condition: 'volume_change > 150%', enabled: true },
  ]);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '' });

  const detectedAnomalies = [
    {
      id: 1,
      pattern: 'Market volatility spike correlated with portfolio risk increase',
      severity: 'high',
      confidence: 0.94,
      variables: ['VIX', 'portfolio_volatility', 'agent_response_time'],
      rootCause: 'Fed announcement causing market-wide repricing',
    },
    {
      id: 2,
      pattern: 'Agent performance degradation during high trading volume',
      severity: 'medium',
      confidence: 0.87,
      variables: ['trading_volume', 'decision_accuracy', 'response_latency'],
      rootCause: 'System resource contention during peak hours',
    },
  ];

  const handleAddRule = () => {
    if (newRule.name && newRule.condition) {
      setCustomRules([...customRules, { id: Date.now(), ...newRule, enabled: true }]);
      setNewRule({ name: '', condition: '' });
      setShowNewRule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sensitivity Control */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Anomaly Detection Sensitivity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold">Sensitivity Level</label>
            <span className="text-cyan-400 font-bold">{sensitivity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-white/60 text-sm mt-2">
            {sensitivity < 30 ? 'Very Low - Detects only extreme anomalies' :
             sensitivity < 60 ? 'Low - Balanced approach, fewer false positives' :
             sensitivity < 80 ? 'Medium - Detects subtle patterns' :
             'High - Sensitive to minor deviations, may have false positives'}
          </p>
        </div>
      </motion.div>

      {/* Custom Rules */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Custom Anomaly Rules</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowNewRule(!showNewRule)}
            className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 text-sm hover:bg-cyan-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </motion.button>
        </div>

        {showNewRule && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-3"
          >
            <input
              type="text"
              placeholder="Rule name (e.g., High Volatility Alert)"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm"
            />
            <input
              type="text"
              placeholder="Condition (e.g., volatility > 30% AND accuracy < 75%)"
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm"
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAddRule}
                className="flex-1 px-3 py-2 bg-green-500/20 border border-green-400 rounded-lg text-green-300 text-sm hover:bg-green-500/30 transition-all"
              >
                Create
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowNewRule(false)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 text-sm hover:bg-white/20 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {customRules.map((rule, idx) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => {
                  const updated = customRules.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r);
                  setCustomRules(updated);
                }}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{rule.name}</p>
                <p className="text-white/60 text-xs font-mono">{rule.condition}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setCustomRules(customRules.filter(r => r.id !== rule.id))}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detected Anomalies */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Detected Multi-Variate Anomalies
        </h3>
        <div className="space-y-3">
          {detectedAnomalies.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              whileHover={{ y: -2 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-bold">{anomaly.pattern}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-2">{anomaly.rootCause}</p>
              <div className="space-y-1 text-xs text-white/60">
                <p><span className="font-semibold">Confidence:</span> {(anomaly.confidence * 100).toFixed(0)}%</p>
                <p><span className="font-semibold">Variables:</span> {anomaly.variables.join(', ')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}