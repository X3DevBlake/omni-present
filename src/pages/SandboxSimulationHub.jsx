import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, RotateCcw, Settings, Brain, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

function Agent3DNode({ position, color, scale = 1 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5 * scale, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

function Connection3D({ start, end, color = '#00f5ff' }) {
  const midpoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <mesh position={midpoint}>
        <cylinderGeometry args={[0.02, 0.02, 1]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

export default function SandboxSimulationHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  
  const [envParams, setEnvParams] = useState({
    name: 'New Simulation',
    gravity: 9.8,
    temperature: 20,
    resourceDensity: 50,
    complexity: 5,
    duration: 60
  });

  const [agentConfig, setAgentConfig] = useState({
    count: 5,
    type: 'collaborative',
    communication: 'enabled',
    learning: 'enabled'
  });

  const [simulationData, setSimulationData] = useState({
    agents: [],
    connections: [],
    metrics: { interactions: 0, emergentBehaviors: 0, efficiency: 0 }
  });

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const queryClient = useQueryClient();

  const { data: simulations } = useQuery({
    queryKey: ['sandboxSimulations', userEmail],
    queryFn: () => base44.entities.SandboxSimulation.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const startSimulation = useMutation({
    mutationFn: async () => {
      const sim = await base44.entities.SandboxSimulation.create({
        user_email: userEmail,
        name: envParams.name,
        environment_params: envParams,
        agent_config: agentConfig,
        status: 'running',
        metrics: { interactions: 0, emergentBehaviors: 0, efficiency: 0 }
      });

      // Generate initial agent positions
      const agents = Array.from({ length: agentConfig.count }, (_, i) => ({
        id: `agent-${i}`,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        color: `hsl(${(i * 360) / agentConfig.count}, 70%, 60%)`,
        behavior: Math.random() > 0.5 ? 'explorer' : 'collaborator'
      }));

      setSimulationData({
        agents,
        connections: [],
        metrics: { interactions: 0, emergentBehaviors: 0, efficiency: 0 }
      });

      return sim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandboxSimulations'] });
      setIsRunning(true);
      toast.success('Simulation started!');
    },
  });

  const stopSimulation = () => {
    setIsRunning(false);
    toast.info('Simulation paused');
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationData({
      agents: [],
      connections: [],
      metrics: { interactions: 0, emergentBehaviors: 0, efficiency: 0 }
    });
    toast.info('Simulation reset');
  };

  // Simulate interactions
  React.useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setSimulationData(prev => {
        const newConnections = [];
        const updatedAgents = prev.agents.map((agent, i) => {
          // Random movement
          const newPos = agent.position.map((p, idx) => 
            p + (Math.random() - 0.5) * 0.5
          );
          
          // Create connections with nearby agents
          prev.agents.forEach((other, j) => {
            if (i !== j) {
              const distance = Math.sqrt(
                Math.pow(agent.position[0] - other.position[0], 2) +
                Math.pow(agent.position[1] - other.position[1], 2) +
                Math.pow(agent.position[2] - other.position[2], 2)
              );
              if (distance < 5) {
                newConnections.push({ start: agent.position, end: other.position });
              }
            }
          });

          return { ...agent, position: newPos };
        });

        return {
          agents: updatedAgents,
          connections: newConnections,
          metrics: {
            interactions: prev.metrics.interactions + newConnections.length,
            emergentBehaviors: prev.metrics.emergentBehaviors + Math.floor(Math.random() * 2),
            efficiency: Math.min(100, prev.metrics.efficiency + Math.random() * 2)
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Sandbox Simulation Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Design and run complex multi-agent simulations with emergent behaviors
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-black/40 border border-white/10 mb-6">
            <TabsTrigger value="setup" className="data-[state=active]:bg-cyan-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-purple-500/20">
              <Play className="w-4 h-4 mr-2" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-green-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-orange-500/20">
              <Brain className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Environment Parameters
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Simulation Name</label>
                    <Input
                      value={envParams.name}
                      onChange={(e) => setEnvParams({ ...envParams, name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Gravity: {envParams.gravity} m/s²
                    </label>
                    <Slider
                      value={[envParams.gravity]}
                      onValueChange={([v]) => setEnvParams({ ...envParams, gravity: v })}
                      min={0}
                      max={20}
                      step={0.1}
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Resource Density: {envParams.resourceDensity}%
                    </label>
                    <Slider
                      value={[envParams.resourceDensity]}
                      onValueChange={([v]) => setEnvParams({ ...envParams, resourceDensity: v })}
                      min={0}
                      max={100}
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Complexity Level: {envParams.complexity}
                    </label>
                    <Slider
                      value={[envParams.complexity]}
                      onValueChange={([v]) => setEnvParams({ ...envParams, complexity: v })}
                      min={1}
                      max={10}
                      className="bg-white/10"
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Agent Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Agent Count: {agentConfig.count}
                    </label>
                    <Slider
                      value={[agentConfig.count]}
                      onValueChange={([v]) => setAgentConfig({ ...agentConfig, count: v })}
                      min={2}
                      max={20}
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Agent Type</label>
                    <Select
                      value={agentConfig.type}
                      onValueChange={(v) => setAgentConfig({ ...agentConfig, type: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborative">Collaborative</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="exploratory">Exploratory</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Communication</label>
                    <Select
                      value={agentConfig.communication}
                      onValueChange={(v) => setAgentConfig({ ...agentConfig, communication: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Learning Mode</label>
                    <Select
                      value={agentConfig.learning}
                      onValueChange={(v) => setAgentConfig({ ...agentConfig, learning: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="reinforcement">Reinforcement Only</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulation">
            <div className="space-y-6">
              <div className="flex gap-4">
                {!isRunning ? (
                  <Button
                    onClick={() => startSimulation.mutate()}
                    disabled={!userEmail || startSimulation.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Simulation
                  </Button>
                ) : (
                  <Button onClick={stopSimulation} className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetSimulation} variant="outline" className="border-white/20">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Interactions</p>
                      <p className="text-white text-2xl font-bold">{simulationData.metrics.interactions}</p>
                    </div>
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Emergent Behaviors</p>
                      <p className="text-white text-2xl font-bold">{simulationData.metrics.emergentBehaviors}</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Efficiency</p>
                      <p className="text-white text-2xl font-bold">{simulationData.metrics.efficiency.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </Card>
              </div>

              <Card className="bg-black/40 border-white/10 p-2 h-[600px]">
                <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
                  
                  {simulationData.agents.map((agent) => (
                    <Agent3DNode
                      key={agent.id}
                      position={agent.position}
                      color={agent.color}
                      scale={agent.behavior === 'explorer' ? 1.2 : 1}
                    />
                  ))}
                  
                  {simulationData.connections.map((conn, i) => (
                    <Connection3D key={i} start={conn.start} end={conn.end} />
                  ))}
                  
                  <gridHelper args={[20, 20, '#00f5ff', '#333']} />
                  <OrbitControls enableZoom autoRotate={isRunning} autoRotateSpeed={0.5} />
                </Canvas>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="space-y-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Emergent Behavior Analysis
                </h3>
                <div className="space-y-3">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-cyan-400" />
                      <p className="text-cyan-400 font-semibold text-sm">Clustering Detected</p>
                    </div>
                    <p className="text-white/70 text-sm">
                      Agents forming spontaneous groups around resource-rich areas. This indicates
                      effective collaborative behavior emerging without explicit programming.
                    </p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                      <p className="text-purple-400 font-semibold text-sm">Communication Patterns</p>
                    </div>
                    <p className="text-white/70 text-sm">
                      Agent interactions show formation of hub-based communication networks with
                      specialized information brokers emerging naturally.
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 font-semibold text-sm">Optimization Behavior</p>
                    </div>
                    <p className="text-white/70 text-sm">
                      Agents developing efficient pathfinding strategies through trial-and-error learning,
                      showing {simulationData.metrics.efficiency.toFixed(0)}% improvement over initial behavior.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-black/40 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Agent Interaction Matrix</h3>
                  <div className="bg-white/5 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-white/40 text-sm">
                      Heatmap showing communication frequency between agents
                    </p>
                  </div>
                </Card>

                <Card className="bg-black/40 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Performance Trends</h3>
                  <div className="bg-white/5 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-white/40 text-sm">
                      Time-series data of efficiency and emergent behavior count
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {simulations?.map((sim) => (
                <Card key={sim.id} className="bg-black/40 border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold">{sim.name}</h3>
                      <p className="text-white/60 text-sm">
                        {new Date(sim.created_date).toLocaleDateString()} - Status: {sim.status}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-cyan-400 text-sm">
                          {sim.metrics?.interactions || 0} interactions
                        </span>
                        <span className="text-purple-400 text-sm">
                          {sim.metrics?.emergentBehaviors || 0} behaviors
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/20">
                      Load
                    </Button>
                  </div>
                </Card>
              ))}
              {!simulations?.length && (
                <p className="text-white/40 text-center py-12">
                  No simulation history yet. Create your first simulation!
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}