import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, TrendingUp, Shield } from 'lucide-react';
import MetaLearning3D from '../components/metalearning/MetaLearning3D';
import Explainability3D from '../components/explainability/Explainability3D';
import TransferLearning3D from '../components/transfer/TransferLearning3D';
import AISafety3D from '../components/safety/AISafety3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function MetaLearningHub() {
  const queryClient = useQueryClient();
  const [modelName, setModelName] = useState('');

  const { data: metaModels } = useQuery({
    queryKey: ['meta-learning-models'],
    queryFn: () => base44.entities.MetaLearningModel.list('-created_date', 5)
  });

  const { data: explanations } = useQuery({
    queryKey: ['explainability-reports'],
    queryFn: () => base44.entities.ExplainabilityReport.list('-created_date', 5)
  });

  const { data: transfers } = useQuery({
    queryKey: ['transfer-tasks'],
    queryFn: () => base44.entities.TransferLearningTask.list('-created_date', 5)
  });

  const { data: safetyChecks } = useQuery({
    queryKey: ['safety-checks'],
    queryFn: () => base44.entities.AISafetyCheck.list('-created_date', 5)
  });

  const trainMeta = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainMetaLearner', {
        model_name: modelName || 'MAML_v1',
        base_architecture: 'MAML',
        task_domain: 'computer_vision',
        num_tasks: 100
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-learning-models'] });
      setModelName('');
    }
  });

  const generateExplanation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateExplanation', {
        model_id: 'classifier_v1',
        prediction: { class: 'positive', confidence: 0.92 },
        input_features: { feature1: 0.5, feature2: 0.8 }
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['explainability-reports'] })
  });

  const startTransfer = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateTransferLearning', {
        task_name: 'ImageNet_to_MedicalImaging',
        source_domain: 'ImageNet',
        target_domain: 'Medical Imaging',
        pretrained_model: 'ResNet50'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfer-tasks'] })
  });

  const runSafety = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runSafetyAudit', {
        model_id: 'production_model_v1',
        test_suite: 'comprehensive'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['safety-checks'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced AI Systems</h1>
          <p className="text-white/70">Meta-learning, explainability, transfer learning & safety</p>
        </div>

        <Tabs defaultValue="meta" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="meta">Meta-Learning</TabsTrigger>
            <TabsTrigger value="explain">Explainability</TabsTrigger>
            <TabsTrigger value="transfer">Transfer Learning</TabsTrigger>
            <TabsTrigger value="safety">AI Safety</TabsTrigger>
          </TabsList>

          <TabsContent value="meta" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Few-Shot Meta-Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Model name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={() => trainMeta.mutate()}
                  disabled={trainMeta.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Train Meta-Learner
                </Button>
              </CardContent>
            </Card>

            {metaModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MetaLearning3D model={metaModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="explain" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Model Interpretability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateExplanation.mutate()}
                  disabled={generateExplanation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Generate Explanation
                </Button>
              </CardContent>
            </Card>

            {explanations?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Explainability3D report={explanations[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transfer" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Knowledge Transfer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startTransfer.mutate()}
                  disabled={startTransfer.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Initiate Transfer Learning
                </Button>
              </CardContent>
            </Card>

            {transfers?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <TransferLearning3D task={transfers[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety & Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runSafety.mutate()}
                  disabled={runSafety.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Run Safety Audit
                </Button>
              </CardContent>
            </Card>

            {safetyChecks?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AISafety3D safetyCheck={safetyChecks[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}