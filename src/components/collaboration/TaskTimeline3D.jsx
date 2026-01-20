import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TimelineNode({ position, task, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {task.name}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color={color}
        anchorX="center"
      >
        {task.status}
      </Text>
    </group>
  );
}

function DependencyLine({ from, to }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  return (
    <Line
      points={points}
      color="#a855f7"
      lineWidth={2}
      dashed
      dashScale={5}
    />
  );
}

export default function TaskTimeline3D({ tasks = [], dependencies = [] }) {
  const getTaskColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'blocked': return '#ef4444';
      case 'pending': return '#6b7280';
      default: return '#fbbf24';
    }
  };

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, 5, 5]} intensity={0.8} color="#a855f7" />

        {/* Timeline path */}
        <Line
          points={tasks.map((_, i) => new THREE.Vector3((i - tasks.length / 2) * 2, 0, 0))}
          color="#ffffff"
          lineWidth={1}
          opacity={0.3}
          transparent
        />

        {/* Task nodes */}
        {tasks.map((task, i) => (
          <TimelineNode
            key={i}
            position={[(i - tasks.length / 2) * 2, 0, 0]}
            task={task}
            color={getTaskColor(task.status)}
          />
        ))}

        {/* Dependency connections */}
        {dependencies.map((dep, i) => {
          const fromIndex = tasks.findIndex(t => t.id === dep.from_task);
          const toIndex = tasks.findIndex(t => t.id === dep.to_task);
          
          if (fromIndex !== -1 && toIndex !== -1) {
            return (
              <DependencyLine
                key={i}
                from={[(fromIndex - tasks.length / 2) * 2, 0, 0]}
                to={[(toIndex - tasks.length / 2) * 2, 0, 0]}
              />
            );
          }
          return null;
        })}

        {/* Progress indicator */}
        <Text position={[0, -2, 0]} fontSize={0.3} color="white">
          Timeline Progress
        </Text>
        <Text position={[0, -2.5, 0]} fontSize={0.2} color="#a855f7">
          {tasks.filter(t => t.status === 'completed').length}/{tasks.length} Complete
        </Text>

        <OrbitControls enableZoom={true} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-bold mb-3">Task Status</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-white/80">Completed: {tasks.filter(t => t.status === 'completed').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-white/80">In Progress: {tasks.filter(t => t.status === 'in_progress').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-white/80">Blocked: {tasks.filter(t => t.status === 'blocked').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span className="text-white/80">Pending: {tasks.filter(t => t.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/60 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-purple-400 text-xs">Dependencies: {dependencies.length}</div>
      </div>
    </div>
  );
}