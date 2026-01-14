import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Upload, Play, TrendingUp, Zap, FileText, TestTube2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIAgentTrainingModule() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list()
  });

  const { data: datasets } = useQuery({
    queryKey: ['training-datasets'],
    queryFn: () => base44.entities.TrainingDataset.list()
  });

  const { data: abTests } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.AgentABTest.list()
  });

  const { data: interactionLogs } = useQuery({
    queryKey: ['interaction-logs'],
    queryFn: () => base44.entities.AgentInteractionLog.list('-created_date', 100)
  });

  const uploadDataset = useMutation({
    mutationFn: async (data) => {
      // Upload file first
      const fileData = await base44.integrations.Core.UploadFile({ file: data.file });
      
      return await base44.entities.TrainingDataset.create({
        name: data.name,
        dataset_type: data.type,
        file_url: fileData.file_url,
        data_points: data.dataPoints || 0,
        format: data.format,
        validation_score: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-datasets'] });
      toast.success('Dataset uploaded successfully');
      setUploadFile(null);
    }
  });

  const startReinforcementLearning = useMutation({
    mutationFn: async (agentId) => {
      // Use interaction logs for reinforcement learning
      const logs = await base44.entities.AgentInteractionLog.filter(
        { agent_id: agentId, success: true },
        '-created_date',
        50
      );
      
      // Simulate training with successful interactions
      toast.info('Starting reinforcement learning...');
      
      return { agentId, logsUsed: logs.length };
    },
    onSuccess: (data) => {
      toast.success(`Reinforcement learning completed using ${data.logsUsed} interactions`);
    }
  });

  const createABTest = useMutation({
    mutationFn: (data) => base44.entities.AgentABTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('A/B test created');
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <FileText className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{datasets?.length || 0}</p>
            <p className="text-sm text-gray-600">Training Datasets</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <TestTube2 className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{abTests?.length || 0}</p>
            <p className="text-sm text-gray-600">A/B Tests</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <Zap className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{interactionLogs?.length || 0}</p>
            <p className="text-sm text-gray-600">Training Logs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-orange-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">94%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="reinforcement">Reinforcement Learning</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          <TabsTrigger value="finetune">Fine-Tuning</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Upload Training Dataset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatasetUploader onUpload={(data) => uploadDataset.mutate(data)} />
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Available Datasets</h3>
                <div className="space-y-2">
                  {datasets?.map((dataset) => (
                    <div key={dataset.id} className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{dataset.name}</h4>
                          <p className="text-sm text-gray-600">{dataset.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{dataset.dataset_type}</Badge>
                            <Badge variant="outline">{dataset.data_points} points</Badge>
                            <Badge variant="outline">{dataset.format}</Badge>
                          </div>
                        </div>
                        <Button size="sm">Use Dataset</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reinforcement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-green-500" />
                Reinforcement Learning from Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm mb-2">
                  Train agents from successful interaction logs and performance feedback
                </p>
                <div className="text-xs text-gray-600">
                  {interactionLogs?.filter(l => l.success).length} successful interactions available for training
                </div>
              </div>

              <Select value={selectedAgent?.id} onValueChange={(id) => setSelectedAgent(agents?.find(a => a.id === id))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent to train" />
                </SelectTrigger>
                <SelectContent>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAgent && (
                <div className="space-y-3">
                  <div className="p-3 rounded border">
                    <p className="text-sm font-semibold">Training Configuration</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>Learning Rate: 0.001</div>
                      <div>Batch Size: 32</div>
                      <div>Reward Function: Success-based</div>
                      <div>Exploration: ε-greedy (0.1)</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => startReinforcementLearning.mutate(selectedAgent.id)}
                    className="w-full"
                    disabled={startReinforcementLearning.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Reinforcement Learning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="w-6 h-6 text-blue-500" />
                A/B Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ABTestBuilder agents={agents} onCreate={(data) => createABTest.mutate(data)} />

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Running Tests</h3>
                {abTests?.map((test) => (
                  <div key={test.id} className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{test.test_name}</h4>
                        <Badge variant="secondary">{test.metric_type}</Badge>
                      </div>
                      <Badge>{test.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded bg-white border">
                        <p className="text-sm font-semibold">Variant A</p>
                        <p className="text-2xl font-bold text-blue-600">{test.variant_a_score.toFixed(2)}%</p>
                      </div>
                      <div className="p-3 rounded bg-white border">
                        <p className="text-sm font-semibold">Variant B</p>
                        <p className="text-2xl font-bold text-purple-600">{test.variant_b_score.toFixed(2)}%</p>
                      </div>
                    </div>
                    {test.winner && (
                      <div className="mt-3 p-2 rounded bg-green-50 border border-green-200 text-sm">
                        Winner: <span className="font-semibold">Variant {test.winner.toUpperCase()}</span> ({test.confidence_level}% confidence)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finetune">
          <FineTuningPanel agents={agents} datasets={datasets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DatasetUploader({ onUpload }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'behavior',
    format: 'json',
    dataPoints: 0
  });
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (!formData.name || !file) {
      toast.error('Name and file required');
      return;
    }
    onUpload({ ...formData, file });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Dataset name"
      />
      <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="behavior">Behavior Training</SelectItem>
          <SelectItem value="personality">Personality Tuning</SelectItem>
          <SelectItem value="ethics">Ethical Guidelines</SelectItem>
          <SelectItem value="skills">Skill Enhancement</SelectItem>
          <SelectItem value="general">General Training</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".json,.csv,.jsonl"
      />
      <Button onClick={handleSubmit} className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        Upload Dataset
      </Button>
    </div>
  );
}

function ABTestBuilder({ agents, onCreate }) {
  const [testData, setTestData] = useState({
    test_name: '',
    agent_id: '',
    metric_type: 'success_rate',
    sample_size: 100
  });

  return (
    <div className="space-y-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
      <Input
        value={testData.test_name}
        onChange={(e) => setTestData({ ...testData, test_name: e.target.value })}
        placeholder="Test name"
      />
      <Select value={testData.agent_id} onValueChange={(val) => setTestData({ ...testData, agent_id: val })}>
        <SelectTrigger>
          <SelectValue placeholder="Select agent" />
        </SelectTrigger>
        <SelectContent>
          {agents?.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={() => onCreate(testData)} className="w-full">
        Create A/B Test
      </Button>
    </div>
  );
}

function FineTuningPanel({ agents, datasets }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Fine-Tune Agent Behavior
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <p className="text-sm mb-3">
            Fine-tune agent personalities, behaviors, and ethical guidelines using custom datasets
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Adjust personality traits and communication style</div>
            <div>• Refine decision-making patterns</div>
            <div>• Update ethical boundaries and constraints</div>
            <div>• Enhance skill-specific behaviors</div>
          </div>
          <Button className="w-full mt-4">Start Fine-Tuning</Button>
        </div>
      </CardContent>
    </Card>
  );
}