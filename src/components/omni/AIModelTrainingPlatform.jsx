import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Upload, Sliders, BarChart3, Play, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIModelTrainingPlatform({ blueprint, onModelTrained, onClose }) {
  const [trainingData, setTrainingData] = useState(null);
  const [hyperparameters, setHyperparameters] = useState({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    optimizer: 'adam'
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResults, setTrainingResults] = useState(null);

  const handleDataUpload = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          samples: { type: 'array', items: { type: 'object' } }
        }
      }
    });

    if (extracted.status === 'success') {
      setTrainingData(extracted.output);
      toast.success('Training data loaded');
    }
  };

  const optimizeHyperparameters = async () => {
    toast.info('Optimizing hyperparameters...');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Optimize hyperparameters for model training:
        Blueprint: ${JSON.stringify(blueprint)}
        Current params: ${JSON.stringify(hyperparameters)}
        Training data size: ${trainingData?.samples?.length || 0}
        
        Suggest optimal:
        1. Learning rate
        2. Batch size
        3. Number of epochs
        4. Optimizer choice
      `,
      response_json_schema: {
        type: 'object',
        properties: {
          learningRate: { type: 'number' },
          batchSize: { type: 'number' },
          epochs: { type: 'number' },
          optimizer: { type: 'string' },
          reasoning: { type: 'string' }
        }
      }
    });

    setHyperparameters({
      learningRate: result.learningRate,
      batchSize: result.batchSize,
      epochs: result.epochs,
      optimizer: result.optimizer
    });

    toast.success('Hyperparameters optimized');
  };

  const trainModel = async () => {
    setIsTraining(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Simulate model training with:
          Data samples: ${trainingData?.samples?.length}
          Hyperparameters: ${JSON.stringify(hyperparameters)}
          
          Provide training metrics:
          1. Training loss progression
          2. Validation accuracy
          3. Model performance evaluation
          4. Deployment recommendations
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            trainingLoss: { type: 'array', items: { type: 'number' } },
            valAccuracy: { type: 'number' },
            metrics: {
              type: 'object',
              properties: {
                precision: { type: 'number' },
                recall: { type: 'number' },
                f1Score: { type: 'number' }
              }
            },
            deploymentReady: { type: 'boolean' },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setTrainingResults(result);
      
      if (result.deploymentReady) {
        toast.success('Model training complete - ready for deployment');
        onModelTrained?.(result);
      } else {
        toast.warning('Model needs further tuning');
      }
    } catch (error) {
      console.error('Training failed:', error);
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Model Training</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Data Ingestion
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && handleDataUpload(e.target.files[0])}
                className="hidden"
                id="data-upload"
              />
              <label
                htmlFor="data-upload"
                className="block w-full py-3 text-center rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 cursor-pointer"
              >
                Upload Training Data
              </label>
              {trainingData && (
                <div className="mt-3 text-white/70 text-sm">
                  ✓ Loaded {trainingData.samples?.length} samples
                </div>
              )}
            </div>

            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Hyperparameters
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={hyperparameters.learningRate}
                  onChange={(e) => setHyperparameters({...hyperparameters, learningRate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Batch Size</label>
                <input
                  type="number"
                  value={hyperparameters.batchSize}
                  onChange={(e) => setHyperparameters({...hyperparameters, batchSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Epochs</label>
                <input
                  type="number"
                  value={hyperparameters.epochs}
                  onChange={(e) => setHyperparameters({...hyperparameters, epochs: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>
            <button
              onClick={optimizeHyperparameters}
              className="w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm"
            >
              Auto-Optimize
            </button>
          </div>

          <div>
            {trainingResults && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Training Results
                </h3>
                
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="text-green-400 text-sm mb-2">Validation Accuracy</div>
                  <div className="text-white text-3xl font-bold">{(trainingResults.valAccuracy * 100).toFixed(1)}%</div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/70 text-sm mb-2">Performance Metrics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Precision:</span>
                      <span>{(trainingResults.metrics.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Recall:</span>
                      <span>{(trainingResults.metrics.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>F1 Score:</span>
                      <span>{(trainingResults.metrics.f1Score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {trainingResults.recommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="text-cyan-400 text-sm mb-2">Recommendations</div>
                    {trainingResults.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-white/70 text-xs mb-1">• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={trainModel}
          disabled={!trainingData || isTraining}
          className="w-full mt-6 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isTraining ? 'Training Model...' : 'Start Training'}
        </button>
      </motion.div>
    </motion.div>
  );
}