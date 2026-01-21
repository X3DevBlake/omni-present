import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Brain, Play, Loader2, CheckCircle2, Clock, Users, Zap } from 'lucide-react';

// Task node visualization
function TaskNode3D({ task, position, isActive, isCompleted, onClick }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      if (isActive) {
        nodeRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      }
    }
  });

  const statusColors = {
    pending: '#64748b',
    in_progress: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444',
    blocked: '#8b5cf6'
  };

  const color = statusColors[task.status] || '#64748b';

  return (
    <group position={position} onClick={onClick}>
      <Float speed={isActive ? 3 : 1} floatIntensity={isActive ? 0.3 : 0.1}>
        <Sphere
          ref={nodeRef}
          args={[0.15, 32, 32]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.8 : 0.4}
          />
        </Sphere>
      </Float>

      {/* Progress ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[0.2, 0.23, 32, 1, 0, (task.progress_percentage / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {(hovered || isActive) && (
        <Html position={[0, 0.35, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-40 max-w-52">
            <p className="font-bold mb-1">{task.task_name}</p>
            <p className="text-slate-400 text-xs mb-2">{task.description?.slice(0, 60)}...</p>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color }}>{task.status}</span>
              <span>{task.progress_percentage || 0}%</span>
            </div>
            {task.assigned_to && (
              <p className="text-cyan-400 text-xs mt-1">
                → {task.assigned_to.type}: {task.assigned_to.name || task.assigned_to.id?.slice(0, 8)}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Dependency line
function DependencyLine({ from, to, isActive }) {
  const points = useMemo(() => {
    const midY = Math.max(from[1], to[1]) + 0.3;
    return [
      new THREE.Vector3(...from),
      new THREE.Vector3((from[0] + to[0]) / 2, midY, (from[2] + to[2]) / 2),
      new THREE.Vector3(...to)
    ];
  }, [from, to]);

  return (
    <Line
      points={points}
      color={isActive ? '#00f5ff' : '#475569'}
      lineWidth={isActive ? 2 : 1}
      transparent
      opacity={isActive ? 0.8 : 0.3}
    />
  );
}

// Main plan visualization
function PlanVisualization3D({ plan, onTaskSelect }) {
  const subTasks = plan?.sub_tasks || [];
  
  // Calculate positions in a flow layout
  const taskPositions = useMemo(() => {
    const positions = {};
    const orderGroups = {};
    
    subTasks.forEach(task => {
      const order = task.execution_order || 0;
      if (!orderGroups[order]) orderGroups[order] = [];
      orderGroups[order].push(task);
    });

    Object.entries(orderGroups).forEach(([order, tasks]) => {
      tasks.forEach((task, idx) => {
        const x = parseInt(order) * 2;
        const z = (idx - (tasks.length - 1) / 2) * 1.5;
        positions[task.task_id] = [x, 0.3, z];
      });
    });

    return positions;
  }, [subTasks]);

  // Find dependencies
  const dependencies = useMemo(() => {
    const deps = [];
    subTasks.forEach(task => {
      (task.dependencies || []).forEach(depId => {
        if (taskPositions[depId] && taskPositions[task.task_id]) {
          deps.push({
            from: taskPositions[depId],
            to: taskPositions[task.task_id],
            isActive: task.status === 'in_progress'
          });
        }
      });
    });
    return deps;
  }, [subTasks, taskPositions]);

  return (
    <group>
      <Box args={[12, 0.05, 8]} position={[4, 0, 0]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[12, 24, '#1a2a40', '#0a1525']} position={[4, 0.03, 0]} />

      {/* Dependency lines */}
      {dependencies.map((dep, idx) => (
        <DependencyLine key={idx} {...dep} />
      ))}

      {/* Task nodes */}
      {subTasks.map((task, idx) => (
        <TaskNode3D
          key={task.task_id || idx}
          task={task}
          position={taskPositions[task.task_id] || [idx, 0.3, 0]}
          isActive={task.status === 'in_progress'}
          isCompleted={task.status === 'completed'}
          onClick={() => onTaskSelect && onTaskSelect(task)}
        />
      ))}

      {/* Start marker */}
      <group position={[-1, 0.2, 0]}>
        <Cylinder args={[0.1, 0.1, 0.05, 16]}>
          <meshBasicMaterial color="#10b981" />
        </Cylinder>
        <Html position={[0, 0.2, 0]} center>
          <div className="text-green-400 text-xs font-bold">START</div>
        </Html>
      </group>

      {/* End marker */}
      {subTasks.length > 0 && (
        <group position={[Math.max(...Object.values(taskPositions).map(p => p[0])) + 1, 0.2, 0]}>
          <Cylinder args={[0.1, 0.1, 0.05, 16]}>
            <meshBasicMaterial color="#00f5ff" />
          </Cylinder>
          <Html position={[0, 0.2, 0]} center>
            <div className="text-cyan-400 text-xs font-bold">END</div>
          </Html>
        </group>
      )}
    </group>
  );
}

export default function AutonomousTaskPlannerVisualizer3D() {
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['planner-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: []
  });

  const { data: taskPlans = [] } = useQuery({
    queryKey: ['task-plans'],
    queryFn: () => base44.entities.AutonomousTaskPlan.list('-created_at', 10),
    initialData: [],
    refetchInterval: 3000
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!goal || agents.length === 0) throw new Error('Enter a goal and ensure agents are available');
      const response = await base44.functions.invoke('autonomous-task-planner', {
        agent_id: agents[0].agent_id,
        high_level_goal: goal,
        optimization_priority: 'balanced'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Plan created with ${data.summary?.total_sub_tasks || 0} sub-tasks`);
      setSelectedPlan(data.task_plan);
      setGoal('');
      queryClient.invalidateQueries(['task-plans']);
    }
  });

  const quickGoals = [
    'Prepare the living room for movie night',
    'Set up the home for dinner guests',
    'Create a relaxing evening atmosphere',
    'Prepare for bedtime routine',
    'Morning wake-up sequence'
  ];

  const currentPlan = selectedPlan || taskPlans[0];
  const completedTasks = currentPlan?.sub_tasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = currentPlan?.sub_tasks?.length || 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Autonomous Task Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter a high-level goal (e.g., 'Prepare the house for a dinner party')"
              className="bg-slate-800 border-slate-600 text-white flex-1 min-h-[60px]"
            />
            <Button
              onClick={() => createPlanMutation.mutate()}
              disabled={createPlanMutation.isPending || !goal || agents.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-full"
            >
              {createPlanMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Planning</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> Create Plan</>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickGoals.map((qg, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setGoal(qg)}
                className="text-xs"
              >
                {qg}
              </Button>
            ))}
          </div>

          {currentPlan && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Total Tasks</p>
                <p className="text-white text-xl font-bold">{totalTasks}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</p>
                <p className="text-green-400 text-xl font-bold">{completedTasks}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Time</p>
                <p className="text-white text-xl font-bold">
                  {currentPlan.execution_strategy?.estimated_total_time_minutes || '?'}m
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Users className="w-3 h-3" /> Agents</p>
                <p className="text-white text-xl font-bold">
                  {currentPlan.context_requirements?.required_agents?.length || 1}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {currentPlan ? `Plan: ${currentPlan.high_level_goal}` : 'Task Execution Flow'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Canvas camera={{ position: [6, 5, 8], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

              <PlanVisualization3D plan={currentPlan} onTaskSelect={setSelectedTask} />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedTask && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Badge className={`${selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400' : selectedTask.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>
                {selectedTask.status}
              </Badge>
              {selectedTask.task_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Description</p>
                <p className="text-white">{selectedTask.description}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Assigned To</p>
                <p className="text-cyan-400">{selectedTask.assigned_to?.type}: {selectedTask.assigned_to?.name || selectedTask.assigned_to?.id}</p>
              </div>
              {selectedTask.dependencies?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm">Dependencies</p>
                  <p className="text-white">{selectedTask.dependencies.join(', ')}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-white">{selectedTask.estimated_duration_minutes} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}