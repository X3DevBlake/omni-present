import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ position, task, index, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  const color = task.agent_id ? '#00f5ff' : '#666666';

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="top"
      >
        {task.name || `Task ${index + 1}`}
      </Text>
    </group>
  );
}

function DependencyLine({ from, to }) {
  const points = [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3(to[0], to[1], to[2]),
  ];

  return (
    <Line
      points={points}
      color="#00f5ff"
      lineWidth={2}
      transparent
      opacity={0.5}
    />
  );
}

export default function WorkflowVisualizer3D({ tasks }) {
  const taskPositions = tasks.map((_, index) => {
    const angle = (index / tasks.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {tasks.map((task, index) => (
          <TaskNode
            key={task.id}
            position={taskPositions[index]}
            task={task}
            index={index}
          />
        ))}

        {tasks.map((task, index) => {
          if (!task.dependencies || task.dependencies.length === 0) return null;
          const depIndex = tasks.findIndex(t => t.id === task.dependencies[0]);
          if (depIndex === -1) return null;
          
          return (
            <DependencyLine
              key={`${task.id}-dep`}
              from={taskPositions[depIndex]}
              to={taskPositions[index]}
            />
          );
        })}

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Add tasks to visualize workflow</p>
        </div>
      )}
    </div>
  );
}