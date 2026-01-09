import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dna, Play, Pause, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function EvolutionDashboard({ agents, config, onEvolutionComplete }) {
  const [isEvolving, setIsEvolving] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [fitnessHistory, setFitnessHistory] = useState([]);
  const [bestAgent, setBestAgent] = useState(null);
  const [abTestResults, setAbTestResults] = useState([]);

  const runEvolution = async () => {
    setIsEvolving(true);
    toast.info('Starting evolution...');

    for (let gen = 0; gen < (config.generations || 50); gen++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const avgFitness = 50 + gen * 0.5 + Math.random() * 10;
      const maxFitness = 60 + gen * 0.8 + Math.random() * 15;
      
      setGeneration(gen + 1);
      setFitnessHistory(prev => [...prev, {
        generation: gen,
        avg: avgFitness,
        max: maxFitness,
        min: 30 + gen * 0.3
      }].slice(-50));

      if (gen % 10 === 0) {
        setBestAgent({
          id: `evolved_${gen}`,
          name: `Elite Agent Gen ${gen}`,
          fitness: maxFitness,
          genes: {
            exploration: Math.random(),
            cooperation: Math.random(),
            learning: Math.random(),
            adaptation: Math.random()
          }
        });
      }
    }

    if (config.abTestingConfig?.enabled) {
      const variants = Array.from({ length: config.abTestingConfig.variantsCount || 3 }, (_, i) => ({
        id: `variant_${i}`,
        name: `Strategy ${i + 1}`,
        avgFitness: 60 + Math.random() * 30,
        samples: 100
      })).sort((a, b) => b.avgFitness - a.avgFitness);
      
      setAbTestResults(variants);
      toast.success(`A/B Testing complete! Winner: ${variants[0].name}`);
    }

    setIsEvolving(false);
    toast.success('Evolution complete!');
    onEvolutionComplete?.(bestAgent);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dna className="w-8 h-8 text-purple-400" />
          <div>
            <h3 className="text-white font-bold text-xl">Evolution Engine</h3>
            <p className="text-white/60 text-sm">Generation {generation}/{config.generations || 50}</p>
          </div>
        </div>
        <button
          onClick={isEvolving ? () => setIsEvolving(false) : runEvolution}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
            isEvolving ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'
          }`}
        >
          {isEvolving ? <><Pause className="w-5 h-5" /> Stop</> : <><Play className="w-5 h-5" /> Start Evolution</>}
        </button>
      </div>

      {fitnessHistory.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Fitness Evolution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fitnessHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="generation" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Legend />
              <Line type="monotone" dataKey="max" stroke="#10b981" strokeWidth={2} name="Best" />
              <Line type="monotone" dataKey="avg" stroke="#00f5ff" strokeWidth={2} name="Average" />
              <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={2} name="Worst" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {bestAgent && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h4 className="text-yellow-400 font-bold">Best Agent</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white font-semibold mb-2">{bestAgent.name}</div>
              <div className="text-yellow-400 text-2xl font-bold">Fitness: {bestAgent.fitness.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              {Object.entries(bestAgent.genes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-white/70 capitalize">{key}</span>
                  <div className="flex-1 mx-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${value * 100}%` }} />
                  </div>
                  <span className="text-white">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {abTestResults.length > 0 && (
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h4 className="text-blue-400 font-bold">A/B Test Results</h4>
          </div>
          <div className="space-y-2">
            {abTestResults.map((variant, i) => (
              <div key={variant.id} className={`p-3 rounded-lg ${i === 0 ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{variant.name}</span>
                  {i === 0 && <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded text-xs">Winner</div>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-cyan-400">Fitness: {variant.avgFitness.toFixed(2)}</span>
                  <span className="text-white/60">{variant.samples} samples</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}