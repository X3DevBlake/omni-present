import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EnvironmentDesigner({ userEmail }) {
  const [params, setParams] = useState({
    scale: 100,
    complexity: 5,
    quality: 'high'
  });

  const { data: environments = [] } = useQuery({
    queryKey: ['proceduralEnvironments', userEmail],
    queryFn: () => userEmail ? base44.entities.ProceduralEnvironment.filter({ user_email: userEmail }).catch(() => []) : []
  });

  const handleGenerateEnvironment = async () => {
    // Trigger environment generation
    console.log('Generating with params:', params);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold">Environment Designer</h3>
      </div>

      {/* Generator Controls */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
        <div>
          <label className="text-white text-sm font-bold mb-2 block">
            <Settings className="w-4 h-4 inline mr-2" />
            Environment Scale
          </label>
          <Slider
            value={[params.scale]}
            onValueChange={(val) => setParams({ ...params, scale: val[0] })}
            min={10}
            max={500}
            step={10}
            className="w-full"
          />
          <p className="text-white/50 text-xs mt-1">{params.scale}m</p>
        </div>

        <div>
          <label className="text-white text-sm font-bold mb-2 block">Complexity</label>
          <Slider
            value={[params.complexity]}
            onValueChange={(val) => setParams({ ...params, complexity: val[0] })}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <p className="text-white/50 text-xs mt-1">Level {params.complexity}</p>
        </div>

        <div>
          <label className="text-white text-sm font-bold mb-2 block">Render Quality</label>
          <Select value={params.quality} onValueChange={(val) => setParams({ ...params, quality: val })}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerateEnvironment} className="w-full bg-purple-600 hover:bg-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          Generate Environment
        </Button>
      </div>

      {/* Generated Environments */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs font-bold">GENERATED ({environments.length})</p>
        {environments.slice(0, 5).map((env, idx) => (
          <motion.div
            key={env.id || idx}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-purple-500/50"
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-white font-bold text-sm">{env.name}</p>
                <p className="text-white/50 text-xs">{env.terrain_config?.terrain_type || 'Procedural'}</p>
              </div>
              <Button size="sm" variant="ghost">
                <Play className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-2 text-xs text-white/50">
              <span>Complexity: {env.complexity_level}</span>
              <span>•</span>
              <span>Elements: {env.interactive_elements?.length || 0}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}