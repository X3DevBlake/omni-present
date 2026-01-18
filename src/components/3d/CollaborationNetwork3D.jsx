import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

function CollaborationNode({ position, collaboration, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = collaboration.status === 'active' ? '#10b981' : '#6b7280';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {collaboration.collaboration_type}
      </Text>
    </group>
  );
}

function ConnectionLine({ start, end, active }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  return (
    <Line
      points={points}
      color={active ? '#3b82f6' : '#475569'}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
}

export default function CollaborationNetwork3D({ collaborations = [] }) {
  const positions = collaborations.map((_, i) => {
    const angle = (i / collaborations.length) * Math.PI * 2;
    const radius = 3;
    return [
      Math.cos(angle) * radius,
      Math.sin(i * 0.5) * 2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 0, -10]} intensity={0.5} color="#3b82f6" />
      
      {collaborations.map((collab, i) => (
        <CollaborationNode
          key={collab.id}
          position={positions[i]}
          collaboration={collab}
          index={i}
        />
      ))}
      
      {collaborations.map((collab, i) => {
        if (i < collaborations.length - 1) {
          return (
            <ConnectionLine
              key={`line-${i}`}
              start={positions[i]}
              end={positions[i + 1]}
              active={collab.status === 'active'}
            />
          );
        }
        return null;
      })}
      
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}