import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ position, accuracy, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    accuracy
  );

  return (
    <Sphere ref={meshRef} args={[0.4, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function MetaLearning3D({ model }) {
  const performance = model?.few_shot_performance || {};
  
  const taskRing1 = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      position: [Math.cos(angle) * 4, 0, Math.sin(angle) * 4],
      accuracy: performance.one_shot_accuracy || 0.65,
      index: i
    };
  });

  const taskRing2 = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      position: [Math.cos(angle) * 6, 0, Math.sin(angle) * 6],
      accuracy: performance.five_shot_accuracy || 0.82,
      index: i + 8
    };
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#8b5cf6" />

      {/* Central meta-learner */}
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Meta-Learning
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center">
        {model?.model_name || 'MAML'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {model?.base_architecture || 'Meta-Learner'}
      </Text>

      {/* Task nodes - 1-shot ring */}
      {taskRing1.map((task, i) => (
        <TaskNode key={`ring1-${i}`} {...task} />
      ))}

      {/* Task nodes - 5-shot ring */}
      {taskRing2.map((task, i) => (
        <TaskNode key={`ring2-${i}`} {...task} />
      ))}

      {/* Performance metrics */}
      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          1-shot: {((performance.one_shot_accuracy || 0.65) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.35} color="#3b82f6" anchorX="center">
          5-shot: {((performance.five_shot_accuracy || 0.82) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.35} color="#8b5cf6" anchorX="center">
          Transfer: {model?.transfer_efficiency || 85}%
        </Text>
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={10}
        maxDistance={25}
      />
    </Canvas>
  );
}