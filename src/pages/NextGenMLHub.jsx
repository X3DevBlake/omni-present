import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Sparkles, Search, TrendingUp } from 'lucide-react';
import RLHF3D from '../components/rlhf/RLHF3D';
import Diffusion3D from '../components/diffusion/Diffusion3D';
import ActiveLearning3D from '../components/active/ActiveLearning3D';
import Bayesian3D from '../components/bayesian/Bayesian3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function NextGenMLHub() {
  const queryClient = useQueryClient();

  const { data: rlhfSessions } = useQuery({
    queryKey: ['rlhf-sessions'],
    queryFn: () => base44.entities.RLHFSession.list('-created_date', 5)
  });

  const { data: diffusionModels } = useQuery({
    queryKey: ['diffusion-models'],
    queryFn: () => base44.entities.DiffusionModel.list('-created_date', 5)
  });

  const { data: activeLearners } = useQuery({
    queryKey: ['active-learners'],
    queryFn: () => base44.entities.ActiveLearner.list('-created_date', 5)
  });

  const { data: bayesianModels } = useQuery({
    queryKey: ['bayesian-models'],
    queryFn: () => base44.entities.BayesianModel.list('-created_date', 5)
  });

  const trainRLHF = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainRLHF', {
        session_name: 'Alignment_v1',
        base_model: 'GPT-4',
        num_feedback: 5000
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rlhf-sessions'] })
  });

  const trainDiffusion = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainDiffusionModel', {
        model_name: 'ImageGen_v1',
        diffusion_type: 'LatentDiffusion',
        conditioning: 'text'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diffusion-models'] })
  });

  const runActive = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runActiveLearning', {
        learner_name: 'Active_Learner_v1',
        query_strategy: 'uncertainty',
        budget: 1000
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['active-learners'] })
  });

  const trainBayesian = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainBayesianModel', {
        model_name: 'Bayesian_NN',
        inference_method: 'VI',
        uncertainty_type: 'epistemic'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bayesian-models'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Next-Gen ML Hub</h1>
          <p className="text-white/70">RLHF, diffusion, active learning & Bayesian AI</p>
        </div>

        <Tabs defaultValue="rlhf" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="rlhf">RLHF</TabsTrigger>
            <TabsTrigger value="diffusion">Diffusion</TabsTrigger>
            <TabsTrigger value="active">Active Learning</TabsTrigger>
            <TabsTrigger value="bayesian">Bayesian</TabsTrigger>
          </TabsList>

          <TabsContent value="rlhf" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Human Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainRLHF.mutate()}
                  disabled={trainRLHF.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Train with Human Feedback
                </Button>
              </CardContent>
            </Card>

            {rlhfSessions?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <RLHF3D session={rlhfSessions[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="diffusion" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generative Diffusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainDiffusion.mutate()}
                  disabled={trainDiffusion.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Train Diffusion Model
                </Button>
              </CardContent>
            </Card>

            {diffusionModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Diffusion3D model={diffusionModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Smart Data Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runActive.mutate()}
                  disabled={runActive.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Run Active Learning
                </Button>
              </CardContent>
            </Card>

            {activeLearners?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ActiveLearning3D learner={activeLearners[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bayesian" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Uncertainty Quantification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainBayesian.mutate()}
                  disabled={trainBayesian.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Train Bayesian Model
                </Button>
              </CardContent>
            </Card>

            {bayesianModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Bayesian3D model={bayesianModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}