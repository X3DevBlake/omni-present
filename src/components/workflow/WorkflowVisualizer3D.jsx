import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line, Box } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ task, position, isActive, isCompleted }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.03;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = isCompleted ? '#00ff88' : isActive ? '#00f5ff' : '#888888';

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.3}
          transparent
          opacity={0.9}
        />
      </Box>

      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {task.task_name || 'Task'}
      </Text>

      {isCompleted && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#00ff88"
          anchorX="center"
        >
          ✓
        </Text>
      )}
    </group>
  );
}

export default function WorkflowVisualizer3D({ workflow, agents }) {
  const tasks = workflow?.tasks || [];

  const positions = tasks.map((_, index) => {
    if (workflow?.workflow_type === 'parallel') {
      // Parallel layout - horizontal
      return [index * 3 - (tasks.length * 1.5), 0, 0];
    } else {
      // Sequential layout - diagonal
      return [index * 2.5 - (tasks.length * 1.25), 0, -index * 1.5];
    }
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {tasks.map((task, index) => (
          <React.Fragment key={task.task_id || index}>
            <TaskNode
              task={task}
              position={positions[index]}
              isActive={task.status === 'running'}
              isCompleted={task.status === 'completed'}
            />

            {/* Draw connections for sequential workflows */}
            {workflow?.workflow_type === 'sequential' && index < tasks.length - 1 && (
              <Line
                points={[positions[index], positions[index + 1]]}
                color="#00f5ff"
                lineWidth={2}
              />
            )}
          </React.Fragment>
        ))}

        {/* For parallel workflows, show all connecting to start/end */}
        {workflow?.workflow_type === 'parallel' && tasks.length > 0 && (
          <>
            <Sphere args={[0.5, 32, 32]} position={[-tasks.length * 1.5 - 2, 0, 0]}>
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
            </Sphere>
            <Text position={[-tasks.length * 1.5 - 2, -1.2, 0]} fontSize={0.2} color="white">
              START
            </Text>

            {tasks.map((_, index) => (
              <Line
                key={`start-${index}`}
                points={[[-tasks.length * 1.5 - 2, 0, 0], positions[index]]}
                color="#00f5ff"
                lineWidth={1}
                transparent
                opacity={0.5}
              />
            ))}
          </>
        )}

        <OrbitControls enableZoom={true} />
        <gridHelper args={[30, 30, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Select a workflow to visualize</p>
        </div>
      )}
    </div>
  );
}