import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Palette } from 'lucide-react';

export default function VizCustomizer({ onConfigChange }) {
  const [config, setConfig] = useState({
    colorScheme: 'default',
    nodeSize: 1.0,
    animationSpeed: 1.0,
    showLabels: true,
    showConnections: true,
    particleEffects: true
  });

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange && onConfigChange(newConfig);
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Palette className="w-4 h-4" />
          Visualization Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-white/70 text-xs mb-2 block">Color Scheme</label>
          <select 
            value={config.colorScheme}
            onChange={(e) => updateConfig('colorScheme', e.target.value)}
            className="w-full bg-white/5 border border-white/20 text-white rounded px-2 py-1 text-xs"
          >
            <option value="default">Default</option>
            <option value="neon">Neon</option>
            <option value="pastel">Pastel</option>
            <option value="ocean">Ocean</option>
            <option value="sunset">Sunset</option>
          </select>
        </div>

        <div>
          <label className="text-white/70 text-xs mb-2 block">
            Node Size: {config.nodeSize.toFixed(1)}x
          </label>
          <Slider
            value={[config.nodeSize]}
            onValueChange={([v]) => updateConfig('nodeSize', v)}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/70 text-xs mb-2 block">
            Animation Speed: {config.animationSpeed.toFixed(1)}x
          </label>
          <Slider
            value={[config.animationSpeed]}
            onValueChange={([v]) => updateConfig('animationSpeed', v)}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">Show Labels</span>
            <Switch
              checked={config.showLabels}
              onCheckedChange={(v) => updateConfig('showLabels', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">Show Connections</span>
            <Switch
              checked={config.showConnections}
              onCheckedChange={(v) => updateConfig('showConnections', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">Particle Effects</span>
            <Switch
              checked={config.particleEffects}
              onCheckedChange={(v) => updateConfig('particleEffects', v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}