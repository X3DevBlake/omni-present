import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wind, Thermometer, Gauge, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PhysicsEngineControls({ simulationId, currentConfig, onUpdate }) {
  const [config, setConfig] = useState(currentConfig || {
    physics_engine: 'realistic',
    gravity: { x: 0, y: -9.8, z: 0 },
    environmental_factors: {
      wind_speed: 0,
      temperature: 20,
      humidity: 50,
      pressure: 101.3
    },
    time_scale: 1.0
  });

  const handleUpdate = async () => {
    try {
      const response = await base44.functions.invoke('updatePhysicsEngine', {
        simulation_id: simulationId,
        physics_config: config
      });
      toast.success('Physics configuration updated');
      onUpdate?.(response.data.config);
    } catch (error) {
      toast.error('Failed to update physics config');
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Advanced Physics Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Physics Engine</label>
          <Select
            value={config.physics_engine}
            onValueChange={(v) => setConfig({ ...config, physics_engine: v })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="quantum">Quantum</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <Wind className="w-4 h-4" />
            Wind Speed: {config.environmental_factors.wind_speed} m/s
          </label>
          <Slider
            value={[config.environmental_factors.wind_speed]}
            onValueChange={([v]) => setConfig({
              ...config,
              environmental_factors: { ...config.environmental_factors, wind_speed: v }
            })}
            max={50}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature: {config.environmental_factors.temperature}°C
          </label>
          <Slider
            value={[config.environmental_factors.temperature]}
            onValueChange={([v]) => setConfig({
              ...config,
              environmental_factors: { ...config.environmental_factors, temperature: v }
            })}
            min={-50}
            max={50}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Gravity (Y): {config.gravity.y} m/s²
          </label>
          <Slider
            value={[config.gravity.y]}
            onValueChange={([v]) => setConfig({
              ...config,
              gravity: { ...config.gravity, y: v }
            })}
            min={-20}
            max={20}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">
            Time Scale: {config.time_scale}x
          </label>
          <Slider
            value={[config.time_scale]}
            onValueChange={([v]) => setConfig({ ...config, time_scale: v })}
            min={0.1}
            max={5}
            step={0.1}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleUpdate}
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
        >
          Apply Physics Configuration
        </Button>
      </CardContent>
    </Card>
  );
}