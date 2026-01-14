import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';

function DataNode({ position, label, value, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.2} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.15} color="#888" anchorX="center">
        {value}
      </Text>
    </group>
  );
}

function DataFlow({ start, end, color }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  return (
    <Line points={points} color={color} lineWidth={2} dashed dashScale={20} dashSize={0.1} gapSize={0.05} />
  );
}

function RotatingRing({ radius, count, baseColor }) {
  const groupRef = useRef();
  
  useFrame(() => {
    groupRef.current.rotation.y += 0.005;
  });

  const nodes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        hue: (i / count) * 360
      };
    });
  }, [count, radius]);

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Sphere key={i} position={node.position} args={[0.15, 16, 16]}>
          <meshStandardMaterial 
            color={`hsl(${node.hue}, 70%, 50%)`}
            emissive={`hsl(${node.hue}, 70%, 50%)`}
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
}

export default function Enhanced3DVisualization({ data = [] }) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#000814']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Center Core */}
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#6366f1" 
            emissiveIntensity={0.8}
            wireframe
          />
        </Sphere>

        {/* Data Nodes */}
        <DataNode position={[3, 2, 0]} label="Agents" value="125" color="#60a5fa" />
        <DataNode position={[-3, 2, 0]} label="Tasks" value="842" color="#34d399" />
        <DataNode position={[0, 2, 3]} label="Analytics" value="98%" color="#f59e0b" />
        <DataNode position={[0, 2, -3]} label="Revenue" value="$125K" color="#ec4899" />

        {/* Data Flows */}
        <DataFlow start={[0, 0, 0]} end={[3, 2, 0]} color="#60a5fa" />
        <DataFlow start={[0, 0, 0]} end={[-3, 2, 0]} color="#34d399" />
        <DataFlow start={[0, 0, 0]} end={[0, 2, 3]} color="#f59e0b" />
        <DataFlow start={[0, 0, 0]} end={[0, 2, -3]} color="#ec4899" />

        {/* Rotating Rings */}
        <RotatingRing radius={4} count={12} baseColor="#4f46e5" />
        <RotatingRing radius={6} count={16} baseColor="#7c3aed" />

        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}