import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Eye, Zap, Minimize2 } from 'lucide-react';
import NeuroSymbolic3D from '../components/neurosymbolic/NeuroSymbolic3D';
import Attention3D from '../components/attention/Attention3D';
import EnergyBased3D from '../components/energy/EnergyBased3D';
import Distillation3D from '../components/distillation/Distillation3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function HybridMLHub() {
  const queryClient = useQueryClient();

  const { data: neuroSymbolic } = useQuery({
    queryKey: ['neurosymbolic-systems'],
    queryFn: () => base44.entities.NeuroSymbolicSystem.list('-created_date', 5)
  });

  const { data: attentionMechs } = useQuery({
    queryKey: ['attention-mechanisms'],
    queryFn: () => base44.entities.AttentionMechanism.list('-created_date', 5)
  });

  const { data: energyModels } = useQuery({
    queryKey: ['energy-models'],
    queryFn: () => base44.entities.EnergyBasedModel.list('-created_date', 5)
  });

  const { data: distillations } = useQuery({
    queryKey: ['distillations'],
    queryFn: () => base44.entities.ModelDistillation.list('-created_date', 5)
  });

  const buildNS = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildNeuroSymbolic', {
        system_name: 'Hybrid_Reasoner',
        integration_method: 'tight_coupling'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['neurosymbolic-systems'] })
  });

  const analyzeAttention = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyzeAttention', {
        mechanism_name: 'Transformer_Attention',
        attention_type: 'multi_head',
        num_heads: 12
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attention-mechanisms'] })
  });

  const trainEnergy = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainEnergyModel', {
        model_name: 'EBM_v1',
        training_method: 'score_matching'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['energy-models'] })
  });

  const distillModel = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('distillModel', {
        distillation_name: 'GPT_Compression',
        teacher_model: 'GPT-4',
        compression_target: 10
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['distillations'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hybrid ML Systems</h1>
          <p className="text-white/70">Neuro-symbolic, attention, energy models & distillation</p>
        </div>

        <Tabs defaultValue="neurosymbolic" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="neurosymbolic">Neuro-Symbolic</TabsTrigger>
            <TabsTrigger value="attention">Attention</TabsTrigger>
            <TabsTrigger value="energy">Energy Models</TabsTrigger>
            <TabsTrigger value="distillation">Distillation</TabsTrigger>
          </TabsList>

          <TabsContent value="neurosymbolic" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Hybrid Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => buildNS.mutate()}
                  disabled={buildNS.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Build Neuro-Symbolic System
                </Button>
              </CardContent>
            </Card>

            {neuroSymbolic?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <NeuroSymbolic3D system={neuroSymbolic[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attention" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Attention Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => analyzeAttention.mutate()}
                  disabled={analyzeAttention.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Analyze Attention Patterns
                </Button>
              </CardContent>
            </Card>

            {attentionMechs?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Attention3D mechanism={attentionMechs[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="energy" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Energy Landscapes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainEnergy.mutate()}
                  disabled={trainEnergy.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Train Energy-Based Model
                </Button>
              </CardContent>
            </Card>

            {energyModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <EnergyBased3D model={energyModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="distillation" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Minimize2 className="w-5 h-5" />
                  Model Compression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => distillModel.mutate()}
                  disabled={distillModel.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Distill Model
                </Button>
              </CardContent>
            </Card>

            {distillations?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Distillation3D distillation={distillations[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}