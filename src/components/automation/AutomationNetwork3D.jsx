import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AutomationNode({ automation, position, index }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      nodeRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const successRate = automation.execution_stats?.total_executions > 0
    ? automation.execution_stats.success_count / automation.execution_stats.total_executions
    : 1;

  const color = new THREE.Color();
  color.setHSL(successRate * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.4, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={automation.is_active ? color : '#475569'}
          emissive={automation.is_active ? color : '#1e293b'}
          emissiveIntensity={automation.is_active ? 0.6 : 0.2}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {automation.rule_name?.substring(0, 15)}
      </Text>

      {hovered && (
        <Text
          position={[0, 0.7, 0]}
          fontSize={0.1}
          color="#22d3ee"
          anchorX="center"
        >
          {automation.execution_stats?.total_executions || 0} executions
        </Text>
      )}

      {/* Status Ring */}
      {automation.is_active && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.03, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function DependencyLine({ from, to, strength }) {
  const points = React.useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + 0.8,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(30);
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
      <lineBasicMaterial
        color="#fbbf24"
        transparent
        opacity={0.4 * strength}
      />
    </line>
  );
}

export default function AutomationNetwork3D({ automations }) {
  const positions = React.useMemo(() => {
    return automations.map((_, idx) => {
      const angle = (idx / automations.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(angle * 2) * 1;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [automations]);

  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />

      {/* Central Orchestrator */}
      <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 2, 0]} fontSize={0.35} color="white" anchorX="center">
        Automation Network
      </Text>

      {/* Automation Nodes */}
      {automations.map((automation, idx) => (
        <AutomationNode
          key={automation.id}
          automation={automation}
          position={positions[idx]}
          index={idx}
        />
      ))}

      {/* Dependency Lines */}
      {automations.map((_, idx) => {
        if (idx < automations.length - 1) {
          return (
            <DependencyLine
              key={`dep-${idx}`}
              from={positions[idx]}
              to={positions[idx + 1]}
              strength={0.7}
            />
          );
        }
        return null;
      })}

      <OrbitControls
        enableZoom={true}
        minDistance={6}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}