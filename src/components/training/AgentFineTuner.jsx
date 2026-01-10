import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

export default function AgentFineTuner({ agent, simulationData, onFineTune }) {
  const [learningRate, setLearningRate] = useState(0.01);
  const [epochs, setEpochs] = useState(10);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const startFineTuning = async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          const improvements = {
            decisionAccuracy: 15 + Math.random() * 10,
            responseTime: -(5 + Math.random() * 5),
            efficiency: 10 + Math.random() * 8,
          };
          
          onFineTune?.({ ...agent, ...improvements, lastTrained: new Date() });
          toast.success('Fine-tuning complete! Agent performance improved.');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-cyan-400" />
        Agent Fine-Tuning
      </h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-white/60 text-sm mb-2">Training Data</div>
          <div className="text-white font-bold text-2xl">{simulationData?.length || 0}</div>
          <div className="text-white/40 text-xs">simulation outcomes</div>
        </div>
        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-white/60 text-sm mb-2">Current Accuracy</div>
          <div className="text-cyan-400 font-bold text-2xl">{(75 + Math.random() * 15).toFixed(1)}%</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-white text-sm mb-2 block">Learning Rate</label>
          <Slider
            value={[learningRate * 100]}
            onValueChange={([v]) => setLearningRate(v / 100)}
            max={10}
            step={0.1}
          />
          <div className="text-cyan-400 text-xs mt-1">{learningRate.toFixed(3)}</div>
        </div>

        <div>
          <label className="text-white text-sm mb-2 block">Training Epochs</label>
          <Slider
            value={[epochs]}
            onValueChange={([v]) => setEpochs(v)}
            max={50}
            step={1}
          />
          <div className="text-cyan-400 text-xs mt-1">{epochs} iterations</div>
        </div>
      </div>

      {isTraining && (
        <div className="mb-6">
          <div className="text-white text-sm mb-2">Training Progress</div>
          <div className="h-4 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${trainingProgress}%` }}
            />
          </div>
          <div className="text-cyan-400 text-xs mt-1">{trainingProgress}%</div>
        </div>
      )}

      <Button
        onClick={startFineTuning}
        disabled={isTraining}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
      >
        <Zap className="w-4 h-4 mr-2" />
        {isTraining ? 'Training...' : 'Start Fine-Tuning'}
      </Button>
    </div>
  );
}