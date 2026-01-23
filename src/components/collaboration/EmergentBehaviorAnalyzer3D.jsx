import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';

function BehaviorNode({ behavior, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.rotation.y = clock.elapsedTime + index;
    }
  });

  const innovation = behavior.innovation_level || 0.5;
  const color = innovation > 0.8 ? '#00ff88' : innovation > 0.5 ? '#ffaa00' : '#4488ff';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={innovation}
        />
      </Sphere>
      
      <Text position={[0, 0.7, 0]} fontSize={0.08} color="white" anchorX="center">
        {behavior.behavior_type?.slice(0, 15)}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.06} color={color} anchorX="center">
        {(innovation * 100).toFixed(0)}% Novel
      </Text>
    </group>
  );
}

function EmergentBehaviorScene({ behaviors }) {
  const positions = behaviors.map((_, idx) => {
    const angle = (idx / behaviors.length) * Math.PI * 2;
    const radius = 4;
    const height = Math.sin(idx * 0.7) * 2;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        EMERGENT BEHAVIORS
      </Text>

      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
      </Sphere>

      {behaviors.map((behavior, idx) => (
        <React.Fragment key={idx}>
          <BehaviorNode behavior={behavior} position={positions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#ff00ff"
            lineWidth={2}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function EmergentBehaviorAnalyzer3D({ behaviors = [] }) {
  const avgInnovation = behaviors.length > 0
    ? behaviors.reduce((sum, b) => sum + (b.innovation_level || 0), 0) / behaviors.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-pink-500/20 via-fuchsia-500/20 to-purple-500/20 border-pink-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
          Emergent Behavior Analysis
          <Badge className="bg-pink-500/30 text-pink-300">
            {behaviors.length} PATTERNS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <Sparkles className="w-4 h-4 text-pink-400 mb-1" />
            <div className="text-white text-xl font-bold">{behaviors.length}</div>
            <div className="text-white/60 text-xs">Behaviors</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <TrendingUp className="w-4 h-4 text-fuchsia-400 mb-1" />
            <div className="text-white text-xl font-bold">{(avgInnovation * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Innovation</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <Lightbulb className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-white text-xl font-bold">
              {behaviors.filter(b => b.innovation_level > 0.7).length}
            </div>
            <div className="text-white/60 text-xs">Novel</div>
          </div>
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#0a0010']} />
            <fog attach="fog" args={['#0a0010', 5, 30]} />
            <EmergentBehaviorScene behaviors={behaviors} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}