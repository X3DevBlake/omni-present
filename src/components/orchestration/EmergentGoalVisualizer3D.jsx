import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function GoalNode({ position, goal, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const progress = (goal.progress_percentage || 0) / 100;
      meshRef.current.scale.setScalar(0.5 + progress * 0.5);
      meshRef.current.rotation.y += 0.01;
    }
  });

  const color = goal.status === 'completed' ? '#00ff88' : '#ff8800';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Orbit rings */}
      {Array.from({ length: goal.participating_agents?.length || 0 }).map((_, i) => (
        <AgentOrbit key={i} radius={1.5 + i * 0.3} speed={0.5 + i * 0.2} offset={i * Math.PI / 3} />
      ))}
    </group>
  );
}

function AgentOrbit({ radius, speed, offset }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <Sphere ref={ref} args={[0.15, 16, 16]}>
      <meshBasicMaterial color="#00f5ff" />
    </Sphere>
  );
}

export default function EmergentGoalVisualizer3D({ goals }) {
  const positions = goals.map((_, index) => {
    const angle = (index / Math.max(goals.length, 1)) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5) * 2,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {goals.map((goal, index) => (
          <GoalNode
            key={goal.id}
            position={positions[index]}
            goal={goal}
            index={index}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {goals.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Create emergent goals to visualize collaboration</p>
        </div>
      )}
    </div>
  );
}