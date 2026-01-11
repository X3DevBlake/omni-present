import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, TrendingUp, Lightbulb, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProactiveAIFeed() {
  const [insights, setInsights] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [userEmail, setUserEmail] = React.useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchInsights = async () => {
      try {
        const predictions = await base44.entities.PredictiveAnalytic.filter(
          { user_email: userEmail },
          '-created_date',
          5
        );
        
        const alerts = await base44.entities.ProactiveEvent.filter(
          { user_email: userEmail },
          '-created_date',
          3
        );

        const combinedInsights = [
          ...predictions.map(p => ({
            id: `pred-${p.id}`,
            type: p.prediction_type,
            title: `${p.prediction_type.replace('_', ' ').toUpperCase()}`,
            message: p.prediction,
            confidence: p.confidence,
            icon: TrendingUp,
            severity: 'info',
          })),
          ...alerts.map(a => ({
            id: `alert-${a.id}`,
            type: a.event_type,
            title: a.event_type.replace('_', ' ').toUpperCase(),
            message: a.description,
            severity: a.severity,
            icon: a.severity === 'critical' ? AlertCircle : Lightbulb,
          })),
        ].sort((a, b) => b.confidence - a.confidence).slice(0, 4);

        setInsights(combinedInsights);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      }
    };

    const interval = setInterval(fetchInsights, 10000);
    fetchInsights();
    return () => clearInterval(interval);
  }, [userEmail]);

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/10 to-red-500/5 border-red-500/30';
      case 'high':
        return 'from-orange-500/10 to-orange-500/5 border-orange-500/30';
      case 'medium':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30';
      default:
        return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="fixed top-20 right-6 max-w-md z-50">
      <AnimatePresence mode="popLayout">
        {visibleInsights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: -20, x: 100 }}
              animate={{ opacity: 1, y: idx * 100, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 100 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 bg-gradient-to-br ${getSeverityColor(insight.severity)} backdrop-blur-xl border rounded-xl p-4`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${getSeverityIcon(insight.severity)}`} />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-white/70 text-xs mb-2 line-clamp-2">
                    {insight.message}
                  </p>
                  {insight.confidence && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-black/30 rounded-full h-1">
                        <div
                          className="bg-cyan-400 h-1 rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-white/50">{Math.round(insight.confidence)}%</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDismissedIds(new Set([...dismissedIds, insight.id]))}
                  className="flex-shrink-0 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}