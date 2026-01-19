import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function LiveMetricDisplay({ position, label, value, trend, color = '#00f5ff' }) {
  const groupRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01;
    }
  });

  const particles = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      positions.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 2,
        z: Math.sin(angle) * radius,
      });
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Central metric sphere */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Metric label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Value */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {value}
      </Text>

      {/* Trend indicator */}
      {trend && (
        <Text
          position={[0, -1.3, 0]}
          fontSize={0.2}
          color={trend > 0 ? '#00ff88' : '#ff4444'}
          anchorX="center"
          anchorY="middle"
        >
          {trend > 0 ? '+' : ''}{trend}%
        </Text>
      )}

      {/* Particle cloud */}
      <group ref={particlesRef}>
        {particles.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function DataFlowBeam({ start, end, color = '#00f5ff', speed = 1 }) {
  const lineRef = useRef();
  const particleRef = useRef();

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.elapsedTime * speed) % 1;
      const pos = new THREE.Vector3(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
      particleRef.current.position.copy(pos);
    }
  });

  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ];

  return (
    <>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </line>

      <mesh ref={particleRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}