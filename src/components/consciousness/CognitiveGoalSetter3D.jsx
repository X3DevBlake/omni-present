import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Brain, Heart, Zap } from 'lucide-react';

function GoalOrb({ metric, target, current, position }) {
  const meshRef = useRef();
  const targetRingRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse * current);
    }
    if (targetRingRef.current) {
      targetRingRef.current.rotation.z = clock.elapsedTime;
    }
  });

  const progress = current / target;
  const color = progress >= 0.9 ? '#00ff88' : progress >= 0.6 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <mesh ref={targetRingRef}>
        <torusGeometry args={[target, 0.05, 16, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>

      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Sphere>

      <Text position={[0, target + 0.5, 0]} fontSize={0.15} color="white" anchorX="center">
        {metric}
      </Text>
      <Text position={[0, -target - 0.5, 0]} fontSize={0.12} color={color} anchorX="center">
        {(progress * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function GoalScene({ goals }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
      <pointLight position={[-10, 0, -10]} intensity={1.5} color="#ff00ff" />
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        COGNITIVE GOALS
      </Text>

      <GoalOrb metric="FOCUS" target={2} current={goals.focus || 1.4} position={[-3, 0, 0]} />
      <GoalOrb metric="CLARITY" target={2} current={goals.clarity || 1.6} position={[3, 0, 0]} />
      <GoalOrb metric="STRESS" target={2} current={goals.stress || 0.8} position={[0, 0, -3]} />
      <GoalOrb metric="EMOTION" target={2} current={goals.emotion || 1.5} position={[0, 0, 3]} />

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function CognitiveGoalSetter3D({ onCreateGoal }) {
  const [goalType, setGoalType] = useState('increase_focus');
  const [targetLevel, setTargetLevel] = useState(80);
  const [timeline, setTimeline] = useState(30);

  const goalConfig = {
    focus: 1.4,
    clarity: 1.6,
    stress: 0.8,
    emotion: 1.5
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Target className="w-8 h-8 text-blue-400 animate-pulse" />
          Cognitive Goal Setter
          <Badge className="bg-blue-500/30 text-blue-300">PERSONALIZED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
              <color attach="background" args={['#000a10']} />
              <fog attach="fog" args={['#000a10', 5, 30]} />
              <GoalScene goals={goalConfig} />
            </Canvas>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-white flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                Goal Type
              </label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger className="bg-black/60 border-blue-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase_focus">Increase Focus</SelectItem>
                  <SelectItem value="reduce_stress">Reduce Stress</SelectItem>
                  <SelectItem value="improve_clarity">Improve Clarity</SelectItem>
                  <SelectItem value="enhance_memory">Enhance Memory</SelectItem>
                  <SelectItem value="boost_creativity">Boost Creativity</SelectItem>
                  <SelectItem value="emotional_balance">Emotional Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Target Level
                </label>
                <span className="text-cyan-400">{targetLevel}%</span>
              </div>
              <Slider
                value={[targetLevel]}
                onValueChange={([v]) => setTargetLevel(v)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Timeline (Days)
                </label>
                <span className="text-green-400">{timeline}</span>
              </div>
              <Slider
                value={[timeline]}
                onValueChange={([v]) => setTimeline(v)}
                min={7}
                max={90}
                step={1}
              />
            </div>

            <Button
              onClick={() => onCreateGoal?.({ goalType, targetLevel: targetLevel / 100, timeline })}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Cognitive Goal
            </Button>

            <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
              <div className="text-blue-400 font-bold text-sm mb-1">AI Analysis</div>
              <div className="text-white/70 text-xs">
                Based on your current state, achieving this goal is projected to take {timeline} days with 
                87% probability of success using recommended interventions.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}