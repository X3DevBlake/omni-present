import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Heart, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentLearningDashboard({ agentId, interactions, emotions }) {
  const queryClient = useQueryClient();

  const learnMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('adaptive-agent-learning', {
        agent_id: agentId,
        learning_type: 'comprehensive'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Learning complete! Score: ${data.learning_analysis.overall_effectiveness_score}`);
      queryClient.invalidateQueries(['physical-interactions']);
      queryClient.invalidateQueries(['dynamic-detections']);
    }
  });

  const successRate = interactions?.length 
    ? (interactions.filter(i => i.interaction_success).length / interactions.length * 100) 
    : 0;

  const dominantEmotion = emotions?.length
    ? emotions.reduce((acc, e) => {
        acc[e.primary_emotion] = (acc[e.primary_emotion] || 0) + 1;
        return acc;
      }, {})
    : {};

  const topEmotion = Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  return (
    <div className="space-y-6">
      {/* Learning Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-cyan-400 text-xs">Interactions</p>
              <p className="text-white text-2xl font-bold">{interactions?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-green-400 text-xs">Success Rate</p>
              <p className="text-white text-2xl font-bold">{successRate.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-purple-400 text-xs">Top Emotion</p>
              <p className="text-white text-xl font-bold capitalize">{topEmotion}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-orange-400 text-xs">Emotions Detected</p>
              <p className="text-white text-2xl font-bold">{emotions?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trigger Learning */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Adaptive Learning Engine
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Analyze patterns and update agent behaviors automatically
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => learnMutation.mutate()}
            disabled={learnMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
          >
            {learnMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Learning...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Run Learning Cycle</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Learning Results */}
      {learnMutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white">Learning Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Effectiveness Score</span>
                <Badge className="bg-green-500/20 text-green-400 text-lg">
                  {learnMutation.data.learning_analysis.overall_effectiveness_score}/100
                </Badge>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Behavior Adjustments</p>
                <div className="space-y-1">
                  {learnMutation.data.learning_analysis.behavior_adjustments?.slice(0, 3).map((adj, idx) => (
                    <p key={idx} className="text-white text-sm">• {adj}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Communication Updates</p>
                <div className="flex gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    Tone: {learnMutation.data.learning_analysis.communication_style_updates?.tone}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {learnMutation.data.learning_analysis.communication_style_updates?.complexity_level}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Emotion Response Patterns</p>
                <div className="flex flex-wrap gap-2">
                  {learnMutation.data.learning_analysis.emotion_response_patterns?.slice(0, 3).map((pattern, idx) => (
                    <Badge key={idx} className="bg-pink-500/20 text-pink-400">
                      {pattern.emotion}: {pattern.response_strategy?.slice(0, 20)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Detections Updated</p>
                  <p className="text-white font-bold">{learnMutation.data.updates_applied.detections_updated}</p>
                </div>
                <div>
                  <p className="text-slate-400">Interactions Updated</p>
                  <p className="text-white font-bold">{learnMutation.data.updates_applied.interactions_updated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}