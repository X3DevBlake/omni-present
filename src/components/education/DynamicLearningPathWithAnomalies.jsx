import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DynamicLearningPathWithAnomalies() {
  const [path, setPath] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    subscribeToChanges();
  }, []);

  const subscribeToChanges = () => {
    if (!userEmail) return;

    // Subscribe to anomaly detection
    base44.entities.FraudAlert.subscribe(async (event) => {
      if (event.type === 'create' && event.data.user_email === userEmail) {
        await generateAnomalyModule(event.data);
      }
    });

    // Subscribe to health score changes
    base44.entities.FinancialHealthScore.subscribe(async (event) => {
      if (event.data.user_email === userEmail) {
        await updatePathOnHealthChange(event.data);
      }
    });

    // Subscribe to strategy completions
    base44.entities.TradingStrategy.subscribe(async (event) => {
      if (event.type === 'update' && event.data.status === 'executed') {
        await generateStrategyFollowUp(event.data);
      }
    });
  };

  const generateAnomalyModule = async (anomaly) => {
    try {
      const module = await base44.integrations.Core.InvokeLLM({
        prompt: `Create urgent learning module for anomaly:
        
Anomaly: ${anomaly.alert_type}
Severity: ${anomaly.severity}
Description: ${anomaly.description}

Generate:
1. Module title and description
2. Learning objectives (3-5)
3. Quiz questions
4. Key takeaways
5. Badge reward emoji
6. Estimated completion time`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            badge: { type: 'string' },
            estimatedTime: { type: 'number' },
          },
        },
      });

      setUpdates(prev => [...prev, {
        id: Date.now(),
        type: 'anomaly',
        module,
        trigger: anomaly.alert_type,
        urgency: anomaly.severity,
      }]);
    } catch (error) {
      console.error('Error generating module:', error);
    }
  };

  const updatePathOnHealthChange = async (health) => {
    try {
      const improvement = health.overall_score > 650;
      const module = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate next learning module based on health change:
        
Score: ${health.overall_score}/850
Change: ${improvement ? 'Improvement' : 'Decline'}
Credit: ${health.credit_score}
SavingsRatio: ${health.savings_ratio}

Create module targeting next proficiency level.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            level: { type: 'string' },
            badge: { type: 'string' },
          },
        },
      });

      setUpdates(prev => [...prev, {
        id: Date.now(),
        type: 'health',
        module,
        trigger: `Health Score: ${health.overall_score}`,
      }]);
    } catch (error) {
      console.error('Error updating path:', error);
    }
  };

  const generateStrategyFollowUp = async (strategy) => {
    try {
      const module = await base44.integrations.Core.InvokeLLM({
        prompt: `Create follow-up learning module for completed strategy:
        
Strategy: ${strategy.strategy_name}
Result: ${strategy.status}

Generate module about:
1. Strategy results analysis
2. Lessons learned
3. Advanced techniques
4. Next investment strategies
5. Performance improvement badge`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            insights: { type: 'array', items: { type: 'string' } },
            badge: { type: 'string' },
          },
        },
      });

      setUpdates(prev => [...prev, {
        id: Date.now(),
        type: 'strategy',
        module,
        trigger: strategy.strategy_name,
      }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
        <p className="text-white font-bold">Dynamic Learning Updates</p>
      </div>

      {updates.map((update, idx) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`border rounded-lg p-3 ${
            update.type === 'anomaly'
              ? 'bg-red-500/10 border-red-400/30'
              : update.type === 'health'
              ? 'bg-green-500/10 border-green-400/30'
              : 'bg-yellow-500/10 border-yellow-400/30'
          }`}
        >
          <div className="flex items-start gap-2">
            {update.type === 'anomaly' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
            {update.type === 'health' && <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
            {update.type === 'strategy' && <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
            
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{update.module.title}</p>
              <p className="text-white/70 text-xs mt-1">{update.trigger}</p>
              {update.module.badge && (
                <p className="text-2xl mt-2">{update.module.badge}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {updates.length === 0 && (
        <p className="text-white/60 text-sm text-center py-4">
          Learning path updates will appear as your profile changes
        </p>
      )}
    </div>
  );
}