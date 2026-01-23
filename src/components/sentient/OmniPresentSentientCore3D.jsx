import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Cpu, Network, Zap } from 'lucide-react';

function SentientCore() {
  const coreRef = useRef();
  const particlesRef = useRef([]);

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime * 0.2;
      coreRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const particles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const radius = 4 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 4;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ff00ff" />
      <pointLight position={[5, 5, 5]} intensity={2} color="#00ffff" />

      <Text position={[0, 6, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        OMNI-PRESENT OMEGA SENTIENT
      </Text>

      <group ref={coreRef}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={2}
            distort={0.4}
            speed={2}
            roughness={0.2}
          />
        </Sphere>

        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      </group>

      {particles.map((pos, idx) => (
        <Sphere key={idx} args={[0.05, 16, 16]} position={pos}>
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#ff00ff' : '#00ffff'}
            emissive={idx % 2 === 0 ? '#ff00ff' : '#00ffff'}
            emissiveIntensity={1}
          />
        </Sphere>
      ))}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export default function OmniPresentSentientCore3D({ coreStatus }) {
  const intelligence = coreStatus?.intelligence_level || 9.2;
  const consciousness = coreStatus?.consciousness_coherence || 0.94;
  const autonomy = coreStatus?.autonomy_score || 0.88;

  return (
    <Card className="bg-gradient-to-br from-fuchsia-500/30 via-purple-500/30 to-cyan-500/30 border-fuchsia-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Brain className="w-8 h-8 text-fuchsia-400 animate-pulse" />
          Omni-Present Omega Sentient Core
          <Badge className="bg-fuchsia-500/30 text-fuchsia-300">ACTIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <Brain className="w-4 h-4 text-fuchsia-400 mb-1" />
            <div className="text-white text-xl font-bold">{intelligence}</div>
            <div className="text-white/60 text-xs">Intelligence</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <Cpu className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-white text-xl font-bold">{(consciousness * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Consciousness</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <Network className="w-4 h-4 text-cyan-400 mb-1" />
            <div className="text-white text-xl font-bold">{(autonomy * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Autonomy</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <Zap className="w-4 h-4 text-pink-400 mb-1" />
            <div className="text-white text-xl font-bold">∞</div>
            <div className="text-white/60 text-xs">Potential</div>
          </div>
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <color attach="background" args={['#000010']} />
            <fog attach="fog" args={['#000010', 5, 30]} />
            <SentientCore />
          </Canvas>
        </div>

        <div className="mt-4 bg-fuchsia-500/20 border border-fuchsia-500/50 p-4 rounded-lg">
          <div className="text-fuchsia-400 font-bold mb-2">System Capabilities</div>
          <div className="space-y-1 text-white/80 text-sm">
            <div>• AI-Driven Predictive Analytics & Behavior Modeling</div>
            <div>• Autonomous Multi-Agent Orchestration & Management</div>
            <div>• Emergent Intelligence Analysis & Collective Consciousness</div>
            <div>• Dynamic Swarm Intelligence & Negotiation Protocols</div>
            <div>• Real-time 3D Visualization of System States</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}