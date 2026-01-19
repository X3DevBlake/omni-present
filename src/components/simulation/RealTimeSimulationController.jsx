import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play, Pause, RotateCcw, Zap, User, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function RealTimeSimulationController() {
  const queryClient = useQueryClient();
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState([50]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [interventionValue, setInterventionValue] = useState([50]);

  const { data: runningSimulations } = useQuery({
    queryKey: ['running-simulations'],
    queryFn: async () => {
      const sims = await base44.entities.Simulation.filter({ status: 'running' });
      return sims;
    },
    refetchInterval: 2000,
  });

  const { data: simulationAgents } = useQuery({
    queryKey: ['simulation-agents', activeSimulation],
    queryFn: async () => {
      if (!activeSimulation) return [];
      const agents = await base44.entities.SimulationAgent.filter({
        simulation_id: activeSimulation,
      });
      return agents;
    },
    enabled: !!activeSimulation,
  });

  const applyIntervention = useMutation({
    mutationFn: async (intervention) => {
      await base44.entities.SimulationEvent.create({
        simulation_id: activeSimulation,
        event_type: 'user_intervention',
        event_data: intervention,
        step: currentStep,
      });
      return intervention;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-agents'] });
    },
  });

  useEffect(() => {
    if (!isRunning || !activeSimulation) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000 / (simulationSpeed[0] / 50));

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, activeSimulation]);

  const handleIntervention = (type) => {
    if (!selectedAgent) {
      alert('Select an agent first');
      return;
    }

    applyIntervention.mutate({
      agent_id: selectedAgent,
      intervention_type: type,
      value: interventionValue[0],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Real-Time Simulation Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeSimulation ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Simulation Running</h3>
                  <p className="text-white/60 text-sm">Step {currentStep} / 1000</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    variant="outline"
                    className="border-white/10"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStep(0);
                      setIsRunning(false);
                    }}
                    variant="outline"
                    className="border-white/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Progress value={(currentStep / 1000) * 100} className="h-2" />

              <div>
                <label className="text-white text-sm mb-2 block">Simulation Speed: {simulationSpeed[0]}%</label>
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  min={10}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Agent Selection */}
              <div>
                <label className="text-white text-sm mb-2 block">Select Agent to Control</label>
                <div className="grid grid-cols-2 gap-2">
                  {simulationAgents?.slice(0, 6).map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedAgent === agent.id
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-white font-medium text-sm">{agent.agent_type}</div>
                      <div className="text-white/60 text-xs">Health: {agent.health || 100}%</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intervention Controls */}
              {selectedAgent && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Agent Interventions</h4>
                  
                  <div className="mb-4">
                    <label className="text-white text-sm mb-2 block">Intervention Strength: {interventionValue[0]}%</label>
                    <Slider
                      value={interventionValue}
                      onValueChange={setInterventionValue}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleIntervention('boost_resources')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Boost Resources
                    </Button>
                    <Button
                      onClick={() => handleIntervention('change_strategy')}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Change Strategy
                    </Button>
                    <Button
                      onClick={() => handleIntervention('force_collaboration')}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Force Collab
                    </Button>
                    <Button
                      onClick={() => handleIntervention('reset_state')}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset Agent
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">No Active Simulation</h3>
              <p className="text-white/60 mb-4">Start a simulation from the Simulation Studio</p>
              <Button
                onClick={() => setActiveSimulation('demo')}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Demo Simulation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Live Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-1">Efficiency</div>
              <div className="text-white text-2xl font-bold">
                {(70 + Math.sin(currentStep * 0.1) * 20).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-1">Collaboration</div>
              <div className="text-white text-2xl font-bold">
                {(60 + Math.cos(currentStep * 0.15) * 25).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-1">Resources</div>
              <div className="text-white text-2xl font-bold">
                {Math.max(0, 100 - currentStep * 0.5).toFixed(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}