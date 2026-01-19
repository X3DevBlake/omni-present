import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Save, Play, Copy, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScenarioDesigner() {
  const queryClient = useQueryClient();
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [initialConditions, setInitialConditions] = useState('');
  const [objectives, setObjectives] = useState('');
  const [duration, setDuration] = useState(100);

  const { data: scenarios } = useQuery({
    queryKey: ['simulation-scenarios'],
    queryFn: async () => {
      const scenarios = await base44.entities.SimulationScenario.list('-created_date');
      return scenarios;
    },
  });

  const createScenario = useMutation({
    mutationFn: async (scenario) => {
      return await base44.entities.SimulationScenario.create({
        name: scenario.name,
        description: scenario.description,
        initial_conditions: scenario.initial_conditions,
        objectives: scenario.objectives,
        duration_steps: scenario.duration,
        status: 'draft',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-scenarios'] });
      setScenarioName('');
      setScenarioDesc('');
      setInitialConditions('');
      setObjectives('');
    },
  });

  const deleteScenario = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.SimulationScenario.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-scenarios'] });
    },
  });

  const runScenario = useMutation({
    mutationFn: async (scenario) => {
      const simulation = await base44.entities.Simulation.create({
        scenario_id: scenario.id,
        status: 'running',
        current_step: 0,
        total_steps: scenario.duration_steps,
      });
      return simulation;
    },
    onSuccess: () => {
      alert('Simulation started successfully!');
    },
  });

  const handleCreate = () => {
    if (!scenarioName) {
      alert('Please provide a scenario name');
      return;
    }

    createScenario.mutate({
      name: scenarioName,
      description: scenarioDesc,
      initial_conditions: initialConditions,
      objectives: objectives,
      duration,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create New Scenario */}
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-400" />
            Design New Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Scenario Name</Label>
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Market Competition Scenario"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              value={scenarioDesc}
              onChange={(e) => setScenarioDesc(e.target.value)}
              placeholder="Agents compete for limited resources in a dynamic market..."
              className="bg-white/5 border-white/10 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-white">Initial Conditions (JSON)</Label>
            <Textarea
              value={initialConditions}
              onChange={(e) => setInitialConditions(e.target.value)}
              placeholder='{"resources": 1000, "agents": 5, "market_volatility": 0.3}'
              className="bg-white/5 border-white/10 text-white font-mono text-sm"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-white">Objectives</Label>
            <Textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Maximize resource acquisition while maintaining agent cooperation..."
              className="bg-white/5 border-white/10 text-white"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-white">Duration (Steps): {duration}</Label>
            <input
              type="range"
              min="10"
              max="1000"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          <Button
            onClick={handleCreate}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
        </CardContent>
      </Card>

      {/* Saved Scenarios */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Saved Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scenarios?.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <h4 className="text-white font-medium mb-1">{scenario.name}</h4>
                <p className="text-white/60 text-xs mb-3 line-clamp-2">
                  {scenario.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => runScenario.mutate(scenario)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                    onClick={() => {
                      setScenarioName(scenario.name + ' (Copy)');
                      setScenarioDesc(scenario.description);
                      setInitialConditions(JSON.stringify(scenario.initial_conditions || {}));
                      setObjectives(scenario.objectives);
                      setDuration(scenario.duration_steps || 100);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-red-400"
                    onClick={() => deleteScenario.mutate(scenario.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}