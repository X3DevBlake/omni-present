import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Heart, Volume2, MessageSquare, TrendingUp } from 'lucide-react';

const emotionColors = {
  happy: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '😊' },
  sad: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '😢' },
  angry: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '😠' },
  frustrated: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: '😤' },
  excited: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '🤩' },
  calm: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: '😌' },
  stressed: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '😰' },
  neutral: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: '😐' },
  confused: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', icon: '🤔' }
};

export default function EmotionDetectionPanel({ emotions, recentCommands }) {
  const latestEmotion = emotions?.[0];
  const emotionHistory = emotions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Current Emotion */}
      {latestEmotion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={`${emotionColors[latestEmotion.primary_emotion]?.bg || 'bg-slate-900/60'} border-2 ${emotionColors[latestEmotion.primary_emotion]?.text || 'text-slate-400'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {emotionColors[latestEmotion.primary_emotion]?.icon || '😐'}
                  </span>
                  <div>
                    <p className="capitalize">{latestEmotion.primary_emotion}</p>
                    <p className="text-sm opacity-70">Confidence: {(latestEmotion.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <Heart className="w-6 h-6 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Emotion Intensity</span>
                    <span className="font-bold">{(latestEmotion.emotion_intensity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${emotionColors[latestEmotion.primary_emotion]?.text || 'bg-slate-400'}`}
                      style={{ width: `${latestEmotion.emotion_intensity * 100}%` }}
                    />
                  </div>
                </div>

                {latestEmotion.secondary_emotions?.length > 0 && (
                  <div>
                    <p className="text-sm mb-2">Secondary Emotions</p>
                    <div className="flex flex-wrap gap-2">
                      {latestEmotion.secondary_emotions.map((e, idx) => (
                        <Badge key={idx} className="bg-slate-700/50 text-slate-300">
                          {e.emotion} ({(e.intensity * 100).toFixed(0)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700">
                  <p className="text-sm mb-2">Agent Response</p>
                  <p className="text-xs text-slate-400">
                    Tone: <span className="capitalize text-slate-300">{latestEmotion.agent_response_triggered?.tone_adjustment}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Actions taken: {latestEmotion.agent_response_triggered?.actions_taken?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Emotion Source Analysis */}
      {latestEmotion && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Detection Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {latestEmotion.emotion_source === 'voice' && <Volume2 className="w-5 h-5 text-blue-400" />}
                {latestEmotion.emotion_source === 'text' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                {latestEmotion.emotion_source === 'behavioral' && <TrendingUp className="w-5 h-5 text-orange-400" />}
                <span className="capitalize text-slate-300">{latestEmotion.emotion_source}</span>
              </div>
              {latestEmotion.raw_analysis?.tone_analysis && (
                <p className="text-sm text-slate-400">
                  Tone: {latestEmotion.raw_analysis.tone_analysis}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emotion History */}
      {emotionHistory.length > 1 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Recent Emotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emotionHistory.slice(1).map((emotion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emotionColors[emotion.primary_emotion]?.icon || '😐'}</span>
                    <div>
                      <p className="capitalize text-sm text-slate-300">{emotion.primary_emotion}</p>
                      <p className="text-xs text-slate-500">Intensity: {(emotion.emotion_intensity * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!latestEmotion && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No emotion detected yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}