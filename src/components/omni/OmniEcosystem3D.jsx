import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function EcosystemNode({ position, color, label, scale = 1, orbitRadius = 0 }) {
  const meshRef = useRef();
  const lineRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      {/* Orbit path */}
      {orbitRadius > 0 && (
        <lineSegments>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={64}
              array={new Float32Array(
                Array.from({ length: 64 }).flatMap((_, i) => [
                  Math.cos((i / 64) * Math.PI * 2) * orbitRadius,
                  Math.sin((i / 64) * Math.PI * 2) * orbitRadius,
                  0
                ])
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.2} />
        </lineSegments>
      )}

      {/* Node */}
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1 * scale, 4]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>

      {/* Glow */}
      <mesh position={position} scale={1.3 * scale}>
        <icosahedronGeometry args={[1, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}

export default function OmniEcosystem3D() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0002;
    }
  });

  const nodes = [
    { position: [0, 0, 0], color: '#00f5ff', label: 'Omni Core', scale: 2 },
    { position: [8, 0, 0], color: '#a855f7', label: 'AI Agents', scale: 1.5, orbit: 8 },
    { position: [0, 8, 0], color: '#10b981', label: 'DeFi Hub', scale: 1.5, orbit: 8 },
    { position: [-8, 0, 0], color: '#f59e0b', label: 'Devices', scale: 1.5, orbit: 8 },
    { position: [0, -8, 0], color: '#ef4444', label: 'Analytics', scale: 1.5, orbit: 8 },
    { position: [5.7, 5.7, 0], color: '#ec4899', label: 'Trading', scale: 1.3, orbit: 8 },
    { position: [-5.7, 5.7, 0], color: '#3b82f6', label: 'Research', scale: 1.3, orbit: 8 },
  ];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/40 border border-cyan-500/30">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[15, 15, 15]} intensity={2} color="#00f5ff" />
        <pointLight position={[-15, -15, 15]} intensity={1} color="#a855f7" />

        <group ref={groupRef}>
          {nodes.map((node, idx) => (
            <EcosystemNode
              key={idx}
              position={node.position}
              color={node.color}
              label={node.label}
              scale={node.scale}
              orbitRadius={node.orbit}
            />
          ))}

          {/* Connection lines between nodes */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={nodes.length * 2}
                array={new Float32Array(
                  nodes.slice(1).flatMap((node) => [0, 0, 0, node.position[0], node.position[1], node.position[2]])
                )}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.3} linewidth={2} />
          </lineSegments>
        </group>

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}