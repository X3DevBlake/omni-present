import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cone } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Zap, Users, Target, Network, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function SwarmAgent({ position, agent, assigned, onClick }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p === 1 ? 1.2 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position} onClick={() => onClick(agent)}>
      <Sphere args={[0.3 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={assigned ? '#22c55e' : '#6366f1'}
          emissive={assigned ? '#22c55e' : '#6366f1'}
          emissiveIntensity={assigned ? 0.6 : 0.3}
        />
      </Sphere>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.1}
        color="white"
      >
        {agent.agent_id?.slice(-3)}
      </Text>
    </group>
  );
}

function TaskNode({ position, task, color }) {
  return (
    <group position={position}>
      <Cone args={[0.25, 0.5, 32]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Cone>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.08}
        color="white"
      >
        {task.type}
      </Text>
    </group>
  );
}

function CommunicationLink({ from, to, active }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setOffset(o => (o + 0.05) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <Line
      points={[from, to]}
      color={active ? '#22c55e' : '#4b5563'}
      lineWidth={active ? 2 : 1}
      opacity={active ? 0.8 : 0.3}
      dashed={active}
      dashOffset={-offset}
    />
  );
}

export default function SwarmOrchestrationLayer3D() {
  const [missionObjective, setMissionObjective] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [communicationLinks, setCommunicationLinks] = useState([]);
  const queryClient = useQueryClient();

  const { data: configurations } = useQuery({
    queryKey: ['swarmConfigs'],
    queryFn: () => base44.entities.SwarmConfiguration.list('-created_date', 10),
    initialData: []
  });

  const { data: profiles } = useQuery({
    queryKey: ['agentProfiles'],
    queryFn: () => base44.entities.AgentPersonalizationProfile.list(),
    initialData: []
  });

  const optimizeMutation = useMutation({
    mutationFn: ({ mission, conditions }) => 
      base44.functions.invoke('optimizeSwarmConfiguration', {
        mission_objective: mission,
        environmental_conditions: conditions,
        swarm_id: 'swarm_001'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['swarmConfigs']);
    }
  });

  const allocateMutation = useMutation({
    mutationFn: ({ tasks }) => 
      base44.functions.invoke('autonomousTaskAllocation', {
        swarm_id: 'swarm_001',
        tasks
      }),
    onSuccess: (data) => {
      // Visualize allocations with communication links
      const links = data.data.allocations?.map(a => ({
        from: a.assigned_agent_id,
        to: a.task_id,
        active: true
      })) || [];
      setCommunicationLinks(links);
    }
  });

  const handleOptimize = async () => {
    if (!missionObjective.trim()) return;

    await optimizeMutation.mutateAsync({
      mission: missionObjective,
      conditions: {
        complexity_level: 0.7,
        threat_level: 0.5,
        time_pressure: 0.6
      }
    });
  };

  const handleAllocate = async () => {
    const sampleTasks = [
      { id: 'task_001', type: 'reconnaissance', complexity: 0.6, priority: 1, requires_high_risk: false, requires_cooperation: true },
      { id: 'task_002', type: 'coordination', complexity: 0.8, priority: 2, requires_high_risk: false, requires_cooperation: true },
      { id: 'task_003', type: 'analysis', complexity: 0.5, priority: 1, requires_high_risk: false, requires_cooperation: false }
    ];

    await allocateMutation.mutateAsync({ tasks: sampleTasks });
  };

  const activeConfig = configurations.find(c => c.active) || configurations[0];

  // Calculate agent positions in formation
  const agentPositions = profiles.slice(0, 12).map((profile, idx) => {
    const angle = (idx / profiles.slice(0, 12).length) * Math.PI * 2;
    const radius = 4;
    return {
      profile,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      assigned: activeConfig?.agent_assignments?.some(a => a.agent_id === profile.agent_id)
    };
  });

  // Task positions
  const taskPositions = activeConfig?.agent_assignments?.slice(0, 6).map((assignment, idx) => ({
    task: assignment,
    position: [
      Math.cos(idx * 1.047) * 2,
      Math.sin(idx * 1.047) * 2,
      0
    ],
    color: assignment.priority > 1 ? '#ef4444' : '#3b82f6'
  })) || [];

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-6 h-6 text-indigo-400" />
          AI Swarm Orchestration Layer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* Command Center */}
            <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#8b5cf6" 
                emissive="#8b5cf6" 
                emissiveIntensity={0.7}
                metalness={0.8}
              />
            </Sphere>
            
            {/* Agents */}
            {agentPositions.map(({ profile, position, assigned }) => (
              <React.Fragment key={profile.agent_id}>
                <SwarmAgent
                  position={position}
                  agent={profile}
                  assigned={assigned}
                  onClick={setSelectedAgent}
                />
                <CommunicationLink
                  from={[0, 0, 0]}
                  to={position}
                  active={assigned}
                />
              </React.Fragment>
            ))}

            {/* Tasks */}
            {taskPositions.map(({ task, position, color }) => (
              <TaskNode
                key={task.task_id}
                position={position}
                task={task}
                color={color}
              />
            ))}

            {/* Task-Agent Connections */}
            {activeConfig?.agent_assignments?.map((assignment, idx) => {
              const agentPos = agentPositions.find(ap => ap.profile.agent_id === assignment.agent_id)?.position;
              const taskPos = taskPositions[idx]?.position;
              if (agentPos && taskPos) {
                return (
                  <Line
                    key={assignment.task_id}
                    points={[agentPos, taskPos]}
                    color="#fbbf24"
                    lineWidth={2}
                    opacity={0.6}
                  />
                );
              }
              return null;
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Agents</span>
            </div>
            <div className="text-2xl font-bold text-white">{profiles.length}</div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Assigned</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {activeConfig?.agent_assignments?.length || 0}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Efficiency</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((activeConfig?.optimization_metrics?.predicted_efficiency || 0) * 100)}%
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Topology</span>
            </div>
            <div className="text-lg font-bold text-white">
              {activeConfig?.topology_structure?.slice(0, 4) || 'N/A'}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <Input
            value={missionObjective}
            onChange={(e) => setMissionObjective(e.target.value)}
            placeholder="Enter mission objective..."
            className="bg-black/40 border-indigo-500/30 text-white"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending || !missionObjective.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Optimize Config
            </Button>
            <Button 
              onClick={handleAllocate}
              disabled={allocateMutation.isPending || profiles.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Auto-Allocate Tasks
            </Button>
          </div>
        </div>

        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">Agent: {selectedAgent.agent_id}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Specialization:</span>
                <Badge className="bg-indigo-600">
                  {Math.round((selectedAgent.specialization_score || 0) * 100)}%
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Risk Tolerance:</span>
                <span className="text-white">
                  {Math.round((selectedAgent.behavioral_parameters?.risk_tolerance || 0) * 100)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Cooperation:</span>
                <span className="text-white">
                  {Math.round((selectedAgent.behavioral_parameters?.cooperation_level || 0) * 100)}%
                </span>
              </div>

              {selectedAgent.learned_preferences?.preferred_tasks?.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-1">Preferred Tasks:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.learned_preferences.preferred_tasks.slice(0, 3).map((task, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {task}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mt-4"
          >
            <h3 className="font-bold text-white mb-3">Active Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Mission:</span>
                <span className="text-white text-xs">{activeConfig.mission_objective}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-2 rounded">
                  <span className="text-gray-400 text-xs">Resilience:</span>
                  <span className="text-white font-bold ml-2">
                    {Math.round((activeConfig.optimization_metrics?.resilience_score || 0) * 100)}%
                  </span>
                </div>
                <div className="bg-black/40 p-2 rounded">
                  <span className="text-gray-400 text-xs">Resource Use:</span>
                  <span className="text-white font-bold ml-2">
                    {Math.round((activeConfig.optimization_metrics?.resource_utilization || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}