import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

function ComplianceBar({ audit, position, index }) {
  const barRef = useRef();

  useFrame((state) => {
    if (barRef.current) {
      const targetHeight = (audit.compliance_score / 100) * 3;
      barRef.current.scale.y += (targetHeight - barRef.current.scale.y) * 0.1;
    }
  });

  const score = audit.compliance_score || 0;
  const color = new THREE.Color();
  color.setHSL(score / 100 * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <RoundedBox ref={barRef} args={[0.5, 1, 0.5]} position={[0, 0.5, 0]} radius={0.05}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {audit.compliance_framework?.toUpperCase()}
      </Text>

      <Text
        position={[0, 2, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {Math.round(score)}%
      </Text>
    </group>
  );
}

export default function ComplianceStatusVisualizer3D({ audits }) {
  const positions = [
    [-3, 0, 0],
    [-1.5, 0, 0],
    [0, 0, 0],
    [1.5, 0, 0],
    [3, 0, 0]
  ];

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />

      <Text position={[0, 4, 0]} fontSize={0.35} color="white" anchorX="center">
        Compliance Status
      </Text>

      {audits.slice(0, 5).map((audit, idx) => (
        <ComplianceBar
          key={audit.id}
          audit={audit}
          position={positions[idx] || [0, 0, 0]}
          index={idx}
        />
      ))}

      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe
          opacity={0.2}
          transparent
        />
      </mesh>

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={15}
      />
    </Canvas>
  );
}