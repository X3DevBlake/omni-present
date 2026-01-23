import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Shield,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  predictive_alert: AlertTriangle,
  optimization_suggestion: TrendingUp,
  learning_opportunity: BookOpen,
  risk_warning: Shield,
  efficiency_tip: Zap,
  contextual_recommendation: Lightbulb
};

const urgencyColors = {
  low: 'bg-blue-500/20 border-blue-500 text-blue-200',
  medium: 'bg-yellow-500/20 border-yellow-500 text-yellow-200',
  high: 'bg-orange-500/20 border-orange-500 text-orange-200',
  critical: 'bg-red-500/20 border-red-500 text-red-200'
};

function InsightCard({ insight, onAccept, onDismiss }) {
  const Icon = iconMap[insight.insight_type] || Lightbulb;
  const urgencyClass = urgencyColors[insight.urgency_level] || urgencyColors.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-slate-800/50 backdrop-blur border ${urgencyClass}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <CardTitle className="text-white text-base">
                {insight.insight_type.split('_').map(w => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ')}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {(insight.confidence * 100).toFixed(0)}% confident
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-200">{insight.insight_text}</p>

          {insight.spatial_context && (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span>📍</span>
              Location: ({insight.spatial_context.location?.x?.toFixed(1)}, 
              {insight.spatial_context.location?.y?.toFixed(1)})
            </div>
          )}

          {insight.suggested_actions?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-300">Suggested Actions:</div>
              <div className="flex flex-wrap gap-2">
                {insight.suggested_actions.map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="text-xs bg-slate-700 hover:bg-slate-600 border-slate-600"
                    onClick={() => onAccept(insight, action)}
                  >
                    {action.action_label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-green-400 hover:text-green-300 hover:bg-green-900/20"
              onClick={() => onAccept(insight)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={() => onDismiss(insight)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProactiveInsightPanel({ 
  insights = [], 
  onAcceptInsight, 
  onDismissInsight 
}) {
  const criticalInsights = insights.filter(i => i.urgency_level === 'critical');
  const highInsights = insights.filter(i => i.urgency_level === 'high');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Proactive Insights
        </h3>
        <div className="flex gap-2">
          {criticalInsights.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalInsights.length} Critical
            </Badge>
          )}
          {highInsights.length > 0 && (
            <Badge variant="outline" className="bg-orange-900 text-orange-200">
              {highInsights.length} High Priority
            </Badge>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-slate-400"
          >
            <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active insights at the moment</p>
            <p className="text-sm mt-1">Your AI assistant is monitoring for opportunities</p>
          </motion.div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {insights
              .sort((a, b) => {
                const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level];
              })
              .map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAccept={onAcceptInsight}
                  onDismiss={onDismissInsight}
                />
              ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}