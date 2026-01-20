import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function TaskCloud({ numTasks, diversity }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: Math.min(numTasks, 50) }, (_, i) => {
        const angle = (i / numTasks) * Math.PI * 2;
        const radius = 2 + Math.random() * diversity * 2;
        const height = (Math.random() - 0.5) * 3;
        
        return (
          <Sphere
            key={i}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
            args={[0.1, 16, 16]}
          >
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00f5ff"
              emissiveIntensity={0.5}
            />
          </Sphere>
        );
      })}
    </group>
  );
}

function AdaptationBars({ performance }) {
  if (!performance) return null;

  const metrics = [
    { label: '0-shot', value: performance.zero_shot_accuracy, color: '#ff4444' },
    { label: '1-shot', value: performance.one_shot_accuracy, color: '#ffaa00' },
    { label: '5-shot', value: performance.five_shot_accuracy, color: '#44ff44' }
  ];

  return (
    <group position={[4, 0, 0]}>
      {metrics.map((m, i) => (
        <group key={i} position={[0, 1 - i * 0.7, 0]}>
          <mesh>
            <boxGeometry args={[m.value * 3, 0.3, 0.3]} />
            <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.4} />
          </mesh>
          <Text position={[-2, 0, 0]} fontSize={0.15} color="white">
            {m.label}: {(m.value * 100).toFixed(0)}%
          </Text>
        </group>
      ))}
    </group>
  );
}

function MemoryBank({ memory }) {
  return (
    <group position={[-4, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.15} color="#a855f7">
        Episodic
      </Text>
      <Text position={[0, 0.8, 0]} fontSize={0.12} color="white">
        {memory?.episodic_memory_size}
      </Text>

      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, -1.2, 0]} fontSize={0.15} color="#ec4899">
        Semantic
      </Text>
      <Text position={[0, -1.6, 0]} fontSize={0.12} color="white">
        {memory?.semantic_memory_size}
      </Text>
    </group>
  );
}

export default function MetaLearner3D({ agent }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {agent && (
          <>
            <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
              {agent.agent_name}
            </Text>
            <Text position={[0, 3.4, 0]} fontSize={0.25} color="#ffffff">
              {agent.meta_algorithm}
            </Text>
            <Text position={[0, 2.9, 0]} fontSize={0.18} color="#a855f7">
              {agent.task_distribution?.num_tasks_trained} tasks trained
            </Text>

            <TaskCloud 
              numTasks={agent.task_distribution?.num_tasks_trained || 10}
              diversity={agent.task_distribution?.task_diversity || 0.7}
            />
            <AdaptationBars performance={agent.adaptation_performance} />
            <MemoryBank memory={agent.memory_bank} />

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                Sample Efficiency: {(agent.transfer_capabilities?.sample_efficiency * 100).toFixed(0)}%
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffaa00">
                Cross-Domain: {(agent.transfer_capabilities?.cross_domain_transfer * 100).toFixed(0)}%
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}