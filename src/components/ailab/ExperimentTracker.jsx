import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Eye } from 'lucide-react';

export default function ExperimentTracker() {
  const [experiments, setExperiments] = useState([
    {
      id: 1,
      name: 'Agent v3.2 Training',
      model: 'GPT-4 Fine-tune',
      accuracy: 94.2,
      loss: 0.18,
      epoch: 45,
      status: 'Completed',
      startedAt: '2 weeks ago',
    },
    {
      id: 2,
      name: 'Market Predictor v2',
      model: 'LSTM Network',
      accuracy: 89.5,
      loss: 0.32,
      epoch: 32,
      status: 'Running',
      startedAt: '3 days ago',
    },
    {
      id: 3,
      name: 'Risk Analyzer Experiment',
      model: 'Transformer',
      accuracy: 91.8,
      loss: 0.24,
      epoch: 28,
      status: 'Paused',
      startedAt: 'Yesterday',
    },
  ]);

  return (
    <div className="space-y-4">
      {experiments.map((exp, idx) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="bg-black/40 border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-bold text-lg">{exp.name}</h4>
                <p className="text-white/60 text-sm">{exp.model} • Started {exp.startedAt}</p>
              </div>
              <Badge className={`${
                exp.status === 'Completed' ? 'bg-green-500/30 text-green-300' :
                exp.status === 'Running' ? 'bg-blue-500/30 text-blue-300' :
                'bg-yellow-500/30 text-yellow-300'
              }`}>
                {exp.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs">Accuracy</p>
                <p className="text-white font-bold text-lg">{exp.accuracy}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs">Loss</p>
                <p className="text-white font-bold text-lg">{exp.loss}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs">Epoch</p>
                <p className="text-white font-bold text-lg">{exp.epoch}/100</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4 bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${(exp.epoch / 100) * 100}%` }}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-1" /> View Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Play className="w-4 h-4 mr-1" /> Resume
              </Button>
              <Button variant="ghost" size="sm" className="text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}