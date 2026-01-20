import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionableInsightsEngine({ insights, onExecuteAction, onDismiss }) {
  const getInsightIcon = (type) => {
    const icons = {
      defi_strategy: TrendingUp,
      security_alert: Shield,
      agent_training: CheckCircle2,
      simulation_adjustment: Zap,
      governance_action: AlertCircle,
      cross_hub_optimization: TrendingUp
    };
    return icons[type] || AlertCircle;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      critical: 'from-red-500/20 to-orange-500/20 border-red-500/30',
      high: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
      medium: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      low: 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
    };
    return colors[urgency] || colors.medium;
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {insights?.map((insight, index) => {
          const Icon = getInsightIcon(insight.insight_type);
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-gradient-to-r ${getUrgencyColor(insight.urgency_level)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/10 rounded-lg p-2">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg mb-1">{insight.insight_title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          {insight.source_hubs?.map((hub, i) => (
                            <Badge key={i} className="bg-blue-500/30 text-blue-200 text-xs">
                              {hub}
                            </Badge>
                          ))}
                          <span className="text-white/40">→</span>
                          {insight.affected_hubs?.map((hub, i) => (
                            <Badge key={i} className="bg-purple-500/30 text-purple-200 text-xs">
                              {hub}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      insight.urgency_level === 'critical' ? 'bg-red-600' :
                      insight.urgency_level === 'high' ? 'bg-orange-600' :
                      insight.urgency_level === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                    }>
                      {insight.urgency_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insight.ai_analysis && (
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-purple-300 text-xs mb-1">AI Analysis</div>
                      <div className="text-white text-sm">{insight.ai_analysis.detected_pattern}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-white/60">
                          Correlation: <span className="text-cyan-400">{insight.ai_analysis.correlation_strength?.toFixed(2)}</span>
                        </span>
                        <span className="text-white/60">
                          Confidence: <span className="text-green-400">{insight.ai_analysis.confidence_level?.toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {insight.predictive_data?.market_volatility_forecast && (
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded p-3">
                      <div className="text-orange-300 text-xs mb-1">📊 Market Volatility Forecast</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-white/60">Predicted Volatility</div>
                          <div className="text-white font-bold">
                            {insight.predictive_data.market_volatility_forecast.predicted_volatility?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60">Simulation Impact</div>
                          <div className="text-orange-400">
                            {insight.predictive_data.market_volatility_forecast.simulation_impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-white/60 text-xs mb-2">Recommended Actions</div>
                    <div className="space-y-2">
                      {insight.concrete_actions?.map((action, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium mb-1">
                                {action.action_description}
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <Badge className="bg-cyan-500/30 text-cyan-200">{action.target_hub}</Badge>
                                <span className="text-white/60">Priority: {action.priority}</span>
                                <span className="text-green-400">Impact: +{action.estimated_impact}</span>
                              </div>
                            </div>
                            {action.automated_execution ? (
                              <Badge className="bg-green-500">Auto</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => onExecuteAction?.(insight.id, action)}
                                className="bg-purple-600"
                              >
                                Execute
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDismiss?.(insight.id)}
                      className="flex-1"
                    >
                      Dismiss
                    </Button>
                    {insight.auto_execution_allowed && (
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Auto-Execute All
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!insights?.length && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No actionable insights at the moment</p>
            <p className="text-white/40 text-sm mt-2">The AI will generate insights automatically</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}