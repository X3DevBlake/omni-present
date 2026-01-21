import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Trail, Sparkles, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, DollarSign, Users } from 'lucide-react';

function SentientOrb3D({ type, position, label }) {
  const orbRef = useRef();
  const torusRef = useRef();

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      orbRef.current.scale.setScalar(pulse);
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      torusRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  const colors = {
    neural: '#ec4899',
    financial: '#10b981',
    learning: '#a855f7'
  };

  const color = colors[type] || '#00f5ff';

  return (
    <group position={position}>
      <Trail width={0.5} length={20} color={color} attenuation={(t) => t * t}>
        <Sphere ref={orbRef} args={[0.4, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} metalness={0.9} roughness={0.1} />
        </Sphere>
      </Trail>

      <Torus ref={torusRef} args={[0.55, 0.04, 16, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </Torus>

      <Sparkles count={30} scale={1.5} size={3} speed={0.5} color={color} />

      <Text position={[0, -0.8, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export default function OmegaSentientShowcase3D() {
  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-pink-400" />
          Omega Sentient Trinity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px]">
          <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 8, 5]} intensity={1.2} color="#ec4899" />
            <pointLight position={[-5, 8, -5]} intensity={1} color="#10b981" />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#a855f7" />

            <group>
              <SentientOrb3D type="neural" position={[-2.5, 0, 0]} label="NEURAL CHIP" />
              <SentientOrb3D type="financial" position={[2.5, 0, 0]} label="OMEGA FINANCE" />
              <SentientOrb3D type="learning" position={[0, 0, 2.5]} label="LEARNING GUILDS" />
            </group>

            <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}