import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Sparkles, PartyPopper, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function ProactiveInsightsPanel({ insights = [], onDismiss }) {
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      case 'opportunity': return <Sparkles className="w-5 h-5" />;
      case 'celebration': return <PartyPopper className="w-5 h-5" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'from-red-600 to-red-800';
      case 'high': return 'from-orange-600 to-red-600';
      case 'medium': return 'from-blue-600 to-purple-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-cyan-400" />
        Proactive AI Insights
      </h3>
      
      <AnimatePresence>
        {insights.filter(i => !i.dismissed && !i.acknowledged).slice(0, 5).map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-r ${getColor(insight.urgency)} border-0 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-white/90">
                      {getIcon(insight.insight_type)}
                    </div>
                    <CardTitle className="text-white text-lg">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => onDismiss && onDismiss(insight.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <p className="text-white/90">{insight.message}</p>
                
                {insight.confidence && (
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className="bg-white/90 h-1.5 rounded-full transition-all"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span>{(insight.confidence * 100).toFixed(0)}% confident</span>
                  </div>
                )}

                {insight.suggested_actions?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {insight.suggested_actions.map((action, i) => (
                      <Link key={i} to={createPageUrl(action.target_page)}>
                        <Button
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                          {action.action}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}