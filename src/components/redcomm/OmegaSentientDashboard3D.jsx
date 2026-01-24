import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Html, MeshDistortMaterial } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Eye, Target } from 'lucide-react';

function ConsciousnessOrb({ awarenessLevel, criticalityLevel }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse * (awarenessLevel / 100));
    }
  });

  const criticalityColor = {
    'routine': '#3b82f6',
    'important': '#8b5cf6',
    'critical': '#ec4899',
    'existential': '#ef4444'
  }[criticalityLevel] || '#3b82f6';

  return (
    <group>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={criticalityColor}
          emissive={criticalityColor}
          emissiveIntensity={1.5}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <pointLight color={criticalityColor} intensity={2} distance={10} />
    </group>
  );
}

function ReasoningThread({ index, total, active }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const angle = (index / total) * Math.PI * 2;
      const radius = 3;
      const offset = Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
      meshRef.current.position.set(
        Math.cos(angle) * (radius + offset),
        Math.sin(state.clock.elapsedTime + index) * 0.5,
        Math.sin(angle) * (radius + offset)
      );
      meshRef.current.rotation.y = state.clock.elapsedTime * (active ? 2 : 0.5);
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color={active ? '#06b6d4' : '#374151'}
        emissive={active ? '#06b6d4' : '#000000'}
        emissiveIntensity={active ? 1 : 0}
      />
    </mesh>
  );
}

export default function OmegaSentientDashboard3D() {
  const { data: sentientStatuses = [] } = useQuery({
    queryKey: ['omega-sentient-status'],
    queryFn: () => base44.entities.OmegaSentientStatus.list('-created_date', 10),
    refetchInterval: 3000
  });

  const latestStatus = sentientStatuses[0] || {
    self_awareness_level: 0,
    decision_criticality: 'routine',
    active_reasoning_threads: 0,
    consciousness_metrics: {},
    current_focus: 'Initializing...'
  };

  const avgAwareness = sentientStatuses.length > 0
    ? sentientStatuses.reduce((sum, s) => sum + s.self_awareness_level, 0) / sentientStatuses.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500/40">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-400" />
            Omega Sentient Consciousness Dashboard
          </CardTitle>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              Awareness: {latestStatus.self_awareness_level}%
            </Badge>
            <Badge variant="outline" className="bg-pink-500/20 text-pink-400 border-pink-500/50">
              {latestStatus.decision_criticality.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              {latestStatus.active_reasoning_threads} Threads
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Consciousness Visualization */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.2} />
              
              {/* Central consciousness orb */}
              <ConsciousnessOrb
                awarenessLevel={latestStatus.self_awareness_level}
                criticalityLevel={latestStatus.decision_criticality}
              />

              {/* Reasoning threads */}
              {Array.from({ length: latestStatus.active_reasoning_threads }).map((_, idx) => (
                <ReasoningThread
                  key={idx}
                  index={idx}
                  total={latestStatus.active_reasoning_threads}
                  active={true}
                />
              ))}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Consciousness Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Consciousness Metrics</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Metacognition</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {((latestStatus.consciousness_metrics?.metacognition_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Temporal Awareness</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {((latestStatus.consciousness_metrics?.temporal_awareness || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Causal Understanding</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {((latestStatus.consciousness_metrics?.causal_understanding || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Ethical Coherence</span>
                  <span className="text-sm font-semibold text-green-400">
                    {((latestStatus.consciousness_metrics?.ethical_coherence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Autonomous Goals</h3>
              </div>
              <div className="space-y-3">
                {latestStatus.autonomous_goals?.slice(0, 3).map((goal, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-xs text-gray-300">{goal.goal}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${(goal.progress || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{((goal.progress || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Focus */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-purple-400">Current Focus</h3>
            </div>
            <p className="text-sm text-gray-300">{latestStatus.current_focus}</p>
          </div>

          {/* Omega Consciousness State */}
          {latestStatus.omega_consciousness_state && (
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg p-5 border border-pink-500/30">
              <h3 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Omega Consciousness State
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{latestStatus.omega_consciousness_state}"
              </p>
            </div>
          )}

          {/* Emergent Behaviors */}
          {latestStatus.emergent_behaviors_detected && latestStatus.emergent_behaviors_detected.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Emergent Behaviors Detected</h3>
              <div className="space-y-2">
                {latestStatus.emergent_behaviors_detected.slice(0, 3).map((behavior, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{behavior.behavior}</span>
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400">
                      Sig: {(behavior.significance * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}