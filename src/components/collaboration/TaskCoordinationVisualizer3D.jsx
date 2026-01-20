import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ task, position, index }) {
  const nodeRef = useRef();

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.01;
      const offset = Math.sin(state.clock.elapsedTime + index) * 0.1;
      nodeRef.current.position.y = position[1] + offset;
    }
  });

  const progress = task.completion_percentage || 0;
  const color = new THREE.Color();
  color.setHSL(progress / 100 * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <RoundedBox ref={nodeRef} args={[0.6, 0.6, 0.6]} radius={0.05}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
      >
        {task.role}
      </Text>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {Math.round(progress)}%
      </Text>
    </group>
  );
}

function DependencyArrow({ from, to }) {
  const points = React.useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + 0.5,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(20);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.4} />
    </line>
  );
}

export default function TaskCoordinationVisualizer3D({ coordinations }) {
  const activeCoordination = coordinations.find(c => c.status === 'active') || coordinations[0];

  const taskPositions = React.useMemo(() => {
    const tasks = activeCoordination?.assigned_agents || [];
    return tasks.map((_, idx) => {
      const angle = (idx / tasks.length) * Math.PI * 2;
      const radius = 3;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle * 2),
        Math.sin(angle) * radius
      ];
    });
  }, [activeCoordination]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      {activeCoordination && (
        <>
          {/* Central Coordinator */}
          <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.7}
              metalness={0.9}
              roughness={0.1}
            />
          </Sphere>

          <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
            Task Coordination
          </Text>

          <Text position={[0, 2.5, 0]} fontSize={0.15} color="#94a3b8" anchorX="center">
            {activeCoordination.coordination_strategy}
          </Text>

          {/* Task Nodes */}
          {activeCoordination.assigned_agents?.map((task, idx) => (
            <TaskNode
              key={idx}
              task={task}
              position={taskPositions[idx]}
              index={idx}
            />
          ))}

          {/* Dependencies */}
          {activeCoordination.dependencies?.map((dep, idx) => {
            if (dep.depends_on && dep.depends_on.length > 0) {
              const fromIdx = parseInt(dep.task_id) || 0;
              const toIdx = parseInt(dep.depends_on[0]) || 1;
              if (taskPositions[fromIdx] && taskPositions[toIdx]) {
                return (
                  <DependencyArrow
                    key={idx}
                    from={taskPositions[fromIdx]}
                    to={taskPositions[toIdx]}
                  />
                );
              }
            }
            return null;
          })}
        </>
      )}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}