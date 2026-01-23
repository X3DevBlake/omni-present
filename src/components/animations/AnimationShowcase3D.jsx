import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

function AnimatedParticleSystem({ count = 100 }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    const height = (Math.random() - 0.5) * 5;
    return {
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      color: i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffaa00',
      scale: 0.05 + Math.random() * 0.1
    };
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[p.scale, 16, 16]} position={p.position}>
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={1}
          />
        </Sphere>
      ))}
    </group>
  );
}

function CentralCore() {
  const coreRef = useRef();

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime;
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={coreRef}>
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.5}
        />
      </Sphere>
    </group>
  );
}

function AnimationScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ff00ff" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#00ffff" />

      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        ANIMATION SYSTEM
      </Text>

      <CentralCore />
      <AnimatedParticleSystem count={80} />

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function AnimationShowcase3D({ animationCount = 700 }) {
  const categories = [
    { name: 'Micro-interactions', count: 200, color: 'bg-blue-500/30 text-blue-300' },
    { name: 'Feature-specific', count: 250, color: 'bg-purple-500/30 text-purple-300' },
    { name: 'Environmental', count: 150, color: 'bg-green-500/30 text-green-300' },
    { name: 'Gamification', count: 50, color: 'bg-yellow-500/30 text-yellow-300' },
    { name: 'AI Feedback', count: 50, color: 'bg-pink-500/30 text-pink-300' }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          Animation System Overview
          <Badge className="bg-purple-500/30 text-purple-300 text-lg">
            {animationCount} ANIMATIONS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
              <Zap className="w-4 h-4 text-purple-400 mb-1" />
              <div className="text-white text-xl font-bold">{cat.count}</div>
              <div className="text-white/60 text-xs">{cat.name}</div>
            </div>
          ))}
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#0a0020']} />
            <fog attach="fog" args={['#0a0020', 5, 30]} />
            <AnimationScene />
          </Canvas>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat, idx) => (
            <Badge key={idx} className={cat.color}>
              {cat.name}
            </Badge>
          ))}
        </div>

        <div className="mt-4 bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
          <div className="text-purple-400 font-bold mb-2">Performance Optimizations</div>
          <div className="space-y-1 text-white/80 text-sm">
            <div>• GPU-accelerated particle systems with instanced rendering</div>
            <div>• Dynamic LOD system for 3D models based on viewport distance</div>
            <div>• Web Workers for heavy animation calculations</div>
            <div>• Lazy loading and asset streaming for optimal performance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}