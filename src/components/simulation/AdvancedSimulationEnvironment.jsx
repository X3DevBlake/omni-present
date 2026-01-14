import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, TrendingUp, Users, Zap, Eye } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as THREE from 'three';

function AgentNode({ position, label, color, isActive }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (isActive) {
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.15} color="white">
        {label}
      </Text>
    </group>
  );
}

function InteractionLine({ start, end, color }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  return <Line points={points} color={color} lineWidth={2} />;
}

function Simulation3DView({ scenario, agents, interactions }) {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {agents?.map((agent, i) => {
        const angle = (i / agents.length) * Math.PI * 2;
        const radius = 3;
        const position = [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ];
        
        return (
          <AgentNode
            key={agent.id}
            position={position}
            label={agent.name}
            color={agent.status === 'working' ? '#22c55e' : '#3b82f6'}
            isActive={scenario?.status === 'running'}
          />
        );
      })}
      
      {interactions?.map((interaction, i) => (
        <InteractionLine
          key={i}
          start={interaction.start}
          end={interaction.end}
          color="#a855f7"
        />
      ))}
      
      <OrbitControls enableZoom={true} autoRotate={scenario?.status === 'running'} />
    </Canvas>
  );
}

export default function AdvancedSimulationEnvironment() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationTime, setSimulationTime] = useState(0);
  const queryClient = useQueryClient();

  const { data: scenarios } = useQuery({
    queryKey: ['simulation-scenarios'],
    queryFn: () => base44.entities.SimulationScenario.list()
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list()
  });

  const { data: emergentBehaviors } = useQuery({
    queryKey: ['emergent-behaviors'],
    queryFn: () => base44.entities.EmergentBehavior.list(),
    refetchInterval: selectedScenario?.status === 'running' ? 3000 : false
  });

  const createScenario = useMutation({
    mutationFn: (data) => base44.entities.SimulationScenario.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-scenarios'] });
      toast.success('Scenario created');
    }
  });

  const updateScenario = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SimulationScenario.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-scenarios'] });
    }
  });

  useEffect(() => {
    if (selectedScenario?.status === 'running') {
      const interval = setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedScenario?.status]);

  const handleStartSimulation = () => {
    if (!selectedScenario) return;
    updateScenario.mutate({ id: selectedScenario.id, data: { status: 'running' } });
    toast.success('Simulation started');
  };

  const handlePauseSimulation = () => {
    if (!selectedScenario) return;
    updateScenario.mutate({ id: selectedScenario.id, data: { status: 'paused' } });
    toast.info('Simulation paused');
  };

  const handleStopSimulation = () => {
    if (!selectedScenario) return;
    updateScenario.mutate({ id: selectedScenario.id, data: { 
      status: 'completed',
      results: {
        duration: simulationTime,
        behaviors_detected: emergentBehaviors?.length || 0
      }
    } });
    setSimulationTime(0);
    toast.success('Simulation completed');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            Simulation Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleStartSimulation} disabled={selectedScenario?.status === 'running'}>
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button onClick={handlePauseSimulation} disabled={selectedScenario?.status !== 'running'}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleStopSimulation} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>

          {selectedScenario && (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{selectedScenario.scenario_name}</h4>
                <Badge variant={selectedScenario.status === 'running' ? 'default' : 'secondary'}>
                  {selectedScenario.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Agents</p>
                  <p className="font-bold text-lg">{selectedScenario.agent_count}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time Elapsed</p>
                  <p className="font-bold text-lg">{Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Behaviors</p>
                  <p className="font-bold text-lg">{emergentBehaviors?.filter(b => b.scenario_id === selectedScenario.id).length || 0}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3D Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-500" />
            Live Simulation View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black">
            <Simulation3DView 
              scenario={selectedScenario} 
              agents={agents?.slice(0, selectedScenario?.agent_count || 8)}
              interactions={[]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Simulation Scenarios</CardTitle>
            <Button onClick={() => createScenario.mutate({
              scenario_name: 'New Scenario',
              agent_count: 5,
              duration_minutes: 10
            })}>
              Create Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {scenarios?.map((scenario) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedScenario?.id === scenario.id ? 'border-purple-500 bg-purple-50' : 'bg-white'
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{scenario.scenario_name}</h4>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{scenario.agent_count} agents</Badge>
                    <Badge variant="outline">{scenario.duration_minutes} min</Badge>
                  </div>
                </div>
                <Badge>{scenario.status}</Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Emergent Behaviors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Detected Emergent Behaviors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {emergentBehaviors?.filter(b => b.scenario_id === selectedScenario?.id).map((behavior) => (
            <div key={behavior.id} className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Badge variant="secondary" className="mb-1">{behavior.behavior_type}</Badge>
                  <p className="text-sm">{behavior.description}</p>
                </div>
                <Badge variant="outline">{behavior.confidence_score}% confidence</Badge>
              </div>
              <div className="text-xs text-gray-500">
                {behavior.participating_agents?.length} agents • Impact: {behavior.impact_on_performance}%
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}