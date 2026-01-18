import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Lightbulb, Users, TrendingUp, Star } from 'lucide-react';

export default function SharedInsightsPanel({ insights }) {
  const getInsightColor = (type) => {
    const colors = {
      discovery: 'bg-blue-600',
      recommendation: 'bg-green-600',
      warning: 'bg-red-600',
      opportunity: 'bg-yellow-600',
      analysis: 'bg-purple-600'
    };
    return colors[type] || 'bg-slate-600';
  };

  const getImpactColor = (level) => {
    const colors = {
      low: 'text-blue-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[level] || 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No shared insights yet</p>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight, idx) => (
          <motion.div key={insight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-slate-600 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getInsightColor(insight.insight_type)}>
                        {insight.insight_type}
                      </Badge>
                      <span className={`text-sm font-semibold ${getImpactColor(insight.impact_level)}`}>
                        {insight.impact_level.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <CardTitle className="text-white text-lg">{insight.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">Relevance</p>
                    <p className="text-white font-bold">{insight.relevance_score}%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-300 text-sm">{insight.content}</p>

                {/* Tags */}
                {insight.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insight.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700">
                  <div className="text-center">
                    <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-slate-400 text-xs">Adoptions</p>
                    <p className="text-white font-semibold text-sm">{insight.adoption_count}</p>
                  </div>
                  <div className="text-center">
                    <Lightbulb className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-slate-400 text-xs">Source Hub</p>
                    <p className="text-white font-semibold text-sm capitalize">{insight.source_hub}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-slate-400 text-xs">Shared With</p>
                    <p className="text-white font-semibold text-sm">{insight.shared_with?.length || 0}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Full Insight
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}