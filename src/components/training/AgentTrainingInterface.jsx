import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Upload, Brain, TrendingUp, CheckCircle, AlertCircle, 
  Play, Pause, Settings, Download, BarChart 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AgentTrainingInterface() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [trainingFile, setTrainingFile] = useState(null);
  const [trainingParams, setTrainingParams] = useState({
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001
  });
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-training'],
    queryFn: () => base44.entities.Agent.list('-created_date', 50)
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['agent-kpis'],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 100)
  });

  const uploadDatasetMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: () => {
      toast.success('Dataset uploaded successfully!');
    }
  });

  const startTrainingMutation = useMutation({
    mutationFn: async ({ agentId, datasetUrl, params }) => {
      return base44.entities.AgentTrainingSession.create({
        agent_id: agentId,
        dataset_url: datasetUrl,
        training_parameters: params,
        status: 'in_progress',
        progress: 0,
        started_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training-sessions']);
      toast.success('Training started!');
    }
  });

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 20),
    refetchInterval: 5000
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setTrainingFile(file);
      await uploadDatasetMutation.mutateAsync(file);
    }
  };

  const handleStartTraining = async () => {
    if (!selectedAgent || !trainingFile) {
      toast.error('Please select an agent and upload a dataset');
      return;
    }

    const datasetUrl = await uploadDatasetMutation.mutateAsync(trainingFile);
    await startTrainingMutation.mutateAsync({
      agentId: selectedAgent.id,
      datasetUrl,
      params: trainingParams
    });
  };

  const getAgentPerformance = (agentId) => {
    const agentKpis = kpis.filter(k => k.agent_id === agentId);
    if (agentKpis.length === 0) return 0;
    const avgPerformance = agentKpis.reduce((sum, k) => sum + (k.performance_score || 0), 0) / agentKpis.length;
    return Math.round(avgPerformance);
  };

  const suggestedAgents = agents
    .map(agent => ({
      ...agent,
      performance: getAgentPerformance(agent.id)
    }))
    .filter(agent => agent.performance < 75)
    .sort((a, b) => a.performance - b.performance)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Agent Training Center</h2>
          <p className="text-white/60">Fine-tune your AI agents with custom datasets</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400">
          {trainingSessions.filter(s => s.status === 'in_progress').length} Training
        </Badge>
      </div>

      <Tabs defaultValue="train" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="train">New Training</TabsTrigger>
          <TabsTrigger value="progress">Training Progress</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="train" className="space-y-6 mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Select Agent</CardTitle>
              <CardDescription className="text-white/60">
                Choose an agent to train or fine-tune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map(agent => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedAgent?.id === agent.id
                        ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">{agent.agent_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Performance</span>
                      <Badge className={getAgentPerformance(agent.id) > 75 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {getAgentPerformance(agent.id)}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Training Dataset</CardTitle>
              <CardDescription className="text-white/60">
                CSV, JSON, or TXT files supported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="dataset-upload"
                  accept=".csv,.json,.txt"
                />
                <label htmlFor="dataset-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60 mb-1">
                    {trainingFile ? trainingFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-white/40">CSV, JSON, TXT (Max 50MB)</p>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Training Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Epochs</label>
                <Input
                  type="number"
                  value={trainingParams.epochs}
                  onChange={(e) => setTrainingParams({ ...trainingParams, epochs: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Batch Size</label>
                <Input
                  type="number"
                  value={trainingParams.batch_size}
                  onChange={(e) => setTrainingParams({ ...trainingParams, batch_size: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Learning Rate</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={trainingParams.learning_rate}
                  onChange={(e) => setTrainingParams({ ...trainingParams, learning_rate: parseFloat(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleStartTraining}
            disabled={!selectedAgent || !trainingFile || startTrainingMutation.isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-6 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Training
          </Button>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-6">
          {trainingSessions.map(session => (
            <Card key={session.id} className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Agent: {agents.find(a => a.id === session.agent_id)?.agent_name || 'Unknown'}
                  </CardTitle>
                  <Badge className={
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    session.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Progress</span>
                    <span className="text-white font-medium">{session.progress || 0}%</span>
                  </div>
                  <Progress value={session.progress || 0} className="h-2" />
                </div>
                <div className="text-xs text-white/40">
                  Started: {new Date(session.started_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
          {trainingSessions.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No training sessions yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4 mt-6">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                AI Training Suggestions
              </CardTitle>
              <CardDescription className="text-white/60">
                Agents that could benefit from retraining based on performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedAgents.map(agent => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{agent.agent_name}</span>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">
                      {agent.performance}% perf
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-3">
                    Low performance detected. Training recommended.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAgent(agent);
                      document.querySelector('[value="train"]').click();
                    }}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Train Now
                  </Button>
                </motion.div>
              ))}
              {suggestedAgents.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>All agents performing well!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}