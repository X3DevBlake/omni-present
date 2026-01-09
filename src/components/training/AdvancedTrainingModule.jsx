import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Settings, Play, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AdvancedTrainingModule() {
  const [trainingConfig, setTrainingConfig] = useState({
    learningRate: 0.001,
    optimizer: 'adam',
    epochs: 50,
    batchSize: 32,
    layers: 3
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState([]);
  const [dataset, setDataset] = useState(null);

  const handleDatasetUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDataset({ name: file.name, size: file.size, type: file.type });
      toast.success(`Uploaded ${file.name}`);
    }
  };

  const startTraining = async () => {
    if (!dataset) {
      toast.error('Upload a dataset first');
      return;
    }

    setIsTraining(true);
    const progress = [];

    for (let epoch = 1; epoch <= trainingConfig.epochs; epoch++) {
      await new Promise(r => setTimeout(r, 100));
      const loss = 2.5 * Math.exp(-epoch / 10) + Math.random() * 0.1;
      const accuracy = Math.min(95, 30 + (epoch / trainingConfig.epochs) * 60 + Math.random() * 5);

      progress.push({
        epoch,
        loss: loss.toFixed(4),
        accuracy: accuracy.toFixed(2),
        lr: trainingConfig.learningRate.toFixed(5)
      });
      setTrainingProgress([...progress]);
    }

    setIsTraining(false);
    toast.success('Training complete!');
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Dataset Management
          </h3>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-blue-500/40 rounded-lg p-6 text-center hover:border-blue-500/60 transition-all">
              <p className="text-white/60 text-sm">Click to upload dataset</p>
              <p className="text-white/40 text-xs mt-1">CSV, JSON, or Parquet</p>
              <input
                type="file"
                onChange={handleDatasetUpload}
                className="hidden"
                accept=".csv,.json,.parquet"
              />
            </div>
          </label>
          {dataset && (
            <div className="bg-white/5 border border-blue-500/20 rounded p-3">
              <p className="text-white font-bold text-sm">{dataset.name}</p>
              <p className="text-white/60 text-xs mt-1">{(dataset.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Training Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-xs block mb-1">Learning Rate: {trainingConfig.learningRate}</label>
              <input
                type="range"
                min="0.00001"
                max="0.1"
                step="0.00001"
                value={trainingConfig.learningRate}
                onChange={(e) => setTrainingConfig({ ...trainingConfig, learningRate: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Batch Size: {trainingConfig.batchSize}</label>
              <input
                type="range"
                min="8"
                max="256"
                step="8"
                value={trainingConfig.batchSize}
                onChange={(e) => setTrainingConfig({ ...trainingConfig, batchSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Epochs: {trainingConfig.epochs}</label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={trainingConfig.epochs}
                onChange={(e) => setTrainingConfig({ ...trainingConfig, epochs: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Optimizer</label>
              <select
                value={trainingConfig.optimizer}
                onChange={(e) => setTrainingConfig({ ...trainingConfig, optimizer: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-xs"
              >
                <option>adam</option>
                <option>sgd</option>
                <option>rmsprop</option>
                <option>adagrad</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={startTraining}
        disabled={isTraining || !dataset}
        whileHover={{ scale: 1.02 }}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        {isTraining ? 'Training...' : 'Start Training'}
      </motion.button>

      {trainingProgress.length > 0 && (
        <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Training Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(0,245,255,0.3)' }} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white/60 text-xs">Final Loss</p>
              <p className="text-white font-bold">{trainingProgress[trainingProgress.length - 1]?.loss}</p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white/60 text-xs">Accuracy</p>
              <p className="text-white font-bold">{trainingProgress[trainingProgress.length - 1]?.accuracy}%</p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white/60 text-xs">Epochs Done</p>
              <p className="text-white font-bold">{trainingProgress.length}/{trainingConfig.epochs}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}