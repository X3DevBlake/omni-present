import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function ViolationNode({ violation, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
    }
  });

  const severityColors = {
    critical: '#ff0000',
    high: '#ff8800',
    medium: '#ffcc00',
    low: '#4488ff',
  };

  const color = severityColors[violation.severity] || '#888888';
  const size = violation.severity === 'critical' ? 0.8 : violation.severity === 'high' ? 0.6 : 0.4;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Warning pulse ring */}
      {violation.resolution_status === 'open' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size + 0.2, size + 0.4, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}

      <Text
        position={[0, -size - 0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {violation.violation_type?.replace('_', ' ')}
      </Text>
    </group>
  );
}

export default function EthicsDashboard3D({ violations }) {
  const positions = violations.map((_, index) => {
    const angle = (index / violations.length) * Math.PI * 2;
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
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff4444" />

        {/* Central ethics shield */}
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>

        {violations.map((violation, index) => (
          <ViolationNode
            key={violation.id}
            violation={violation}
            position={positions[index]}
            index={index}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {violations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
            <p className="text-white/60">All systems compliant</p>
          </div>
        </div>
      )}
    </div>
  );
}