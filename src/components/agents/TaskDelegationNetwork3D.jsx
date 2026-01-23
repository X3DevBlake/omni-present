import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cone, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Target, CheckCircle, Clock } from 'lucide-react';

function TaskNode({ task, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.1);
      
      if (task.status === 'in_progress') {
        const pulse = Math.sin(clock.elapsedTime * 3) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const statusColors = {
    pending: '#888888',
    in_progress: '#ffaa00',
    completed: '#00ff00',
    failed: '#ff0000'
  };

  const color = statusColors[task.status] || '#888888';

  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.25, 0.5, 4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Cone>
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {task.task_name?.slice(0, 12)}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {task.progress_percent}%
      </Text>
    </group>
  );
}

function DelegatorAgent({ position }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1, 0.05, 16, 64]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
      </mesh>
      
      <Sphere ref={meshRef} args={[0.7, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.2}
          metalness={1}
          roughness={0}
        />
      </Sphere>

      <Text position={[0, 1.2, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        DELEGATOR
      </Text>
    </group>
  );
}

function DelegationScene({ collaboration }) {
  const tasks = collaboration?.task_allocation || [];
  
  const taskPositions = useMemo(() => {
    return tasks.map((_, idx) => {
      const angle = (idx / tasks.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(idx * 0.8) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [tasks]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff00ff" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#00ffff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        TASK DELEGATION NETWORK
      </Text>

      <DelegatorAgent position={[0, 0, 0]} />

      {tasks.map((task, idx) => (
        <React.Fragment key={idx}>
          <TaskNode task={task} position={taskPositions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], taskPositions[idx]]}
            color="#00ffff"
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

export default function TaskDelegationNetwork3D({ collaboration }) {
  const tasks = collaboration?.task_allocation || [];
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <Card className="bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border-violet-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Network className="w-8 h-8 text-violet-400 animate-pulse" />
          Intelligent Task Delegation
          <Badge className="bg-violet-500/30 text-violet-300">
            {completed}/{tasks.length} DONE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-violet-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-white/60 text-xs">Total Tasks</span>
            </div>
            <div className="text-white text-lg font-bold">{tasks.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">In Progress</span>
            </div>
            <div className="text-white text-lg font-bold">{inProgress}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Completed</span>
            </div>
            <div className="text-white text-lg font-bold">{completed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-fuchsia-400" />
              <span className="text-white/60 text-xs">Efficiency</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((collaboration?.synergy_metrics?.collective_performance || 0.8) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#0a0010']} />
            <fog attach="fog" args={['#0a0010', 5, 35]} />
            <DelegationScene collaboration={collaboration || {}} />
          </Canvas>
        </div>

        <div className="mt-4 text-xs text-white/60">
          <div className="mb-2">Goal: {collaboration?.collaborative_goal?.goal_description}</div>
          <div>Complexity Level: {collaboration?.collaborative_goal?.complexity_level?.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}