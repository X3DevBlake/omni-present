import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ position, task, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time + index) * 0.005;
    }
  });

  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    task.performance || 0.8
  );

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Box>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        Task {index + 1}
      </Text>
      <Text position={[0, -1, 0]} fontSize={0.15} color={color} anchorX="center">
        {((task.performance || 0.8) * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function ContinualLearning3D({ learner, onTaskClick }) {
  const tasks = learner?.task_sequence || [];
  const forgettingRate = learner?.catastrophic_forgetting_rate || 15;

  const taskPositions = tasks.slice(0, 12).map((task, i) => ({
    task,
    position: [(i % 4) * 3 - 4.5, Math.floor(i / 4) * 2 - 2, 0],
    index: i
  }));

  return (
    <Canvas camera={{ position: [0, 3, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[0.8, 64, 64]} position={[0, 4, -3]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 5.5, -3]} fontSize={0.6} color="white" anchorX="center">
        Continual Learning
      </Text>
      <Text position={[0, 4.8, -3]} fontSize={0.3} color="#8b5cf6" anchorX="center">
        {learner?.learner_name || 'Lifelong Learner'}
      </Text>
      <Text position={[0, 4.3, -3]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {learner?.learning_strategy || 'EWC'}
      </Text>

      {taskPositions.map((pos, i) => (
        <TaskNode key={i} {...pos} />
      ))}

      <group position={[0, -5, 0]}>
        <Text fontSize={0.35} color={forgettingRate < 20 ? '#10b981' : '#fbbf24'} anchorX="center">
          Forgetting: {forgettingRate.toFixed(1)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Forward Transfer: {((learner?.forward_transfer || 0.23) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
          Buffer: {learner?.memory_buffer?.size || 1000} samples
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}