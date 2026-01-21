import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Line, Html, Trail, Float, Sparkles, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Zap, Activity, Brain, Loader2, Play, User } from 'lucide-react';
import { toast } from 'sonner';

// Humanoid robot representation
function HumanoidRobot3D({ embodiment, isActive = false }) {
  const robotRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (robotRef.current) {
      const breathing = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      robotRef.current.position.y = breathing;
      
      if (isActive) {
        robotRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      }
    }
  });

  const consciousness = embodiment?.consciousness_embodiment_metrics?.body_awareness || 0.5;
  const color = consciousness > 0.8 ? '#10b981' : consciousness > 0.6 ? '#3b82f6' : '#a855f7';

  return (
    <group
      ref={robotRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Head */}
      <Float speed={1.5} floatIntensity={0.2}>
        <Sphere args={[0.15, 16, 16]} position={[0, 0.8, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
      </Float>

      {/* Neural chip indicator */}
      {embodiment?.neural_chip_connection?.direct_consciousness_link && (
        <Sphere args={[0.05, 8, 8]} position={[0, 0.85, 0]}>
          <meshBasicMaterial color="#ec4899" />
        </Sphere>
      )}

      {/* Torso */}
      <Box args={[0.3, 0.5, 0.2]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </Box>

      {/* Arms */}
      <Cylinder args={[0.04, 0.04, 0.4, 8]} position={[-0.25, 0.35, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.4, 8]} position={[0.25, 0.35, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color={color} />
      </Cylinder>

      {/* Legs */}
      <Cylinder args={[0.06, 0.06, 0.6, 8]} position={[-0.1, -0.15, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      <Cylinder args={[0.06, 0.06, 0.6, 8]} position={[0.1, -0.15, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>

      {/* Consciousness aura */}
      <Trail width={0.8} length={10} color={color} attenuation={(t) => t * t}>
        <Sphere args={[0.7, 16, 16]} position={[0, 0.4, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </Sphere>
      </Trail>

      <Sparkles count={isActive ? 40 : 20} scale={1.5} size={2} speed={0.8} color={color} />

      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-slate-900 border border-purple-500/50 rounded-lg p-3 min-w-48">
            <p className="text-white font-bold text-sm mb-1">{embodiment.embodiment_platform}</p>
            <p className="text-slate-400 text-xs">Battery: {embodiment.current_physical_state?.battery_percentage}%</p>
            <p className="text-purple-400 text-xs">Consciousness: {(consciousness * 100).toFixed(0)}%</p>
          </div>
        </Html>
      )}

      <Text position={[0, -0.7, 0]} fontSize={0.08} color="#ffffff" anchorX="center">
        {embodiment.current_physical_state?.active_task || 'Ready'}
      </Text>
    </group>
  );
}

// Task execution visualization
function TaskExecutionPath3D({ actionSequence = [] }) {
  const pathPoints = actionSequence.map((action, idx) => {
    const angle = (idx / actionSequence.length) * Math.PI * 2;
    return [Math.cos(angle) * 1.5, idx * 0.3, Math.sin(angle) * 1.5];
  });

  return (
    <>
      {pathPoints.length > 1 && (
        <Line
          points={pathPoints}
          color="#00f5ff"
          lineWidth={3}
          transparent
          opacity={0.6}
          dashed
          dashScale={0.5}
        />
      )}
      {pathPoints.map((point, idx) => (
        <Sphere key={idx} args={[0.08, 12, 12]} position={point}>
          <meshBasicMaterial color="#00f5ff" />
        </Sphere>
      ))}
    </>
  );
}

function EmbodimentScene({ embodiments, executionPlan }) {
  return (
    <>
      <gridHelper args={[10, 10, '#334155', '#1e293b']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
      </mesh>

      {embodiments.map((emb, idx) => {
        const angle = (idx / Math.max(embodiments.length, 1)) * Math.PI * 2;
        return (
          <group key={emb.id} position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}>
            <HumanoidRobot3D embodiment={emb} isActive={emb.current_physical_state?.active_task !== 'idle'} />
          </group>
        );
      })}

      {executionPlan?.action_sequence && (
        <TaskExecutionPath3D actionSequence={executionPlan.action_sequence} />
      )}
    </>
  );
}

export default function PhysicalEmbodimentVisualizer3D() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskCommand, setTaskCommand] = useState('');
  const [executionPlan, setExecutionPlan] = useState(null);

  const { data: embodiments = [] } = useQuery({
    queryKey: ['physical-embodiments'],
    queryFn: () => base44.entities.PhysicallyEmbodiedAgent.list('-created_date', 10),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-for-embodiment'],
    queryFn: () => base44.entities.Agent.list('-created_date', 20),
    initialData: []
  });

  const createEmbodimentMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('physical-embodiment-controller', {
        operation: 'create_embodiment',
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['physical-embodiments']);
      toast.success('Physical embodiment created');
    }
  });

  const executeTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('physical-embodiment-controller', {
        operation: 'execute_task',
        embodiment_id: embodiments[0]?.embodiment_id,
        task_command: taskCommand,
        autonomous_mode: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setExecutionPlan(data.execution_plan);
      toast.success(`Task planned - ${(data.execution_plan.success_probability * 100).toFixed(0)}% success`);
    }
  });

  const learningMutation = useMutation({
    mutationFn: async (task) => {
      const response = await base44.functions.invoke('autonomous-embodiment-learning', {
        embodiment_id: embodiments[0]?.embodiment_id,
        task_to_learn: task,
        learning_method: 'reinforcement_learning'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setExecutionPlan(data.learning_plan);
      toast.success(`Learning initiated - ${data.estimated_mastery_hours}h to master`);
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Physical Embodiment Control
            <Badge className="bg-cyan-500/30">{embodiments.length} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {embodiments.slice(0, 3).map((emb) => (
              <div key={emb.id} className="bg-slate-800/60 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-white font-bold text-sm mb-1">{emb.embodiment_platform}</p>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400">Battery: {emb.current_physical_state?.battery_percentage}%</p>
                  <p className="text-cyan-400">Consciousness: {(emb.consciousness_embodiment_metrics?.body_awareness * 100).toFixed(0)}%</p>
                  <Badge className="bg-green-500/30 text-xs">{emb.current_physical_state?.health_status}</Badge>
                </div>
              </div>
            ))}
          </div>

          {embodiments.length === 0 && (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">Create physical embodiment for agent:</p>
              <div className="flex gap-2">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select Agent</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <Button
                  onClick={() => createEmbodimentMutation.mutate(selectedAgent)}
                  disabled={!selectedAgent || createEmbodimentMutation.isPending}
                  className="bg-cyan-600"
                >
                  {createEmbodimentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {embodiments.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-slate-300 text-sm mb-2">Execute physical task:</p>
                <div className="flex gap-2">
                  <Input
                    value={taskCommand}
                    onChange={(e) => setTaskCommand(e.target.value)}
                    placeholder="E.g., 'Pick up the red cube and place it on the table'"
                    className="bg-slate-800 border-slate-600 text-white flex-1"
                  />
                  <Button
                    onClick={() => executeTaskMutation.mutate()}
                    disabled={!taskCommand || executeTaskMutation.isPending}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    {executeTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => learningMutation.mutate(taskCommand)}
                disabled={!taskCommand || learningMutation.isPending}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {learningMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Brain className="w-3 h-3 mr-2" />}
                Learn Task Autonomously
              </Button>
            </div>
          )}

          {executionPlan && (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-300 font-bold text-sm">Task Execution Plan</p>
                  <Badge className="bg-green-500/30">
                    Success: {(executionPlan.success_probability * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs mb-2">
                  {executionPlan.action_sequence?.length} steps • {executionPlan.estimated_completion_minutes} min
                </p>
                <div className="space-y-1">
                  {executionPlan.action_sequence?.slice(0, 4).map((action, idx) => (
                    <p key={idx} className="text-xs text-slate-400">
                      {idx + 1}. {action.step} ({action.duration_seconds}s)
                    </p>
                  ))}
                </div>
              </div>

              {executionPlan.dexterity_training?.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 font-bold text-sm mb-2">Dexterity Learning</p>
                  {executionPlan.dexterity_training.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="text-white text-xs">{skill.micro_skill}</p>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${skill.target_proficiency * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 8, 5]} intensity={1.5} color="#00f5ff" />
              <pointLight position={[-5, 8, -5]} intensity={1.2} color="#a855f7" />
              <spotLight position={[0, 10, 0]} angle={0.6} penumbra={0.5} intensity={1} color="#ffffff" />

              <EmbodimentScene 
                embodiments={embodiments} 
                executionPlan={executionPlan}
              />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}