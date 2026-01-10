import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MessageSquare, Star, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FeedbackDashboard() {
  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 100),
  });

  const stats = {
    total: feedbackList.length,
    positive: feedbackList.filter(f => f.sentiment === 'positive').length,
    neutral: feedbackList.filter(f => f.sentiment === 'neutral').length,
    negative: feedbackList.filter(f => f.sentiment === 'negative').length,
    avgRating: feedbackList.filter(f => f.rating).reduce((acc, f) => acc + f.rating, 0) / feedbackList.filter(f => f.rating).length || 0,
  };

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  const sentimentColors = {
    positive: 'text-green-400',
    neutral: 'text-yellow-400',
    negative: 'text-red-400',
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Feedback <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-white/60 text-lg">AI-powered sentiment analysis and insights</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-black/40 border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-white/60 text-sm">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
                  <div className="text-white/60 text-sm">Positive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{stats.neutral}</div>
                  <div className="text-white/60 text-sm">Neutral</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
                  <div className="text-white/60 text-sm">Negative</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Star className="w-8 h-8 text-purple-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">{stats.avgRating.toFixed(1)}</div>
                  <div className="text-white/60 text-sm">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-black/40 border-white/10 hover:border-cyan-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white mb-2">{feedback.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-white/10">{feedback.feedback_type}</Badge>
                        <Badge className={priorityColors[feedback.priority]}>{feedback.priority}</Badge>
                        <Badge className={sentimentColors[feedback.sentiment]}>{feedback.sentiment}</Badge>
                        {feedback.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-white/40 text-sm">
                      {new Date(feedback.created_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 mb-4">{feedback.description}</p>
                  {feedback.tags && feedback.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {feedback.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-white/40 text-xs">
                    Submitted by {feedback.created_by} • Confidence: {feedback.sentiment_score}%
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center text-white/60 py-12">
            Loading feedback...
          </div>
        )}

        {!isLoading && feedbackList.length === 0 && (
          <div className="text-center text-white/60 py-12">
            No feedback yet. Users can submit feedback using the feedback button.
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}