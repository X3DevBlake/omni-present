import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dna, Zap, TrendingUp, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function GeneticAlgorithmConfig({ show, onClose, onConfigSave }) {
  const [config, setConfig] = useState({
    mutationRate: 0.05,
    crossoverRate: 0.7,
    elitismPercent: 0.1,
    populationSize: 100,
    generations: 50,
    crossoverStrategy: 'single_point',
    mutationType: 'gaussian',
    selectionMethod: 'tournament',
    fitnessFunction: 'multi_objective'
  });

  const [fitnessWeights, setFitnessWeights] = useState({
    efficiency: 0.3,
    goalAchievement: 0.3,
    resourceUtilization: 0.2,
    socialCooperation: 0.2
  });

  const [abTestingConfig, setAbTestingConfig] = useState({
    enabled: false,
    variantsCount: 3,
    testDuration: 100,
    autoSelectWinner: true
  });

  const saveConfig = async () => {
    try {
      const fullConfig = { ...config, fitnessWeights, abTestingConfig };
      const user = await base44.auth.me();
      await base44.auth.updateMe({ evolution_config: fullConfig });
      onConfigSave?.(fullConfig);
      toast.success('Evolution configuration saved!');
      onClose();
    } catch (err) {
      toast.error('Failed to save configuration');
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Dna className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Genetic Algorithm Configuration</h3>
              <p className="text-white/60 text-sm">Fine-tune evolution parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-cyan-400 font-semibold mb-4">Evolution Parameters</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 flex justify-between">
                    <span>Mutation Rate</span>
                    <span className="text-cyan-400">{(config.mutationRate * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" min="0" max="0.5" step="0.01" value={config.mutationRate} onChange={(e) => setConfig({ ...config, mutationRate: parseFloat(e.target.value) })} className="w-full" />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 flex justify-between">
                    <span>Crossover Rate</span>
                    <span className="text-purple-400">{(config.crossoverRate * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" min="0" max="1" step="0.05" value={config.crossoverRate} onChange={(e) => setConfig({ ...config, crossoverRate: parseFloat(e.target.value) })} className="w-full" />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 flex justify-between">
                    <span>Elitism</span>
                    <span className="text-green-400">{(config.elitismPercent * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" min="0" max="0.3" step="0.01" value={config.elitismPercent} onChange={(e) => setConfig({ ...config, elitismPercent: parseFloat(e.target.value) })} className="w-full" />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Population Size</label>
                  <input type="number" min="10" max="500" value={config.populationSize} onChange={(e) => setConfig({ ...config, populationSize: parseInt(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Generations</label>
                  <input type="number" min="10" max="1000" value={config.generations} onChange={(e) => setConfig({ ...config, generations: parseInt(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-purple-400 font-semibold mb-4">Strategy Selection</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Crossover Strategy</label>
                    <select value={config.crossoverStrategy} onChange={(e) => setConfig({ ...config, crossoverStrategy: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="single_point">Single Point</option>
                      <option value="two_point">Two Point</option>
                      <option value="uniform">Uniform</option>
                      <option value="arithmetic">Arithmetic</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Mutation Type</label>
                    <select value={config.mutationType} onChange={(e) => setConfig({ ...config, mutationType: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="gaussian">Gaussian</option>
                      <option value="uniform">Uniform</option>
                      <option value="swap">Swap</option>
                      <option value="inversion">Inversion</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Selection Method</label>
                    <select value={config.selectionMethod} onChange={(e) => setConfig({ ...config, selectionMethod: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="tournament">Tournament</option>
                      <option value="roulette">Roulette Wheel</option>
                      <option value="rank">Rank-based</option>
                      <option value="stochastic">Stochastic Universal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-4">Fitness Weights</h4>
                <div className="space-y-3">
                  {Object.entries(fitnessWeights).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-white/70 text-sm mb-2 flex justify-between capitalize">
                        <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-yellow-400">{(value * 100).toFixed(0)}%</span>
                      </label>
                      <input type="range" min="0" max="1" step="0.05" value={value} onChange={(e) => setFitnessWeights({ ...fitnessWeights, [key]: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-blue-400 font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                A/B Testing
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={abTestingConfig.enabled} onChange={(e) => setAbTestingConfig({ ...abTestingConfig, enabled: e.target.checked })} className="w-4 h-4" />
                <span className="text-white text-sm">Enable</span>
              </label>
            </div>

            {abTestingConfig.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Variants Count</label>
                  <input type="number" min="2" max="10" value={abTestingConfig.variantsCount} onChange={(e) => setAbTestingConfig({ ...abTestingConfig, variantsCount: parseInt(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Test Duration (cycles)</label>
                  <input type="number" min="10" max="1000" value={abTestingConfig.testDuration} onChange={(e) => setAbTestingConfig({ ...abTestingConfig, testDuration: parseInt(e.target.value) })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
            )}
          </div>

          <button onClick={saveConfig} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90">
            Save Configuration
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}