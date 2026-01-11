import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, Zap, Play } from 'lucide-react';

export default function SimulationConfigurator({ userEmail }) {
  const [configName, setConfigName] = useState('');
  const [economicCondition, setEconomicCondition] = useState(50);
  const [eventFrequency, setEventFrequency] = useState(30);
  const [autonomousEvents, setAutonomousEvents] = useState(false);
  const queryClient = useQueryClient();

  const createConfig = useMutation({
    mutationFn: async () => {
      return await base44.entities.SimulationConfig.create({
        user_email: userEmail,
        config_name: configName,
        environmental_factors: {
          economic_condition: economicCondition,
          event_frequency: eventFrequency,
          market_volatility: Math.random() * 100,
          resource_scarcity: Math.random() * 100
        },
        autonomous_events: autonomousEvents,
        stress_test_scenarios: [
          { name: 'Market Crash', severity: 'high', duration: 60 },
          { name: 'Resource Shortage', severity: 'medium', duration: 120 },
          { name: 'System Overload', severity: 'critical', duration: 30 }
        ],
        analytics_enabled: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulationConfigs'] });
      setConfigName('');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Settings className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Simulation Configuration</h3>
          <p className="text-white/60 text-sm">Environmental parameters</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Configuration name..."
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          className="bg-white/5 border-white/10"
        />

        <div className="space-y-3">
          <div>
            <label className="text-white text-sm font-bold mb-2 block">
              Economic Condition: {economicCondition}%
            </label>
            <Slider
              value={[economicCondition]}
              onValueChange={([val]) => setEconomicCondition(val)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm font-bold mb-2 block">
              Random Event Frequency: {eventFrequency}%
            </label>
            <Slider
              value={[eventFrequency]}
              onValueChange={([val]) => setEventFrequency(val)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-white text-sm font-bold">Autonomous Events</p>
            <p className="text-white/60 text-xs">AI-generated scenarios</p>
          </div>
          <Switch
            checked={autonomousEvents}
            onCheckedChange={setAutonomousEvents}
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs font-bold mb-2">Stress Tests Included:</p>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Market Crash (High severity)</li>
            <li>• Resource Shortage (Medium severity)</li>
            <li>• System Overload (Critical severity)</li>
          </ul>
        </div>

        <Button
          onClick={() => createConfig.mutate()}
          disabled={!configName || createConfig.isPending}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
        >
          <Play className="w-4 h-4 mr-2" />
          Create Configuration
        </Button>
      </div>
    </Card>
  );
}