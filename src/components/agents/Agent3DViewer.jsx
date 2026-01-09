import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function Agent3DModel({ agent, showBudget }) {
  const agentRef = useRef();
  const budgetRef = useRef();

  useFrame((state) => {
    if (agentRef.current) {
      agentRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (budgetRef.current) {
      budgetRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getStatusColor = () => {
    switch (agent?.status) {
      case 'working': return '#00f5ff';
      case 'shopping': return '#10b981';
      case 'traveling': return '#a855f7';
      case 'learning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const budgetPercentage = (agent?.omni_spent / agent?.omni_budget) || 0;

  return (
    <group ref={agentRef}>
      {/* Agent Body */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Agent Eyes */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, 0.3, 0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>

      {/* Pupils */}
      <Sphere args={[0.08, 16, 16]} position={[-0.3, 0.3, 0.9]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.3, 0.3, 0.9]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      {/* Budget Ring */}
      {showBudget && (
        <group ref={budgetRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <torusGeometry args={[1.5, 0.1, 16, 100, Math.PI * 2 * budgetPercentage]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <torusGeometry args={[1.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>
        </group>
      )}

      {/* Agent Name */}
      {agent?.name && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {agent.name}
        </Text>
      )}

      {/* Status Indicator */}
      {agent?.status && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color={getStatusColor()}
          anchorX="center"
          anchorY="middle"
        >
          {agent.status.toUpperCase()}
        </Text>
      )}

      {/* Orbiting Omni Coins */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <Sphere
            key={i}
            args={[0.15, 16, 16]}
            position={[
              Math.cos(angle) * 2,
              0,
              Math.sin(angle) * 2
            ]}
          >
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.8}
              metalness={0.9}
            />
          </Sphere>
        );
      })}

      <pointLight position={[0, 2, 2]} intensity={1} color={getStatusColor()} />
      <ambientLight intensity={0.5} />
    </group>
  );
}

export default function Agent3DViewer({ agent, height = '400px', showBudget = true }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10" style={{ height }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Agent3DModel agent={agent} showBudget={showBudget} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {showBudget && agent && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Budget Usage</span>
              <span className="text-white font-bold">
                {agent.omni_spent?.toFixed(2) || 0} / {agent.omni_budget?.toFixed(2) || 0} OMNI
              </span>
            </div>
            <div className="bg-black/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(((agent.omni_spent || 0) / (agent.omni_budget || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}