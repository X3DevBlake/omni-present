import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Portal({ position, name, color, onClick, active }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered || active) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Portal Ring */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusGeometry args={[1, 0.15, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner Vortex */}
      <Sphere args={[0.85, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          distort={0.4}
          speed={2}
        />
      </Sphere>

      {/* Portal Name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* Particles */}
      {(hovered || active) && (
        <group>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 1.3;
            return (
              <Sphere
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0
                ]}
                args={[0.05, 16, 16]}
              >
                <meshBasicMaterial color={color} />
              </Sphere>
            );
          })}
        </group>
      )}
    </group>
  );
}

function ConnectionLine({ from, to }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  
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
      <lineBasicMaterial color="#6366f1" opacity={0.3} transparent />
    </line>
  );
}

export default function NavigationHubPortal3D({ onNavigate, currentHub }) {
  const hubs = [
    { name: 'AI Labs', path: 'AILabsAdvanced', position: [0, 3, 0], color: '#8b5cf6' },
    { name: 'Banking', path: 'EnhancedBankingHub', position: [3, 1.5, 0], color: '#10b981' },
    { name: 'DeFi', path: 'DeFiHub', position: [3, -1.5, 0], color: '#f59e0b' },
    { name: 'Simulations', path: 'EnhancedSimulationHub', position: [0, -3, 0], color: '#ef4444' },
    { name: 'Agents', path: 'AIManagement', position: [-3, -1.5, 0], color: '#06b6d4' },
    { name: 'World', path: 'World', position: [-3, 1.5, 0], color: '#ec4899' },
  ];

  return (
    <div className="h-[600px] w-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Central Core */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>

        {/* Hub Portals */}
        {hubs.map((hub, idx) => (
          <Portal
            key={idx}
            position={hub.position}
            name={hub.name}
            color={hub.color}
            active={currentHub === hub.path}
            onClick={() => onNavigate(hub.path)}
          />
        ))}

        {/* Connection Lines */}
        {hubs.map((hub, idx) => (
          <ConnectionLine key={idx} from={[0, 0, 0]} to={hub.position} />
        ))}

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}