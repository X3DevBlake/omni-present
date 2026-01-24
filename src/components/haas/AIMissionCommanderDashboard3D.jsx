import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Play, RefreshCw, CheckCircle, Activity, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TaskNode({ task, position, status, onClick }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.3 : 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const color = status === 'completed' ? '#22c55e' :
                status === 'in_progress' ? '#3b82f6' : '#f59e0b';

  return (
    <group position={position} onClick={() => onClick(task)}>
      <Box args={[0.3, 0.3, 0.3]} scale={pulse}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.7}
        />
      </Box>
      <Text position={[0, 0.4, 0]} fontSize={0.08} color="white" maxWidth={1.5}>
        {task.task_description?.slice(0, 15)}
      </Text>
    </group>
  );
}

function AdaptationEvent({ position, event }) {
  return (
    <Sphere args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial 
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={1}
      />
    </Sphere>
  );
}

export default function AIMissionCommanderDashboard3D() {
  const [goal, setGoal] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);
  const queryClient = useQueryClient();

  const { data: missions } = useQuery({
    queryKey: ['aiMissions'],
    queryFn: () => base44.entities.AIGeneratedMission.list('-created_date', 20),
    initialData: []
  });

  const generateMission = useMutation({
    mutationFn: ({ goal }) => 
      base44.functions.invoke('aiMissionCommander', {
        high_level_goal: goal,
        swarm_id: 'swarm_001',
        location: 'Mars'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['aiMissions']);
      setGoal('');
    }
  });

  const selfHeal = useMutation({
    mutationFn: ({ mission_id }) => 
      base44.functions.invoke('swarmSelfHealing', { mission_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['aiMissions']);
    }
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (goal.trim()) {
      await generateMission.mutateAsync({ goal });
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
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f59e0b" />
            
            {/* Central Mission Node */}
            {latestMission && (
              <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={0.8}
                  metalness={0.9}
                />
              </Sphere>
            )}

            {/* Task Assignments */}
            {latestMission?.task_assignments?.map((task, idx) => {
              const angle = (idx / latestMission.task_assignments.length) * Math.PI * 2;
              const radius = 4;
              return (
                <React.Fragment key={task.task_id}>
                  <TaskNode
                    task={task}
                    position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                    status={idx < 2 ? 'completed' : idx < 5 ? 'in_progress' : 'pending'}
                    onClick={() => {}}
                  />
                  <Line
                    points={[[0, 0, 0], [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]]}
                    color="#f59e0b"
                    lineWidth={1.5}
                    opacity={0.5}
                  />
                </React.Fragment>
              );
            })}

            {/* Adaptation Events */}
            {latestMission?.adaptation_events?.map((event, idx) => (
              <AdaptationEvent
                key={idx}
                position={[
                  Math.cos(idx * 1.2) * 2,
                  1 + idx * 0.5,
                  Math.sin(idx * 1.2) * 2
                ]}
                event={event}
              />
            ))}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        </div>

        <form onSubmit={handleGenerate} className="mb-4">
          <div className="flex gap-2">
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Define high-level mission goal..."
              className="bg-black/40 border-orange-500/30 text-white"
            />
            <Button type="submit" disabled={generateMission.isPending}>
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </form>

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
              <span className="text-xs text-gray-400">Tasks</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestMission?.task_assignments?.length || 0}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Adaptations</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {latestMission?.adaptation_events?.length || 0}
            </div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(latestMission?.performance_metrics?.completion_percentage || 0)}%
            </div>
          </div>
        </div>

        {latestMission && (
          <>
            <Button
              onClick={() => selfHeal.mutate({ mission_id: latestMission.mission_id })}
              disabled={selfHeal.isPending}
              className="w-full mb-4 bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {selfHeal.isPending ? 'Healing...' : 'AI Self-Healing Scan'}
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-4"
            >
              <h3 className="font-bold text-white mb-2">Current Mission</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Goal:</span>
                  <p className="text-white text-xs">{latestMission.high_level_goal}</p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">AI Reasoning:</span>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {latestMission.ai_commander_reasoning}
                  </p>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Status:</span>
                  <Badge className="bg-blue-600">{latestMission.mission_status}</Badge>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
}