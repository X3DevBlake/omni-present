import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Html } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

function AgentHologram({ agent, personality }) {
  const meshRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }

    if (auraRef.current) {
      auraRef.current.rotation.z += 0.01;
      auraRef.current.scale.set(
        1 + Math.sin(state.clock.elapsedTime) * 0.2,
        1 + Math.sin(state.clock.elapsedTime) * 0.2,
        1
      );
    }
  });

  const personalityColor = personality?.personality_snapshot?.communication_style === 'empathetic' 
    ? '#FF00FF' 
    : personality?.personality_snapshot?.communication_style === 'technical'
    ? '#00FFFF'
    : '#00FF00';

  return (
    <group>
      {/* Agent core */}
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={personalityColor}
          emissive={personalityColor}
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Personality aura */}
      <Torus ref={auraRef} args={[1.5, 0.1, 16, 100]}>
        <meshStandardMaterial
          color={personalityColor}
          emissive={personalityColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
        />
      </Torus>

      {/* Floating particles representing traits */}
      {personality?.learned_traits?.slice(0, 8).map((trait, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const radius = 2;
        return (
          <Sphere
            key={idx}
            position={[
              Math.cos(angle) * radius,
              Math.sin(idx) * 0.5,
              Math.sin(angle) * radius
            ]}
            args={[0.1, 8, 8]}
          >
            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
          </Sphere>
        );
      })}

      <Html distanceFactor={15}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-purple-500"
        >
          <div className="text-white text-sm font-semibold">{agent?.name || 'AI Agent'}</div>
          <div className="text-purple-300 text-xs">
            {personality?.learned_traits?.length || 0} traits • v{personality?.version || '1.0'}
          </div>
        </motion.div>
      </Html>
    </group>
  );
}

export default function HolographicAgentPresence3D({ agent, personality }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 left-6 z-50 w-64 h-64"
    >
      <Card className="bg-slate-900/40 backdrop-blur border-purple-500/50 h-full">
        <CardContent className="p-0 h-full">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <color attach="background" args={['transparent']} />
            <AgentHologram agent={agent} personality={personality} />
          </Canvas>
        </CardContent>
      </Card>
    </motion.div>
  );
}