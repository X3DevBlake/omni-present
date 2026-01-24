import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Brain, Users, Zap, Activity, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ObjectiveNode({ objective, position, completed }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.3 : 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <group position={position}>
      <Box args={[0.5, 0.5, 0.5]} scale={pulse}>
        <meshStandardMaterial 
          color={completed ? '#22c55e' : '#3b82f6'}
          emissive={completed ? '#22c55e' : '#3b82f6'}
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </Box>
      <Text position={[0, 0.6, 0]} fontSize={0.1} color="white" maxWidth={2}>
        Obj {objective.priority}
      </Text>
    </group>
  );
}

function TaskAssignmentLine({ from, to, active }) {
  return (
    <Line
      points={[from, to]}
      color={active ? '#8b5cf6' : '#374151'}
      lineWidth={active ? 2 : 1}
      opacity={active ? 0.7 : 0.3}
    />
  );
}

function AgentTaskNode({ position, agent, taskCount }) {
  return (
    <group position={position}>
      <Sphere args={[0.2, 32, 32]}>
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#a78bfa"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text position={[0, -0.4, 0]} fontSize={0.08} color="#a78bfa">
        {taskCount} tasks
      </Text>
    </group>
  );
}

export default function AIMissionCommanderViz3D() {
  const [goal, setGoal] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);
  const queryClient = useQueryClient();

  const { data: missions } = useQuery({
    queryKey: ['missionCommands'],
    queryFn: () => base44.entities.MissionCommand.list('-created_date', 20),
    initialData: []
  });

  const createMissionMutation = useMutation({
    mutationFn: ({ high_level_goal }) => 
      base44.functions.invoke('aiMissionCommander', { 
        high_level_goal,
        environmental_context: { threat_level: 0.3, resource_availability: 0.8 }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['missionCommands']);
      setGoal('');
    }
  });

  const healMutation = useMutation({
    mutationFn: ({ mission_command_id }) =>
      base44.functions.invoke('selfHealingOrchestrator', { mission_command_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['missionCommands']);
    }
  });

  const handleCreateMission = async (e) => {
    e.preventDefault();
    if (goal.trim()) {
      await createMissionMutation.mutateAsync({ high_level_goal: goal });
    }
  };

  const latestMission = missions[0];

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-orange-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-6 h-6 text-orange-400" />
          AI Mission Commander
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateMission} className="mb-4">
          <div className="flex gap-2">
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Define high-level strategic goal..."
              className="bg-black/40 border-orange-500/30 text-white"
            />
            <Button type="submit" disabled={createMissionMutation.isPending}>
              <Brain className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            {/* Central AI Commander */}
            <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#f97316"
                emissive="#f97316"
                emissiveIntensity={0.8}
                metalness={0.9}
              />
            </Sphere>

            {/* Objectives */}
            {latestMission?.ai_defined_objectives?.map((obj, idx) => {
              const angle = (idx / (latestMission.ai_defined_objectives.length || 1)) * Math.PI * 2;
              const radius = 4;
              return (
                <ObjectiveNode
                  key={obj.objective_id}
                  objective={obj}
                  position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                  completed={false}
                />
              );
            })}

            {/* Task Assignments */}
            {latestMission?.task_assignments?.slice(0, 12).map((task, idx) => {
              const angle = (idx / 12) * Math.PI * 2;
              const radius = 7;
              const agentPos = [Math.cos(angle) * radius, Math.sin(idx * 0.5) * 2, Math.sin(angle) * radius];
              
              return (
                <React.Fragment key={task.task_id}>
                  <AgentTaskNode
                    position={agentPos}
                    agent={task}
                    taskCount={1}
                  />
                  <TaskAssignmentLine
                    from={[0, 0, 0]}
                    to={agentPos}
                    active={true}
                  />
                </React.Fragment>
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Missions</span>
            </div>
            <div className="text-2xl font-bold text-white">{missions.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {missions.filter(m => m.mission_status === 'active').length}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Tasks</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestMission?.task_assignments?.length || 0}
            </div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Healed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestMission?.self_healing_events?.length || 0}
            </div>
          </div>
        </div>

        {latestMission && (
          <Button
            onClick={() => healMutation.mutate({ mission_command_id: latestMission.command_id })}
            disabled={healMutation.isPending}
            className="w-full mb-4 bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {healMutation.isPending ? 'Healing...' : 'Trigger Self-Healing'}
          </Button>
        )}

        {latestMission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-2">Current Mission</h3>
            <p className="text-sm text-gray-300 mb-3">{latestMission.high_level_goal}</p>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge className={latestMission.mission_status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                  {latestMission.mission_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Objectives:</span>
                <Badge className="bg-blue-600">{latestMission.ai_defined_objectives?.length || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Threat Level:</span>
                <Badge className="bg-red-600">
                  {Math.round((latestMission.environmental_analysis?.threat_assessment || 0) * 100)}%
                </Badge>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-orange-700">
              <span className="text-gray-400 text-xs block mb-1">AI Reasoning:</span>
              <p className="text-white text-xs leading-relaxed">{latestMission.ai_commander_reasoning}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}