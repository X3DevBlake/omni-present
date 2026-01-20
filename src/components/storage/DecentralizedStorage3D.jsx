import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import * as THREE from 'three';

function StorageNode({ position, node, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time * 2 + index) * 0.01;
    }
  });

  const reliabilityColor = new THREE.Color().lerpColors(
    new THREE.Color('#f59e0b'),
    new THREE.Color('#10b981'),
    node.reliability_score
  );

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.7, 0.7, 0.7]}>
        <meshStandardMaterial 
          color={reliabilityColor}
          emissive={reliabilityColor}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Box>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        {node.location}
      </Text>
      <Text position={[0, 0.4, 0]} fontSize={0.15} color={reliabilityColor} anchorX="center">
        {(node.reliability_score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function ReplicationLine({ start, end }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#60a5fa"
      lineWidth={2}
      transparent
      opacity={0.5}
      dashed
      dashSize={0.3}
      gapSize={0.1}
    />
  );
}

export default function DecentralizedStorage3D({ storage }) {
  const nodes = storage?.storage_nodes || [];
  const encrypted = storage?.encryption_enabled;
  const pinned = storage?.pinned;

  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const radius = 5;
    const height = Math.sin(angle * 3) * 2;
    return {
      node,
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      index: i
    };
  });

  const replicationLines = [];
  const center = [0, 0, 0];
  nodePositions.forEach(pos => {
    replicationLines.push({
      start: center,
      end: pos.position
    });
  });

  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#60a5fa" />

      {/* Central content hash */}
      <Sphere args={[1, 64, 64]} position={center}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Decentralized Storage
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.25} color="#8b5cf6" anchorX="center" maxWidth={8}>
        {storage?.content_hash?.slice(0, 20) || 'Content Hash'}...
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.22} color="#60a5fa" anchorX="center">
        Type: {storage?.content_type || 'data'}
      </Text>

      {/* Storage nodes */}
      {nodePositions.map((pos, i) => (
        <StorageNode key={i} {...pos} />
      ))}

      {/* Replication connections */}
      {replicationLines.map((line, i) => (
        <ReplicationLine key={i} {...line} />
      ))}

      {/* Status indicators */}
      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {storage?.replication_factor || 3}x Replicated
        </Text>
        {encrypted && (
          <Text position={[0, -0.6, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
            🔐 Encrypted
          </Text>
        )}
        {pinned && (
          <Text position={[0, -1.2, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
            📌 Permanently Pinned
          </Text>
        )}
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={10}
        maxDistance={25}
      />
    </Canvas>
  );
}