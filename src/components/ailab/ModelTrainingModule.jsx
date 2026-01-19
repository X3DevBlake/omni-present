import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play, Pause, Save, Upload, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function ModelTrainingModule() {
  const queryClient = useQueryClient();
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState('classification');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [epochs, setEpochs] = useState([10]);
  const [learningRate, setLearningRate] = useState([0.001]);
  const [batchSize, setBatchSize] = useState([32]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const { data: datasets } = useQuery({
    queryKey: ['training-datasets'],
    queryFn: async () => {
      const datasets = await base44.entities.TrainingDataset.list();
      return datasets;
    },
  });

  const { data: trainingRuns } = useQuery({
    queryKey: ['training-runs'],
    queryFn: async () => {
      const runs = await base44.entities.TrainingProgress.list('-created_date', 10);
      return runs;
    },
  });

  const startTraining = useMutation({
    mutationFn: async (config) => {
      const run = await base44.entities.TrainingProgress.create({
        model_name: config.modelName,
        model_type: config.modelType,
        dataset_id: config.dataset,
        hyperparameters: {
          epochs: config.epochs,
          learning_rate: config.learningRate,
          batch_size: config.batchSize,
        },
        status: 'training',
        current_epoch: 0,
        total_epochs: config.epochs,
        metrics: {
          loss: 0,
          accuracy: 0,
        },
      });
      
      // Simulate training progress
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            return 100;
          }
          return prev + 2;
        });
      }, 500);
      
      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-runs'] });
    },
  });

  const handleStartTraining = () => {
    if (!modelName || !selectedDataset) {
      alert('Please provide model name and select a dataset');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    
    startTraining.mutate({
      modelName,
      modelType,
      dataset: selectedDataset,
      epochs: epochs[0],
      learningRate: learningRate[0],
      batchSize: batchSize[0],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Training Configuration */}
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Training Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model Name</Label>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="my-custom-model"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Model Type</Label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="nlp">NLP</SelectItem>
                  <SelectItem value="computer_vision">Computer Vision</SelectItem>
                  <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white flex items-center gap-2">
              <Database className="w-4 h-4" />
              Training Dataset
            </Label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.size} samples)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white">Epochs: {epochs[0]}</Label>
              <Slider
                value={epochs}
                onValueChange={setEpochs}
                min={1}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-white">Learning Rate: {learningRate[0]}</Label>
              <Slider
                value={learningRate}
                onValueChange={setLearningRate}
                min={0.0001}
                max={0.1}
                step={0.0001}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-white">Batch Size: {batchSize[0]}</Label>
              <Slider
                value={batchSize}
                onValueChange={setBatchSize}
                min={8}
                max={256}
                step={8}
                className="mt-2"
              />
            </div>
          </div>

          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Training Progress</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isTraining ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Training...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
            <Button variant="outline" className="border-white/10">
              <Save className="w-4 h-4 mr-2" />
              Save Config
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Training Runs */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Training Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trainingRuns?.map((run) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium text-sm">{run.model_name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    run.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    run.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {run.status}
                  </span>
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div>Epoch: {run.current_epoch}/{run.total_epochs}</div>
                  <div>Accuracy: {(run.metrics?.accuracy * 100).toFixed(2)}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}