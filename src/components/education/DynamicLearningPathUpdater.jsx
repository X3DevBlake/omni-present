import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DynamicLearningPathUpdater() {
  const [updates, setUpdates] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    subscribeToUpdates();
  }, []);

  const subscribeToUpdates = () => {
    if (!userEmail) return;

    // Subscribe to anomaly changes
    base44.entities.FraudAlert.subscribe((event) => {
      if (event.data.user_email === userEmail) {
        updatePathBasedOnAnomaly(event.data);
      }
    });

    // Subscribe to financial health changes
    base44.entities.FinancialHealthScore.subscribe((event) => {
      if (event.data.user_email === userEmail) {
        updatePathBasedOnHealth(event.data);
      }
    });
  };

  const updatePathBasedOnAnomaly = async (anomaly) => {
    try {
      const newModule = await base44.integrations.Core.InvokeLLM({
        prompt: `Create urgent learning module for detected anomaly:
        
Anomaly: ${anomaly.alert_type}
Severity: ${anomaly.severity}

Generate module covering:
1. What this anomaly means
2. Preventive measures
3. Quick fixes
4. When to seek help

Include interactive quiz and badge reward.`,
        response_json_schema: {
          type: 'object',
          properties: {
            module: { type: 'string' },
            urgency: { type: 'string' },
            badge: { type: 'string' },
          },
        },
      });

      setUpdates(prev => [...prev, {
        id: Date.now(),
        type: 'anomaly',
        title: `New: ${anomaly.alert_type}`,
        message: `Urgent module added based on detected ${anomaly.alert_type}`,
        badge: newModule.badge,
      }]);
    } catch (error) {
      console.error('Error updating path:', error);
    }
  };

  const updatePathBasedOnHealth = async (health) => {
    try {
      const improvement = health.overall_score > 650;
      const newModule = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate module based on financial health change:
        
Score: ${health.overall_score}/850
Improvement: ${improvement ? 'Yes' : 'No'}

Create module addressing next progression level.`,
        response_json_schema: {
          type: 'object',
          properties: {
            module: { type: 'string' },
            badge: { type: 'string' },
          },
        },
      });

      setUpdates(prev => [...prev, {
        id: Date.now(),
        type: 'health',
        title: 'Path Updated',
        message: `New module added based on your financial health improvement`,
        badge: newModule.badge,
      }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
        <p className="text-white font-bold">Live Path Updates</p>
      </div>

      {updates.map((update) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded p-3 flex items-start gap-3"
        >
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{update.title}</p>
            <p className="text-white/70 text-xs">{update.message}</p>
            {update.badge && <p className="text-2xl mt-1">{update.badge}</p>}
          </div>
        </motion.div>
      ))}

      {updates.length === 0 && (
        <p className="text-white/60 text-sm text-center py-4">
          Path will update as your financial profile changes
        </p>
      )}
    </div>
  );
}