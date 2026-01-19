import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Play, Settings, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentTrainingStudio3D from '../components/training/AgentTrainingStudio3D';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function AgentTrainingStudio() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [trainingType, setTrainingType] = useState('fine_tuning');
  const [learningRate, setLearningRate] = useState('0.001');
  const [batchSize, setBatchSize] = useState('32');
  const [epochs, setEpochs] = useState('100');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => base44.entities.TrainingDataset.list(),
  });

  const { data: sessions } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 20),
  });

  const [currentSession, setCurrentSession] = useState(null);

  const startTraining = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('trainAgentModel', params);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      // Fetch the created session
      base44.entities.AgentTrainingSession.filter({ id: data.session_id }).then(sessions => {
        setCurrentSession(sessions[0]);
      });
    },
  });

  const optimizeHyperparameters = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('optimizeHyperparameters', params);
      return response.data;
    },
    onSuccess: (data) => {
      // Apply best config
      setLearningRate(data.best_config.learning_rate.toString());
      setBatchSize(data.best_config.batch_size.toString());
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Agent Training Studio
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Fine-tune agents with custom datasets and automated hyperparameter optimization
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Training Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Select Agent</label>
                <Select value={selectedAgent?.id || ''} onValueChange={(id) => {
                  const agent = agents?.find(a => a.id === id);
                  setSelectedAgent(agent);
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose agent to train..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Training Type</label>
                <Select value={trainingType} onValueChange={setTrainingType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fine_tuning">Fine Tuning</SelectItem>
                    <SelectItem value="reinforcement_learning">Reinforcement Learning</SelectItem>
                    <SelectItem value="supervised">Supervised Learning</SelectItem>
                    <SelectItem value="transfer_learning">Transfer Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white text-sm mb-2 block">Learning Rate</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Batch Size</label>
                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Epochs</label>
                  <Input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedAgent) {
                      optimizeHyperparameters.mutate({
                        agent_id: selectedAgent.id,
                        dataset_id: datasets?.[0]?.id,
                        optimization_budget: 10,
                      });
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-purple-500 text-purple-300"
                  disabled={!selectedAgent || optimizeHyperparameters.isPending}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Optimize
                </Button>

                <Button
                  onClick={() => {
                    if (selectedAgent) {
                      startTraining.mutate({
                        agent_id: selectedAgent.id,
                        training_type: trainingType,
                        dataset_id: datasets?.[0]?.id,
                        hyperparameters: {
                          learning_rate: parseFloat(learningRate),
                          batch_size: parseInt(batchSize),
                          epochs: parseInt(epochs),
                          optimizer: 'adam',
                        },
                      });
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!selectedAgent || startTraining.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              </div>

              {optimizeHyperparameters.data && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-bold mb-2">Optimization Complete</h4>
                  <p className="text-white/70 text-sm">
                    Best accuracy: {optimizeHyperparameters.data.best_accuracy.toFixed(1)}%
                  </p>
                  <p className="text-white/60 text-xs">
                    Tested {optimizeHyperparameters.data.optimization_runs} configurations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Training Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentTrainingStudio3D sessionData={currentSession} />
            </CardContent>
          </Card>
        </div>

        {currentSession?.convergence_data && (
          <Card className="bg-black/40 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Convergence Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentSession.convergence_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="epoch" stroke="#fff" />
                  <YAxis yAxisId="left" stroke="#fff" />
                  <YAxis yAxisId="right" orientation="right" stroke="#fff" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#00ff88" strokeWidth={2} name="Accuracy" />
                  <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#ff8800" strokeWidth={2} name="Loss" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions?.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{session.training_type}</Badge>
                    <Badge className={`${
                      session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                      session.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    } border-0`}>
                      {session.status}
                    </Badge>
                  </div>

                  <p className="text-white/70 text-sm mb-2">
                    Agent: {session.agent_id?.slice(0, 8)}
                  </p>

                  {session.status === 'completed' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Accuracy</div>
                        <div className="text-green-400 font-bold">{session.best_accuracy?.toFixed(1)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Loss</div>
                        <div className="text-white font-bold">{session.current_loss?.toFixed(3)}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Version</div>
                        <div className="text-cyan-400 font-bold text-xs">{session.model_version?.slice(0, 8)}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}