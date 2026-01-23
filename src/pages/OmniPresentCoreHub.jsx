import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Network, Zap, Target } from 'lucide-react';
import OmniPresentSentientCore3D from '../components/sentient/OmniPresentSentientCore3D';
import PersonalizationEngine3D from '../components/sentient/PersonalizationEngine3D';
import EmergentBehaviorAnalyzer3D from '../components/collaboration/EmergentBehaviorAnalyzer3D';
import { toast } from 'sonner';

export default function OmniPresentCoreHub() {
  const queryClient = useQueryClient();

  const { data: emergentBehaviors = [] } = useQuery({
    queryKey: ['emergent-behaviors-core'],
    queryFn: () => base44.entities.EmergentBehavior.list('-created_date', 20),
    initialData: []
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => base44.entities.LearnedPreferences.list('-created_date', 15),
    initialData: []
  });

  const analyzeBehaviorMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omniPresentCore', {
        action: 'analyze_user_behavior',
        user_id: 'current_user',
        timeframe_days: 7
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Behavior analysis complete!');
    }
  });

  const personalizeExperienceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omniPresentCore', {
        action: 'personalize_experience',
        user_id: 'current_user',
        current_context: 'developer_ecosystem'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Experience personalized!');
    }
  });

  const analyzeEmergentMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omniPresentCore', {
        action: 'analyze_emergent_behavior',
        system_snapshot: { timestamp: Date.now() }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergent-behaviors-core'] });
      toast.success('Emergent behavior analyzed!');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-fuchsia-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Brain className="w-12 h-12 text-fuchsia-400 animate-pulse" />
            Omni-Present Core Intelligence Hub
          </h1>
          <p className="text-white/60 text-lg">
            AI-driven personalization, predictive analytics, autonomous management, and emergent intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/50">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-fuchsia-400 mb-2" />
              <div className="text-3xl font-bold text-white">9.5</div>
              <div className="text-white/60 text-sm">Intelligence</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white">{preferences.length}</div>
              <div className="text-white/60 text-sm">Preferences</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">{emergentBehaviors.length}</div>
              <div className="text-white/60 text-sm">Emergent</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Network className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">96%</div>
              <div className="text-white/60 text-sm">Coherence</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-white/60 text-sm">Potential</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => analyzeBehaviorMutation.mutate()}
            disabled={analyzeBehaviorMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700 h-14"
          >
            Analyze User Behavior
          </Button>
          <Button
            onClick={() => personalizeExperienceMutation.mutate()}
            disabled={personalizeExperienceMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 h-14"
          >
            Personalize Experience
          </Button>
          <Button
            onClick={() => analyzeEmergentMutation.mutate()}
            disabled={analyzeEmergentMutation.isPending}
            className="bg-pink-600 hover:bg-pink-700 h-14"
          >
            Detect Emergent Patterns
          </Button>
        </div>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border-fuchsia-500/30">
            <TabsTrigger value="core">Sentient Core</TabsTrigger>
            <TabsTrigger value="personalization">Personalization</TabsTrigger>
            <TabsTrigger value="emergent">Emergent Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="mt-6">
            <OmniPresentSentientCore3D
              coreStatus={{
                intelligence_level: 9.5,
                consciousness_coherence: 0.96,
                autonomy_score: 0.91
              }}
            />
          </TabsContent>

          <TabsContent value="personalization" className="mt-6">
            <PersonalizationEngine3D userPreferences={preferences} />
          </TabsContent>

          <TabsContent value="emergent" className="mt-6">
            <EmergentBehaviorAnalyzer3D behaviors={emergentBehaviors} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}