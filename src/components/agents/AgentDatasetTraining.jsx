import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, BarChart3, Zap } from 'lucide-react';

export default function AgentDatasetTraining({ selectedAgent }) {
  const [datasets, setDatasets] = useState([
    { id: '1', name: 'Historical Market Data', size: '2.4 GB', status: 'trained', accuracy: 94.2 },
    { id: '2', name: 'Trading Patterns', size: '1.8 GB', status: 'training', accuracy: 87.5 }
  ]);
  const [trainingProgress, setTrainingProgress] = useState(45);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Upload Training Dataset</h3>
        <div className="border-2 border-dashed border-green-500/30 rounded-xl p-8 text-center hover:border-green-500/60 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white/70 text-sm mb-2">Drag and drop your dataset or click to browse</p>
          <p className="text-white/40 text-xs">Supported formats: CSV, JSON, Parquet (Max 5GB)</p>
        </div>
      </div>

      {/* Training Progress */}
      {selectedAgent && (
        <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Training Progress</h3>
            <span className="text-blue-400 font-semibold">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trainingProgress}%` }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
          <p className="text-white/60 text-sm">Epoch 45/100 • 2h 30m elapsed • ~1h remaining</p>
        </div>
      )}

      {/* Datasets List */}
      <div className="grid md:grid-cols-2 gap-6">
        {datasets.map((dataset, idx) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold text-sm">{dataset.name}</h4>
                <p className="text-white/60 text-xs mt-1">{dataset.size}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                dataset.status === 'trained'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {dataset.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white/70 text-sm">Accuracy: {dataset.accuracy}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Training Tips */}
      <div className="bg-black/40 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Training Best Practices
        </h3>
        <ul className="space-y-2 text-white/70 text-sm">
          <li>• Use datasets with at least 10k samples for optimal accuracy</li>
          <li>• Ensure data quality and remove outliers before training</li>
          <li>• Balance your dataset to prevent bias in agent decisions</li>
          <li>• Validate results on test datasets before deployment</li>
        </ul>
      </div>
    </div>
  );
}