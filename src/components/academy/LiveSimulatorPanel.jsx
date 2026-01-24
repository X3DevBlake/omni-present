import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, TrendingUp, Settings, Activity } from 'lucide-react';
import QuantumCircuitBuilder3D from './QuantumCircuitBuilder3D';
import NeuralArchitectureStudio3D from './NeuralArchitectureStudio3D';
import IITPhiVisualizer3D from '../consciousness/IITPhiVisualizer3D';

export default function LiveSimulatorPanel({ simulatorType, params, onParamsChange, sessionId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [experimentResults, setExperimentResults] = useState([]);
  const [localParams, setLocalParams] = useState(params || {
    temperature: 0.7,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    coherence: 0.8,
    entanglement: 0.5,
    voltage: 0.5
  });

  const runExperiment = () => {
    setIsRunning(true);
    
    // Simulate experiment run
    setTimeout(() => {
      const result = {
        timestamp: new Date().toISOString(),
        params: { ...localParams },
        metrics: {
          loss: Math.random() * 0.5,
          accuracy: 0.8 + Math.random() * 0.15,
          convergence: Math.random() * 100
        }
      };
      setExperimentResults([result, ...experimentResults.slice(0, 9)]);
      setIsRunning(false);
      
      if (onParamsChange) {
        onParamsChange(localParams, result);
      }
    }, 2000);
  };

  const renderSimulator = () => {
    switch (simulatorType) {
      case 'quantum':
        return <QuantumCircuitBuilder3D />;
      case 'neural':
        return <NeuralArchitectureStudio3D />;
      case 'phi':
        return <IITPhiVisualizer3D />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Simulator Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {renderSimulator()}
      </motion.div>

      {/* Parameter Controls */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Live Experiment Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="params" className="w-full">
            <TabsList className="bg-white/10 w-full">
              <TabsTrigger value="params" className="flex-1">Parameters</TabsTrigger>
              <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Temperature (τ): {localParams.temperature.toFixed(2)}
                </label>
                <Slider
                  value={[localParams.temperature * 100]}
                  onValueChange={(v) => setLocalParams({ ...localParams, temperature: v[0] / 100 })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  Learning Rate (η): {localParams.learningRate.toFixed(4)}
                </label>
                <Slider
                  value={[localParams.learningRate * 10000]}
                  onValueChange={(v) => setLocalParams({ ...localParams, learningRate: v[0] / 10000 })}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              {simulatorType === 'quantum' && (
                <>
                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Coherence: {localParams.coherence.toFixed(2)}
                    </label>
                    <Slider
                      value={[localParams.coherence * 100]}
                      onValueChange={(v) => setLocalParams({ ...localParams, coherence: v[0] / 100 })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Entanglement: {localParams.entanglement.toFixed(2)}
                    </label>
                    <Slider
                      value={[localParams.entanglement * 100]}
                      onValueChange={(v) => setLocalParams({ ...localParams, entanglement: v[0] / 100 })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={runExperiment}
                  disabled={isRunning}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2 animate-pulse" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Experiment
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setLocalParams(params)}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-2 max-h-64 overflow-y-auto">
              {experimentResults.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No experiments run yet
                </p>
              ) : (
                experimentResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-500 text-xs">
                        Experiment {experimentResults.length - idx}
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                        <div className="text-gray-400">Accuracy</div>
                        <div className="text-white font-bold">{(result.metrics.accuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                        <div className="text-gray-400">Loss</div>
                        <div className="text-white font-bold">{result.metrics.loss.toFixed(3)}</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                        <div className="text-gray-400">Conv.</div>
                        <div className="text-white font-bold">{result.metrics.convergence.toFixed(0)}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}