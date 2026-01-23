import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Brain, Heart, Zap } from 'lucide-react';
import * as THREE from 'three';

function CognitiveOrb({ metric, value, position, color }) {
  const meshRef = useRef();
  const waveRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse * (0.3 + value * 0.7));
    }
    if (waveRef.current) {
      const expand = (clock.elapsedTime % 2) / 2;
      waveRef.current.scale.setScalar(1 + expand * 2);
      waveRef.current.material.opacity = 0.3 * (1 - expand);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={waveRef} args={[0.6, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </Sphere>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={value}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.12} color="white" anchorX="center">
        {metric}
      </Text>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color={color} anchorX="center">
        {(value * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function EmotionalAura({ emotion, intensity, valence }) {
  const auraRef = useRef();

  useFrame(({ clock }) => {
    if (auraRef.current) {
      auraRef.current.rotation.y = clock.elapsedTime * 0.5;
      const breathe = Math.sin(clock.elapsedTime * 2) * 0.3 + 1;
      auraRef.current.scale.setScalar(breathe);
    }
  });

  const emotionColor = valence > 0 ? '#00ff88' : valence < 0 ? '#ff0044' : '#ffaa00';

  return (
    <group>
      <Sphere ref={auraRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial
          color={emotionColor}
          emissive={emotionColor}
          emissiveIntensity={intensity * 0.5}
          transparent
          opacity={0.15}
        />
      </Sphere>
      <Text position={[0, 3, 0]} fontSize={0.3} color={emotionColor} anchorX="center">
        {emotion?.toUpperCase() || 'NEUTRAL'}
      </Text>
    </group>
  );
}

function ThoughtStream({ thoughts }) {
  return (
    <group>
      {thoughts.slice(0, 5).map((thought, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        const radius = 5;
        return (
          <group key={idx} position={[Math.cos(angle) * radius, 3, Math.sin(angle) * radius]}>
            <Sphere args={[0.15, 16, 16]}>
              <meshBasicMaterial color="#ffff00" transparent opacity={thought.intensity || 0.7} />
            </Sphere>
            <Text position={[0, 0.3, 0]} fontSize={0.08} color="#ffff00" anchorX="center">
              {thought.category}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function ConsciousnessMirrorScene({ snapshot }) {
  const cognitive = snapshot?.cognitive_state || {};
  const emotional = snapshot?.emotional_state || {};
  const awareness = snapshot?.awareness_dimensions || {};

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 15, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 7, 0]} fontSize={0.6} color="#ffffff" anchorX="center">
        CONSCIOUSNESS MIRROR
      </Text>

      {/* Central Mind Core */}
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={cognitive.focus_level || 0.7}
          metalness={1}
          roughness={0}
        />
      </Sphere>

      {/* Emotional Aura */}
      <EmotionalAura
        emotion={emotional.primary_emotion}
        intensity={emotional.emotional_intensity || 0.5}
        valence={emotional.valence || 0}
      />

      {/* Cognitive Metrics */}
      <CognitiveOrb
        metric="Focus"
        value={cognitive.focus_level || 0.7}
        position={[-3, 2, 0]}
        color="#00ffff"
      />
      <CognitiveOrb
        metric="Clarity"
        value={cognitive.mental_clarity || 0.75}
        position={[3, 2, 0]}
        color="#ff00ff"
      />
      <CognitiveOrb
        metric="Self-Aware"
        value={awareness.self_awareness || 0.8}
        position={[0, -2, 3]}
        color="#ffaa00"
      />

      {/* Thought Stream */}
      <ThoughtStream thoughts={snapshot?.thought_stream || []} />

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.4} />
    </>
  );
}

export default function ConsciousnessMirrorVisualizer3D({ snapshots = [] }) {
  const latestSnapshot = snapshots[0];
  const avgFocus = snapshots.length > 0
    ? snapshots.reduce((sum, s) => sum + (s.cognitive_state?.focus_level || 0), 0) / snapshots.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Eye className="w-8 h-8 text-blue-400 animate-pulse" />
          Consciousness Mirror - Real-Time Mind State
          <Badge className="bg-blue-500/30 text-blue-300">
            FOCUS: {(avgFocus * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Clarity</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((latestSnapshot?.cognitive_state?.mental_clarity || 0.75) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Emotional</span>
            </div>
            <div className="text-white text-lg font-bold">
              {latestSnapshot?.emotional_state?.primary_emotion || 'Calm'}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Processing</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((latestSnapshot?.cognitive_state?.processing_speed || 0.8) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Awareness</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((latestSnapshot?.awareness_dimensions?.self_awareness || 0.85) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#000a1a']} />
            <fog attach="fog" args={['#000a1a', 10, 50]} />
            <ConsciousnessMirrorScene snapshot={latestSnapshot} />
          </Canvas>
        </div>

        {latestSnapshot?.ai_interpretation && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-blue-500/30">
            <div className="text-blue-400 font-bold mb-2">AI Mind State Analysis:</div>
            <div className="text-white/80 text-sm">{latestSnapshot.ai_interpretation.mental_state_summary}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}