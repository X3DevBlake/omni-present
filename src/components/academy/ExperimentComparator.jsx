import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

export default function ExperimentComparator({ experiments, metric = 'loss' }) {
  if (!experiments || experiments.length === 0) {
    return null;
  }

  const sortedExperiments = [...experiments].sort((a, b) => 
    a[metric] - b[metric]
  );

  const bestExperiment = sortedExperiments[0];
  const worstExperiment = sortedExperiments[sortedExperiments.length - 1];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Experiment Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Best Result */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-green-500">Best Performance</Badge>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Loss</div>
                <div className="text-white font-bold">{bestExperiment.loss?.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-gray-400">Epoch</div>
                <div className="text-white font-bold">{bestExperiment.epoch}</div>
              </div>
            </div>
            {bestExperiment.params && (
              <div className="mt-2 text-gray-300 text-xs">
                η={bestExperiment.params.learningRate?.toFixed(4)} | batch={bestExperiment.params.batchSize}
              </div>
            )}
          </motion.div>

          {/* Latest Results */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {experiments.slice(0, 5).map((exp, idx) => {
              const isImprovement = idx > 0 && exp.loss < experiments[idx - 1].loss;
              const isDegradation = idx > 0 && exp.loss > experiments[idx - 1].loss;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-500/50 text-blue-300 text-xs">
                      #{idx + 1}
                    </Badge>
                    <span className="text-white text-xs font-mono">
                      Loss: {exp.loss?.toFixed(4)}
                    </span>
                  </div>
                  {isImprovement && <TrendingDown className="w-3 h-3 text-green-400" />}
                  {isDegradation && <TrendingUp className="w-3 h-3 text-red-400" />}
                  {!isImprovement && !isDegradation && idx > 0 && <Minus className="w-3 h-3 text-gray-500" />}
                </motion.div>
              );
            })}
          </div>

          {/* Improvement Stats */}
          {experiments.length > 1 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Overall Improvement</div>
              <div className="text-white font-bold">
                {(((experiments[experiments.length - 1].loss - experiments[0].loss) / experiments[experiments.length - 1].loss) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}