import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb, Zap, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AIRecommendationCards({ recommendations = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'next_action': return <Zap className="w-5 h-5" />;
      case 'learning_path': return <BookOpen className="w-5 h-5" />;
      case 'agent_suggestion': return <Target className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-400" />
        AI Recommendations
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.filter(r => !r.dismissed && !r.acted_upon).slice(0, 6).map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-cyan-400">
                    {getIcon(rec.recommendation_type)}
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <CardTitle className="text-white text-base">
                  {rec.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/80 text-sm">{rec.description}</p>
                
                {rec.confidence_score && (
                  <div className="text-xs text-white/60">
                    Confidence: {(rec.confidence_score * 100).toFixed(0)}%
                  </div>
                )}

                {rec.reasoning && (
                  <p className="text-xs text-white/50 italic">{rec.reasoning}</p>
                )}

                {rec.action?.target_page && (
                  <Link to={createPageUrl(rec.action.target_page)}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                      {rec.action.action_type === 'navigate' ? 'Go' : 'Start'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}