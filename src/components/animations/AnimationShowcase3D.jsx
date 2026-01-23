import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { AmbientParticleField, HolographicShimmer, EnergyWave } from './EnvironmentalAnimations3D';

export default function AnimationShowcase3D({ animationCount = 700 }) {
  return (
    <Card className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          Animation Showcase
          <Badge className="bg-indigo-500/30 text-indigo-300">
            {animationCount} TOTAL
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <AmbientParticleField count={200} color="#00ffff" />
            <HolographicShimmer />
            <EnergyWave amplitude={1} />
          </Canvas>
        </div>
        
        <div className="mt-4 grid grid-cols-5 gap-2">
          <Badge className="bg-blue-500/30 text-blue-300">200 Micro</Badge>
          <Badge className="bg-purple-500/30 text-purple-300">250 Feature</Badge>
          <Badge className="bg-green-500/30 text-green-300">150 Environmental</Badge>
          <Badge className="bg-yellow-500/30 text-yellow-300">50 Gamification</Badge>
          <Badge className="bg-pink-500/30 text-pink-300">50 AI Feedback</Badge>
        </div>
      </CardContent>
    </Card>
  );
}