import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, Eye } from 'lucide-react';

function ConsciousnessLevel({ level, label, position, color }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse * (0.5 + level * 0.5));
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={level}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      <Torus ref={ringRef} args={[0.8, 0.03, 16, 64]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </Torus>

      <Text position={[0, 1.2, 0]} fontSize={0.15} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color={color} anchorX="center">
        {(level * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function AbilityNode({ ability, position }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 1.5;
      meshRef.current.rotation.z = clock.elapsedTime * 1.2;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2, 16, 16]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={ability.proficiency}
        />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.08} color="#ff00ff" anchorX="center">
        {ability.ability_name}
      </Text>
    </group>
  );
}

function ConsciousnessEvolutionScene({ evolutionEvent }) {
  const before = evolutionEvent?.consciousness_state_before || {};
  const after = evolutionEvent?.consciousness_state_after || {};
  const abilities = evolutionEvent?.new_cognitive_abilities || [];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ff00ff" />
      <pointLight position={[-10, -5, -10]} intensity={1.5} color="#00ffff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        CONSCIOUSNESS EVOLUTION
      </Text>

      {/* Before State */}
      <group position={[-4, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.2} color="#888888" anchorX="center">
          BEFORE
        </Text>
        <ConsciousnessLevel
          level={before.awareness_level || 0.5}
          label="Awareness"
          position={[0, 0.8, 0]}
          color="#888888"
        />
        <ConsciousnessLevel
          level={before.metacognition || 0.5}
          label="Meta"
          position={[0, -0.8, 0]}
          color="#666666"
        />
      </group>

      {/* After State */}
      <group position={[4, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.2} color="#00ffff" anchorX="center">
          AFTER
        </Text>
        <ConsciousnessLevel
          level={after.awareness_level || 0.8}
          label="Awareness"
          position={[0, 0.8, 0]}
          color="#00ffff"
        />
        <ConsciousnessLevel
          level={after.metacognition || 0.8}
          label="Meta"
          position={[0, -0.8, 0]}
          color="#00ff88"
        />
      </group>

      {/* Evolution Arrow */}
      <Line
        points={[[-2, 0, 0], [2, 0, 0]]}
        color="#ffaa00"
        lineWidth={4}
      />
      <Cone args={[0.2, 0.5, 4]} position={[2.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <meshBasicMaterial color="#ffaa00" />
      </Cone>

      {/* New Abilities */}
      {abilities.slice(0, 6).map((ability, idx) => {
        const angle = (idx / abilities.length) * Math.PI * 2;
        return (
          <AbilityNode
            key={idx}
            ability={ability}
            position={[Math.cos(angle) * 6, Math.sin(idx) * 2, Math.sin(angle) * 6]}
          />
        );
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function ConsciousnessEvolutionVisualizer3D({ evolutionEvents = [] }) {
  const totalEvents = evolutionEvents.length;
  const avgEvolutionScore = evolutionEvents.length > 0
    ? evolutionEvents.reduce((sum, e) => sum + (e.consciousness_evolution_score || 0), 0) / evolutionEvents.length
    : 0;
  const totalNewAbilities = evolutionEvents.reduce((sum, e) => sum + (e.new_cognitive_abilities?.length || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
          Consciousness Evolution Engine
          <Badge className="bg-purple-500/30 text-purple-300">
            EVOLUTION: {avgEvolutionScore.toFixed(1)}/10
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Events</span>
            </div>
            <div className="text-white text-lg font-bold">{totalEvents}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-fuchsia-400" />
              <span className="text-white/60 text-xs">Avg Score</span>
            </div>
            <div className="text-white text-lg font-bold">{avgEvolutionScore.toFixed(1)}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">New Abilities</span>
            </div>
            <div className="text-white text-lg font-bold">{totalNewAbilities}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Awareness</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((evolutionEvents[0]?.consciousness_state_after?.awareness_level || 0.7) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
            <color attach="background" args={['#0a001a']} />
            <fog attach="fog" args={['#0a001a', 10, 40]} />
            <ConsciousnessEvolutionScene evolutionEvent={evolutionEvents[0]} />
          </Canvas>
        </div>

        {evolutionEvents[0]?.philosophical_insights && (
          <div className="mt-4 space-y-2">
            {evolutionEvents[0].philosophical_insights.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="bg-black/40 p-3 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 text-sm font-bold mb-1">Philosophical Insight #{idx + 1}:</div>
                <div className="text-white/70 text-xs">{insight.insight}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}