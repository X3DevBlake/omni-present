import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Brain, TrendingUp, CheckCircle } from 'lucide-react';

function ActivityNode({ activity, position, index, completed }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current && !completed) {
      ringRef.current.rotation.z = clock.elapsedTime * 2;
    }
  });

  const color = completed ? '#00ff88' : '#00ffff';
  const size = 0.2 + activity.expected_impact * 0.2;

  return (
    <group position={position}>
      {!completed && (
        <mesh ref={ringRef}>
          <torusGeometry args={[size * 2, 0.02, 16, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}

      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={completed ? 1.2 : 0.8}
        />
      </Sphere>

      <Text position={[0, size + 0.4, 0]} fontSize={0.08} color="white" anchorX="center">
        {activity.activity_name?.slice(0, 12)}
      </Text>
      <Text position={[0, -size - 0.3, 0]} fontSize={0.06} color={color} anchorX="center">
        {activity.duration_minutes}min
      </Text>
    </group>
  );
}

function PathwayScene({ pathway }) {
  const activities = pathway?.neural_activities || [];
  const milestones = pathway?.progress_milestones || [];

  const positions = useMemo(() => {
    return activities.map((_, idx) => {
      const progress = idx / Math.max(activities.length - 1, 1);
      const angle = progress * Math.PI * 2;
      const radius = 3 + Math.sin(progress * Math.PI) * 1;
      const height = Math.cos(progress * Math.PI * 2) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [activities]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        AUGMENTATION PATHWAY
      </Text>

      <Text position={[0, 4.2, 0]} fontSize={0.2} color="#00ffff" anchorX="center">
        {pathway?.target_state?.replace(/_/g, ' ').toUpperCase()}
      </Text>

      {/* Path line */}
      {positions.length > 1 && (
        <Line
          points={positions}
          color="#00ffff"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      )}

      {activities.map((activity, idx) => (
        <ActivityNode
          key={idx}
          activity={activity}
          position={positions[idx]}
          index={idx}
          completed={milestones.some(m => m.milestone === activity.activity_name)}
        />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function ConsciousnessAugmentationPathway3D({ pathway, onStartActivity }) {
  const activities = pathway?.neural_activities || [];
  const milestones = pathway?.progress_milestones || [];
  const completed = milestones.length;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
          Consciousness Augmentation Pathway
          <Badge className="bg-cyan-500/30 text-cyan-300">
            {completed}/{activities.length} COMPLETED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Activities</span>
            </div>
            <div className="text-white text-lg font-bold">{activities.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Done</span>
            </div>
            <div className="text-white text-lg font-bold">{completed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Progress</span>
            </div>
            <div className="text-white text-lg font-bold">
              {activities.length > 0 ? ((completed / activities.length) * 100).toFixed(0) : 0}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Effectiveness</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((pathway?.effectiveness_score || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#000a15']} />
            <fog attach="fog" args={['#000a15', 5, 35]} />
            <PathwayScene pathway={pathway || {}} />
          </Canvas>
        </div>

        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, idx) => {
            const isCompleted = milestones.some(m => m.milestone === activity.activity_name);
            return (
              <div key={idx} className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">{activity.activity_name}</span>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Button size="sm" onClick={() => onStartActivity?.(activity)} className="bg-cyan-600 hover:bg-cyan-700">
                      Start
                    </Button>
                  )}
                </div>
                <div className="text-white/60 text-xs">
                  {activity.duration_minutes}min | {activity.frequency} | 
                  Impact: {(activity.expected_impact * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}