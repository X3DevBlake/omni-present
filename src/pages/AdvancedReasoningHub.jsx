import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Brain, Sparkles, Database } from 'lucide-react';
import FewShot3D from '../components/fewshot/FewShot3D';
import ChainOfThought3D from '../components/cot/ChainOfThought3D';
import MixtureOfExperts3D from '../components/moe/MixtureOfExperts3D';
import RAG3D from '../components/rag/RAG3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AdvancedReasoningHub() {
  const queryClient = useQueryClient();

  const { data: fewShotLearners } = useQuery({
    queryKey: ['fewshot-learners'],
    queryFn: () => base44.entities.FewShotLearner.list('-created_date', 5)
  });

  const { data: cotReasoning } = useQuery({
    queryKey: ['cot-reasoning'],
    queryFn: () => base44.entities.ChainOfThought.list('-created_date', 5)
  });

  const { data: moeModels } = useQuery({
    queryKey: ['moe-models'],
    queryFn: () => base44.entities.MixtureOfExperts.list('-created_date', 5)
  });

  const { data: ragSystems } = useQuery({
    queryKey: ['rag-systems'],
    queryFn: () => base44.entities.RAGSystem.list('-created_date', 5)
  });

  const trainFewShot = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainFewShot', {
        learner_name: 'MAML_Learner',
        algorithm: 'MAML',
        k_shot: 5,
        n_way: 5
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fewshot-learners'] })
  });

  const reasonCoT = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('reasonWithCoT', {
        reasoning_name: 'Math_Reasoner',
        strategy: 'self_consistency',
        problem: 'complex_math'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cot-reasoning'] })
  });

  const trainMoE = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainMoE', {
        model_name: 'Expert_Network',
        num_experts: 8,
        top_k: 2
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moe-models'] })
  });

  const buildRAG = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildRAG', {
        system_name: 'Knowledge_RAG',
        retrieval_method: 'hybrid',
        kb_size: 10000
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rag-systems'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Reasoning Hub</h1>
          <p className="text-white/70">Few-shot, CoT, MoE & RAG systems</p>
        </div>

        <Tabs defaultValue="fewshot" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="fewshot">Few-Shot</TabsTrigger>
            <TabsTrigger value="cot">Chain-of-Thought</TabsTrigger>
            <TabsTrigger value="moe">MoE</TabsTrigger>
            <TabsTrigger value="rag">RAG</TabsTrigger>
          </TabsList>

          <TabsContent value="fewshot" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Rapid Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainFewShot.mutate()}
                  disabled={trainFewShot.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Train Few-Shot Learner
                </Button>
              </CardContent>
            </Card>

            {fewShotLearners?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <FewShot3D learner={fewShotLearners[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cot" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Step-by-Step Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => reasonCoT.mutate()}
                  disabled={reasonCoT.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Generate CoT Reasoning
                </Button>
              </CardContent>
            </Card>

            {cotReasoning?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ChainOfThought3D reasoning={cotReasoning[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="moe" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Sparse Experts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainMoE.mutate()}
                  disabled={trainMoE.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Train MoE Model
                </Button>
              </CardContent>
            </Card>

            {moeModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MixtureOfExperts3D moe={moeModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rag" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Grounded Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => buildRAG.mutate()}
                  disabled={buildRAG.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Build RAG System
                </Button>
              </CardContent>
            </Card>

            {ragSystems?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <RAG3D rag={ragSystems[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}