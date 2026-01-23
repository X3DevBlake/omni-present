import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, Upload, Wand2 } from 'lucide-react';
import AnimationLibrary from '../components/animations/AnimationLibrary';
import { AchievementUnlock, LevelUpAnimation } from '../components/animations/GamificationAnimations';
import { AISuggestionPopup, ProactiveInsightCard } from '../components/animations/AIFeedbackAnimations';
import { toast } from 'sonner';

export default function AnimationStudio() {
  const queryClient = useQueryClient();
  const [showAchievement, setShowAchievement] = React.useState(false);
  const [showSuggestion, setShowSuggestion] = React.useState(false);

  const { data: animations = [] } = useQuery({
    queryKey: ['all-animations'],
    queryFn: () => base44.entities.AnimationAsset.list('-created_date', 50),
    initialData: []
  });

  const recommendAnimationsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('animationManager', {
        action: 'ai_recommend_animations',
        context: 'user_achievement',
        user_mood: 'excited',
        system_state: 'high_activity'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.recommendations?.length || 0} animations recommended!`);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
            Animation Studio
          </h1>
          <p className="text-white/60 text-lg">
            Manage and test 700 engaging animations across the Omni-Present ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50">
            <CardContent className="pt-6">
              <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
              <div className="text-3xl font-bold text-white">{animations.length}</div>
              <div className="text-white/60 text-sm">Total Animations</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Play className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-white/60 text-sm">Categories</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <Wand2 className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-white/60 text-sm">Powered</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <Upload className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">3D</div>
              <div className="text-white/60 text-sm">Immersive</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setShowAchievement(true)}
            className="bg-yellow-600 hover:bg-yellow-700 h-14"
          >
            Test Achievement Animation
          </Button>
          <Button
            onClick={() => setShowSuggestion(true)}
            className="bg-purple-600 hover:bg-purple-700 h-14"
          >
            Test AI Suggestion
          </Button>
          <Button
            onClick={() => recommendAnimationsMutation.mutate()}
            className="bg-indigo-600 hover:bg-indigo-700 h-14"
          >
            Get AI Recommendations
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 h-14">
            Test Particle Effects
          </Button>
        </div>

        <AnimationLibrary />

        {showAchievement && (
          <AchievementUnlock
            achievement="Master of Animations"
            onComplete={() => setShowAchievement(false)}
          />
        )}

        {showSuggestion && (
          <AISuggestionPopup
            suggestion="Consider adding neural pulse animations to enhance consciousness visualizations"
            onDismiss={() => setShowSuggestion(false)}
          />
        )}
      </div>
    </div>
  );
}