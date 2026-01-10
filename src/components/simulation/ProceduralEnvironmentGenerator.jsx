import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Shuffle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function ProceduralEnvironmentGenerator() {
  const [params, setParams] = useState({
    terrain: 50,
    vegetation: 50,
    structures: 30,
    weather: 50,
  });
  const [environment, setEnvironment] = useState(null);

  const generateEnvironment = () => {
    setEnvironment({
      type: ['Desert', 'Forest', 'Urban', 'Arctic', 'Ocean'][Math.floor(Math.random() * 5)],
      complexity: Math.random() * 100,
      resources: Math.floor(Math.random() * 20) + 5,
      challenges: Math.floor(Math.random() * 15) + 3,
      seed: Math.random().toString(36).substring(7),
    });
  };

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Map className="w-6 h-6 text-green-400" />
        Procedural Environment Generator
      </h3>

      <div className="space-y-4 mb-6">
        {Object.entries(params).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm capitalize">{key}</span>
              <span className="text-green-400 text-sm">{value}%</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([v]) => setParams({...params, [key]: v})}
              max={100}
            />
          </div>
        ))}
      </div>

      <Button onClick={generateEnvironment} className="w-full mb-4 bg-gradient-to-r from-green-500 to-teal-500">
        <Shuffle className="w-4 h-4 mr-2" />
        Generate Environment
      </Button>

      {environment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/20 rounded-lg p-4"
        >
          <h4 className="text-white font-bold mb-3">{environment.type} Biome</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-white/60">Complexity</div>
              <div className="text-white font-semibold">{environment.complexity.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-white/60">Resources</div>
              <div className="text-white font-semibold">{environment.resources}</div>
            </div>
            <div>
              <div className="text-white/60">Challenges</div>
              <div className="text-white font-semibold">{environment.challenges}</div>
            </div>
            <div>
              <div className="text-white/60">Seed</div>
              <div className="text-white font-mono text-xs">{environment.seed}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}