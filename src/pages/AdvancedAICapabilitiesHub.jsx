import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Brain, Network, Zap, Shield, Wrench } from 'lucide-react';
import GenerativeStudio3D from '../components/ai/GenerativeStudio3D';
import NeuroSymbolic3D from '../components/ai/NeuroSymbolic3D';
import MetaLearner3D from '../components/ai/MetaLearner3D';
import SkillAcquisition3D from '../components/ai/SkillAcquisition3D';
import SelfHealing3D from '../components/ai/SelfHealing3D';
import FeatureEngineering3D from '../components/ai/FeatureEngineering3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function AdvancedAICapabilitiesHub() {
  const queryClient = useQueryClient();

  // Queries
  const { data: generativeModels } = useQuery({
    queryKey: ['generative-models'],
    queryFn: () => base44.entities.GenerativeAIModel.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: neuroSymbolicModels } = useQuery({
    queryKey: ['neuro-symbolic'],
    queryFn: () => base44.entities.NeuroSymbolicModel.list('-created_date', 10)
  });

  const { data: metaLearners } = useQuery({
    queryKey: ['meta-learners'],
    queryFn: () => base44.entities.MetaLearningAgent.list('-created_date', 10)
  });

  const { data: skillAcquisitions } = useQuery({
    queryKey: ['skill-acquisitions'],
    queryFn: () => base44.entities.AgentSkillAcquisition.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: healingAgents } = useQuery({
    queryKey: ['healing-agents'],
    queryFn: () => base44.entities.SelfHealingAgent.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: featurePipelines } = useQuery({
    queryKey: ['feature-pipelines'],
    queryFn: () => base44.entities.FeatureEngineering.list('-created_date', 10)
  });

  // Mutations
  const trainGenerative = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('trainGenerativeModel', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generative-models'] });
      toast.success('Generative model training started!');
    }
  });

  const buildNeuroSymbolic = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('buildNeuroSymbolic', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neuro-symbolic'] });
      toast.success('Neuro-symbolic model created!');
    }
  });

  const trainMetaLearner = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('trainMetaLearner', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-learners'] });
      toast.success('Meta-learner training started!');
    }
  });

  const startSkillLearning = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('autonomous-skill-learning', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-acquisitions'] });
      toast.success('Autonomous skill learning initiated!');
    }
  });

  const enableSelfHealing = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('self-healing-agent', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healing-agents'] });
      toast.success('Self-healing enabled!');
    }
  });

  const runFeatureEngineering = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('autoFeatureEngineering', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-pipelines'] });
      toast.success('Feature engineering pipeline created!');
    }
  });

  // Form states
  const [generativeForm, setGenerativeForm] = useState({
    model_name: '',
    architecture: 'stable_diffusion',
    generation_type: 'text_to_image',
    training_config: { steps: 50, guidance_scale: 7.5 }
  });

  const [neuroSymbolicForm, setNeuroSymbolicForm] = useState({
    model_name: '',
    neural_arch: 'transformer',
    symbolic_engine: 'first_order_logic',
    integration: 'hybrid_architecture'
  });

  const [metaLearnerForm, setMetaLearnerForm] = useState({
    agent_name: '',
    algorithm: 'MAML',
    num_tasks: 100
  });

  const [skillForm, setSkillForm] = useState({
    agent_id: 'agent_001',
    skill_name: '',
    method: 'self_supervised'
  });

  const [healingForm, setHealingForm] = useState({
    agent_id: 'agent_001',
    enable_diagnostics: true,
    enable_auto_recovery: true
  });

  const [featureForm, setFeatureForm] = useState({
    pipeline_name: '',
    dataset_id: 'dataset_001',
    automation_level: 'ai_powered',
    discovery_method: 'deep_learning'
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Brain className="w-12 h-12 text-purple-400" />
            Advanced AI Capabilities Hub
          </h1>
          <p className="text-xl text-white/70">
            Generative AI, Neuro-Symbolic Systems, Meta-Learning, Autonomous Skills & Self-Healing
          </p>
        </div>

        <Tabs defaultValue="generative" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-black/30 p-1">
            <TabsTrigger value="generative" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generative AI
            </TabsTrigger>
            <TabsTrigger value="neurosymbolic" className="data-[state=active]:bg-pink-600">
              <Network className="w-4 h-4 mr-2" />
              Neuro-Symbolic
            </TabsTrigger>
            <TabsTrigger value="metalearning" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              Meta-Learning
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-cyan-600">
              <Zap className="w-4 h-4 mr-2" />
              Skill Learning
            </TabsTrigger>
            <TabsTrigger value="healing" className="data-[state=active]:bg-green-600">
              <Shield className="w-4 h-4 mr-2" />
              Self-Healing
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-orange-600">
              <Wrench className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generative" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Train Generative AI Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Model name"
                  value={generativeForm.model_name}
                  onChange={(e) => setGenerativeForm({...generativeForm, model_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={generativeForm.architecture} onValueChange={(v) => setGenerativeForm({...generativeForm, architecture: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable_diffusion">Stable Diffusion</SelectItem>
                    <SelectItem value="dalle">DALL-E</SelectItem>
                    <SelectItem value="stylegan">StyleGAN</SelectItem>
                    <SelectItem value="vae">VAE</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={generativeForm.generation_type} onValueChange={(v) => setGenerativeForm({...generativeForm, generation_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text_to_image">Text to Image</SelectItem>
                    <SelectItem value="image_to_image">Image to Image</SelectItem>
                    <SelectItem value="text_to_video">Text to Video</SelectItem>
                    <SelectItem value="audio_generation">Audio Generation</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => trainGenerative.mutate(generativeForm)}
                  disabled={trainGenerative.isPending || !generativeForm.model_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Train Generative Model
                </Button>
              </CardContent>
            </Card>

            {generativeModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <GenerativeStudio3D model={generativeModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="neurosymbolic" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Build Neuro-Symbolic System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Model name"
                  value={neuroSymbolicForm.model_name}
                  onChange={(e) => setNeuroSymbolicForm({...neuroSymbolicForm, model_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={neuroSymbolicForm.neural_arch} onValueChange={(v) => setNeuroSymbolicForm({...neuroSymbolicForm, neural_arch: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transformer">Transformer</SelectItem>
                    <SelectItem value="cnn">CNN</SelectItem>
                    <SelectItem value="graph_neural_net">Graph Neural Net</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={neuroSymbolicForm.symbolic_engine} onValueChange={(v) => setNeuroSymbolicForm({...neuroSymbolicForm, symbolic_engine: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_order_logic">First-Order Logic</SelectItem>
                    <SelectItem value="description_logic">Description Logic</SelectItem>
                    <SelectItem value="temporal_logic">Temporal Logic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => buildNeuroSymbolic.mutate(neuroSymbolicForm)}
                  disabled={buildNeuroSymbolic.isPending || !neuroSymbolicForm.model_name}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Build Neuro-Symbolic Model
                </Button>
              </CardContent>
            </Card>

            {neuroSymbolicModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <NeuroSymbolic3D model={neuroSymbolicModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metalearning" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Train Meta-Learning Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Agent name"
                  value={metaLearnerForm.agent_name}
                  onChange={(e) => setMetaLearnerForm({...metaLearnerForm, agent_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={metaLearnerForm.algorithm} onValueChange={(v) => setMetaLearnerForm({...metaLearnerForm, algorithm: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAML">MAML (Model-Agnostic Meta-Learning)</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="ProtoNet">Prototypical Networks</SelectItem>
                    <SelectItem value="MatchingNet">Matching Networks</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Number of tasks"
                  value={metaLearnerForm.num_tasks}
                  onChange={(e) => setMetaLearnerForm({...metaLearnerForm, num_tasks: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => trainMetaLearner.mutate(metaLearnerForm)}
                  disabled={trainMetaLearner.isPending || !metaLearnerForm.agent_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Train Meta-Learner
                </Button>
              </CardContent>
            </Card>

            {metaLearners?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MetaLearner3D agent={metaLearners[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Autonomous Skill Acquisition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Agent ID"
                  value={skillForm.agent_id}
                  onChange={(e) => setSkillForm({...skillForm, agent_id: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Skill name"
                  value={skillForm.skill_name}
                  onChange={(e) => setSkillForm({...skillForm, skill_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={skillForm.method} onValueChange={(v) => setSkillForm({...skillForm, method: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_supervised">Self-Supervised</SelectItem>
                    <SelectItem value="curriculum_learning">Curriculum Learning</SelectItem>
                    <SelectItem value="imitation_learning">Imitation Learning</SelectItem>
                    <SelectItem value="reinforcement_learning">Reinforcement Learning</SelectItem>
                    <SelectItem value="meta_learning">Meta-Learning</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => startSkillLearning.mutate(skillForm)}
                  disabled={startSkillLearning.isPending || !skillForm.skill_name}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Start Skill Learning
                </Button>
              </CardContent>
            </Card>

            {skillAcquisitions?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SkillAcquisition3D skillData={skillAcquisitions[0]} />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillAcquisitions?.map((skill) => (
                <Card key={skill.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {skill.autonomous_discovery && <span>🤖</span>}
                      {skill.skill_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Method:</span>
                        <span className="text-white">{skill.acquisition_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status:</span>
                        <span className={skill.learning_status === 'mastered' ? 'text-green-400' : 'text-yellow-400'}>
                          {skill.learning_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Proficiency:</span>
                        <span className="text-cyan-400">{skill.proficiency_level.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${skill.proficiency_level}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="healing" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Enable Self-Healing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Agent ID"
                  value={healingForm.agent_id}
                  onChange={(e) => setHealingForm({...healingForm, agent_id: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => enableSelfHealing.mutate(healingForm)}
                  disabled={enableSelfHealing.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Enable Self-Healing
                </Button>
              </CardContent>
            </Card>

            {healingAgents?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SelfHealing3D agent={healingAgents[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Automated Feature Engineering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Pipeline name"
                  value={featureForm.pipeline_name}
                  onChange={(e) => setFeatureForm({...featureForm, pipeline_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={featureForm.discovery_method} onValueChange={(v) => setFeatureForm({...featureForm, discovery_method: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep_learning">Deep Learning</SelectItem>
                    <SelectItem value="genetic_programming">Genetic Programming</SelectItem>
                    <SelectItem value="symbolic_regression">Symbolic Regression</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => runFeatureEngineering.mutate(featureForm)}
                  disabled={runFeatureEngineering.isPending || !featureForm.pipeline_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                >
                  Run Feature Engineering
                </Button>
              </CardContent>
            </Card>

            {featurePipelines?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <FeatureEngineering3D pipeline={featurePipelines[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}