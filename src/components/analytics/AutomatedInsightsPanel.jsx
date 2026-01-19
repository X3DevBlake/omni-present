import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, AlertCircle, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import InsightNetwork3D from './InsightNetwork3D';

export default function AutomatedInsightsPanel() {
  const generateInsights = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateAutomatedInsights', {});
      return response.data;
    },
  });

  const insights = generateInsights.data?.insights || [];

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      opportunity: <TrendingUp className="w-5 h-5 text-green-400" />,
      warning: <AlertCircle className="w-5 h-5 text-orange-400" />,
      discovery: <Sparkles className="w-5 h-5 text-purple-400" />,
    };
    return icons[type] || <Target className="w-5 h-5" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Generated Insights
              </CardTitle>
              <Button
                onClick={() => generateInsights.mutate()}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={generateInsights.isPending}
              >
                {generateInsights.isPending ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-${getPriorityColor(insight.priority)}-500/10 rounded-lg p-4 border border-${getPriorityColor(insight.priority)}-500/30`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {getTypeIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold">{insight.title}</h4>
                        <Badge className={`bg-${getPriorityColor(insight.priority)}-500/20 text-${getPriorityColor(insight.priority)}-400 border-0`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{insight.description}</p>

                      {insight.actionable_recommendations && (
                        <div className="bg-black/30 rounded p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-medium text-sm">Recommendations</span>
                          </div>
                          <ul className="space-y-1">
                            {insight.actionable_recommendations.map((rec, i) => (
                              <li key={i} className="text-white/70 text-xs">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60">Expected Impact</div>
                          <div className="text-green-400 font-bold">{insight.expected_impact}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60">Confidence</div>
                          <div className="text-cyan-400 font-bold">{(insight.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {insights.length === 0 && !generateInsights.isPending && (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Click 'Generate Insights' to analyze patterns</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {generateInsights.data?.data_sources && (
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(generateInsights.data.data_sources).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded p-2">
                    <div className="text-white/60 text-xs capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-white font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Insight Network</CardTitle>
        </CardHeader>
        <CardContent>
          <InsightNetwork3D insights={insights} />
        </CardContent>
      </Card>
    </div>
  );
}