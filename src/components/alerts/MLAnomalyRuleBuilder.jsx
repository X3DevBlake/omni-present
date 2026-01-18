import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Brain, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MLAnomalyRuleBuilder({ onRuleCreate }) {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: '',
    metric: '',
    sensitivity: 'medium',
    minDataPoints: 20
  });
  const [creating, setCreating] = useState(false);

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.metric) return;

    setCreating(true);
    try {
      const rule = {
        rule_name: newRule.name,
        rule_type: 'anomaly_detection',
        metric_name: newRule.metric,
        condition: {
          operator: 'anomaly_detected',
          sensitivity: newRule.sensitivity,
          min_data_points: newRule.minDataPoints
        },
        notification_channels: ['in_app', 'email'],
        enabled: true
      };

      const result = await base44.entities.AlertRule.create(rule);
      setRules([...rules, result]);
      setNewRule({ name: '', metric: '', sensitivity: 'medium', minDataPoints: 20 });
      onRuleCreate?.();
    } catch (error) {
      console.error('Failed to create rule:', error);
    } finally {
      setCreating(false);
    }
  };

  const sensitivities = {
    low: { label: 'Low', color: 'bg-green-500/20 text-green-300', desc: 'Only major deviations' },
    medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-300', desc: 'Moderate sensitivity' },
    high: { label: 'High', color: 'bg-orange-500/20 text-orange-300', desc: 'Very sensitive' },
    critical: { label: 'Critical', color: 'bg-red-500/20 text-red-300', desc: 'Extreme sensitivity' }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5" />
          ML-Based Anomaly Detection Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rule Builder */}
        <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
          <div>
            <label className="text-xs text-slate-300 mb-1 block">Rule Name</label>
            <Input
              placeholder="e.g., CPU Usage Anomaly"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 mb-1 block">Metric to Monitor</label>
            <Input
              placeholder="e.g., cpu_usage, memory_usage, response_time"
              value={newRule.metric}
              onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Sensitivity</label>
              <select
                value={newRule.sensitivity}
                onChange={(e) => setNewRule({ ...newRule, sensitivity: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm px-3 py-2 rounded"
              >
                {Object.entries(sensitivities).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Min Data Points</label>
              <Input
                type="number"
                min="5"
                max="100"
                value={newRule.minDataPoints}
                onChange={(e) => setNewRule({ ...newRule, minDataPoints: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateRule}
            disabled={creating || !newRule.name || !newRule.metric}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create ML Rule
              </>
            )}
          </Button>
        </div>

        {/* Rules List */}
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No ML rules created yet</p>
          ) : (
            rules.map((rule, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{rule.rule_name}</p>
                    <p className="text-xs text-slate-400 mt-1">Metric: {rule.metric_name}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={sensitivities[rule.condition?.sensitivity]?.color}>
                        {sensitivities[rule.condition?.sensitivity]?.label}
                      </Badge>
                      {rule.enabled && (
                        <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-slate-400 p-3 bg-slate-800/30 rounded border border-slate-700">
          💡 ML-based anomaly detection automatically learns normal patterns from your data and alerts when deviations are detected.
        </p>
      </CardContent>
    </Card>
  );
}