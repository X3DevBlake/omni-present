import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Brain, Heart, Activity, TrendingUp, Palette, Target, Shield } from 'lucide-react';
import ConsciousnessMirrorVisualizer3D from '../components/consciousness/ConsciousnessMirrorVisualizer3D';
import BiometricHealthDashboard3D from '../components/biometric/BiometricHealthDashboard3D';
import CognitiveGoalSetter3D from '../components/consciousness/CognitiveGoalSetter3D';
import EthicalFrameworkEditor from '../components/consciousness/EthicalFrameworkEditor';
import AIGoalRecommendations3D from '../components/consciousness/AIGoalRecommendations3D';
import { Badge } from '@/components/ui/badge';

export default function ConsciousnessMirrorHub() {
  const queryClient = useQueryClient();
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const { data: consciousnessMirror = [] } = useQuery({
    queryKey: ['consciousness-mirror'],
    queryFn: () => base44.entities.ConsciousnessMirrorSnapshot.list('-created_date', 20),
    initialData: [],
    refetchInterval: refreshInterval
  });

  const { data: biometricData = [] } = useQuery({
    queryKey: ['biometric-streams'],
    queryFn: () => base44.entities.BiometricDataStream.list('-created_date', 10),
    initialData: [],
    refetchInterval: refreshInterval
  });

  const { data: uiAdaptations = [] } = useQuery({
    queryKey: ['ui-adaptations'],
    queryFn: () => base44.entities.DynamicUIAdaptation.list('-created_date', 10),
    initialData: []
  });

  const { data: neuralStrategies = [] } = useQuery({
    queryKey: ['neural-strategies'],
    queryFn: () => base44.entities.NeuralAugmentationStrategy.filter({ strategy_status: 'active' }),
    initialData: []
  });

  const { data: cognitiveGoals = [] } = useQuery({
    queryKey: ['cognitive-goals'],
    queryFn: () => base44.entities.CognitiveGoal.filter({ goal_status: 'active' }),
    initialData: []
  });

  const { data: ethicalFrameworks = [] } = useQuery({
    queryKey: ['ethical-frameworks'],
    queryFn: async () => {
      const response = await base44.functions.invoke('ethicalFrameworkGenerator', {
        action: 'get_frameworks'
      });
      return response.data.frameworks || [];
    },
    initialData: []
  });

  const captureConsciousnessMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('consciousnessMirrorEngine', {
        action: 'capture_consciousness'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consciousness-mirror'] });
    }
  });

  const captureBiometricsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('realTimeHealthMonitor', {
        action: 'capture_biometrics',
        augmentation_id: 'aug_001'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-streams'] });
    }
  });

  const adaptUIMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('dynamicUIAdapter', {
        action: 'adapt_ui'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-adaptations'] });
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const response = await base44.functions.invoke('cognitiveGoalOptimizer', {
        action: 'create_goal',
        goal_type: goalData.goalType,
        target_level: goalData.targetLevel,
        timeline_days: goalData.timeline
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cognitive-goals'] });
      toast.success('Cognitive goal created with AI recommendations!');
    }
  });

  const createFrameworkMutation = useMutation({
    mutationFn: async (frameworkData) => {
      const response = await base44.functions.invoke('ethicalFrameworkGenerator', {
        action: 'create_framework',
        framework_name: frameworkData.frameworkName,
        principles: frameworkData.principles,
        forbidden_actions: frameworkData.forbiddenActions
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ethical-frameworks'] });
      toast.success('Ethical framework created with AI enhancements!');
    }
  });

  const latestSnapshot = consciousnessMirror[0];
  const latestBiometric = biometricData[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Eye className="w-12 h-12 text-blue-400 animate-pulse" />
            Consciousness Mirror Hub
          </h1>
          <p className="text-white/60 text-lg">
            Real-time visualization of cognitive, emotional, and biometric states with AI-driven personalization
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-8 h-8 text-blue-400" />
                <Badge className="bg-blue-500/30 text-blue-300">LIVE</Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                {((latestSnapshot?.cognitive_state?.focus_level || 0.7) * 100).toFixed(0)}%
              </div>
              <div className="text-white/60 text-sm">Focus Level</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/30 text-purple-300">LIVE</Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                {latestSnapshot?.emotional_state?.primary_emotion || 'Calm'}
              </div>
              <div className="text-white/60 text-sm">Emotion</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-red-400" />
                <Badge className="bg-red-500/30 text-red-300">LIVE</Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                {latestBiometric?.vital_signs?.heart_rate_bpm?.toFixed(0) || 72} BPM
              </div>
              <div className="text-white/60 text-sm">Heart Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500/30 text-green-300">ACTIVE</Badge>
              </div>
              <div className="text-2xl font-bold text-white">
                {neuralStrategies.length}
              </div>
              <div className="text-white/60 text-sm">Strategies</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => captureConsciousnessMutation.mutate()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Capture Consciousness
          </Button>
          <Button 
            onClick={() => captureBiometricsMutation.mutate()}
            className="bg-red-600 hover:bg-red-700"
          >
            <Activity className="w-4 h-4 mr-2" />
            Capture Biometrics
          </Button>
          <Button 
            onClick={() => adaptUIMutation.mutate()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Palette className="w-4 h-4 mr-2" />
            Adapt UI
          </Button>
        </div>

        <Tabs defaultValue="mirror" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/60 border-blue-500/30">
            <TabsTrigger value="mirror">Mirror</TabsTrigger>
            <TabsTrigger value="biometric">Biometric</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="adaptations">UI</TabsTrigger>
          </TabsList>

          <TabsContent value="mirror" className="mt-6">
            <ConsciousnessMirrorVisualizer3D snapshots={consciousnessMirror} />
          </TabsContent>

          <TabsContent value="biometric" className="mt-6">
            <BiometricHealthDashboard3D biometricData={latestBiometric} />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CognitiveGoalSetter3D onCreateGoal={(data) => createGoalMutation.mutate(data)} />
              <AIGoalRecommendations3D
                recommendations={cognitiveGoals[0]?.ai_recommendations || []}
                onApply={(rec) => toast.success(`Applied: ${rec.recommendation}`)}
              />
            </div>

            <Card className="bg-black/40 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-white">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cognitiveGoals.map((goal, idx) => (
                    <div key={goal.id} className="bg-black/60 p-4 rounded-lg border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">{goal.goal_type.replace(/_/g, ' ').toUpperCase()}</span>
                        <Badge className={
                          goal.goal_status === 'achieved' ? 'bg-green-500/30 text-green-300' :
                          goal.goal_status === 'in_progress' ? 'bg-blue-500/30 text-blue-300' :
                          'bg-orange-500/30 text-orange-300'
                        }>
                          {goal.goal_status}
                        </Badge>
                      </div>
                      <div className="text-white/60 text-sm">
                        Timeline: {goal.timeline_days} days | 
                        Progress: {goal.progress_tracking?.length || 0} checkpoints
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ethics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EthicalFrameworkEditor onSave={(data) => createFrameworkMutation.mutate(data)} />

              <Card className="bg-black/40 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Your Ethical Frameworks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ethicalFrameworks.map((framework) => (
                      <div key={framework.id} className="bg-black/60 p-4 rounded-lg border border-green-500/30">
                        <div className="text-white font-bold mb-2">{framework.framework_name}</div>
                        <div className="text-white/60 text-xs mb-2">
                          {framework.core_principles?.length || 0} principles | 
                          {framework.forbidden_actions?.length || 0} forbidden actions
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/30 text-green-300">
                            Applied to {framework.applied_to_agents?.length || 0} agents
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="adaptations" className="mt-6">
            <Card className="bg-black/40 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Dynamic UI Adaptations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uiAdaptations.map((adaptation, idx) => (
                    <div key={adaptation.id || idx} className="bg-black/60 p-4 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">
                          {adaptation.detected_user_state?.cognitive_state} | {adaptation.detected_user_state?.emotional_state}
                        </span>
                        <Badge className="bg-purple-500/30 text-purple-300">
                          {(adaptation.adaptation_effectiveness * 100).toFixed(0)}% Effective
                        </Badge>
                      </div>
                      <div className="text-white/60 text-sm">
                        Color: {adaptation.ui_modifications?.color_scheme} | 
                        Animations: {adaptation.ui_modifications?.animation_intensity} | 
                        Density: {adaptation.ui_modifications?.information_density}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}