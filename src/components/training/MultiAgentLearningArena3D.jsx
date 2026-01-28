import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere, Trail, Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AgentBot = ({ position, color, name, role, learningRate }) => {
  const mesh = useRef();
  const [target, setTarget] = useState(new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    0.5,
    (Math.random() - 0.5) * 10
  ));

  useFrame((state, delta) => {
    if (mesh.current) {
      // Move towards target
      const step = target.clone().sub(mesh.current.position).normalize().multiplyScalar(2 * delta);
      mesh.current.position.add(step);
      
      // Bobbing animation
      mesh.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;

      // Pick new target if close
      if (mesh.current.position.distanceTo(target) < 0.5) {
        setTarget(new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          0.5,
          (Math.random() - 0.5) * 10
        ));
      }
    }
  });

  return (
    <group>
      <Trail width={0.2} length={8} color={color} attenuation={(t) => t * t}>
        <mesh ref={mesh} position={position}>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </Trail>
      
      {/* Floating Info */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0}>
        <group position={[mesh.current?.position.x || position[0], (mesh.current?.position.y || position[1]) + 1.5, mesh.current?.position.z || position[2]]}>
           <Text fontSize={0.2} color="white" anchorX="center" anchorY="bottom">
            {name}
          </Text>
          <Text position={[0, -0.2, 0]} fontSize={0.15} color="#aaa" anchorX="center" anchorY="bottom">
            LR: {learningRate.toFixed(3)}
          </Text>
        </group>
      </Float>
    </group>
  );
};

const ArenaEnvironment = () => {
  return (
    <group>
      <Grid infiniteGrid fadeDistance={30} fadeStrength={5} cellColor="#444" sectionColor="#888" />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      {/* Central Obelisk */}
      <mesh position={[0, 2, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#00ffff" wireframe />
      </mesh>
      <pointLight position={[0, 2, 0]} color="#00ffff" intensity={2} distance={10} />
    </group>
  );
};

export default function MultiAgentLearningArena3D({ agents = [] }) {
  // Generate mock agents if none provided
  const displayAgents = useMemo(() => {
    if (agents.length > 0) return agents;
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      name: `Agent-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      role: ['Explorer', 'Defender', 'Collector'][Math.floor(Math.random() * 3)],
      color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i],
      learning_rate: Math.random() * 0.01,
      position: [(Math.random() - 0.5) * 8, 0.5, (Math.random() - 0.5) * 8]
    }));
  }, [agents]);

  return (
    <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-lg backdrop-blur-md border border-white/10">
        <h3 className="text-white font-bold mb-2">Active Training Session</h3>
        <div className="space-y-1">
            {displayAgents.map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                    <span>{a.name}</span>
                    <span className="text-gray-500">({a.role})</span>
                </div>
            ))}
        </div>
      </div>

      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ArenaEnvironment />
        
        {displayAgents.map((agent, i) => (
          <AgentBot 
            key={i} 
            position={agent.position} 
            color={agent.color} 
            name={agent.name} 
            role={agent.role}
            learningRate={agent.learning_rate}
          />
        ))}
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}