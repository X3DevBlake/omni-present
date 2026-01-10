import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function FlowingData({ path, color, bandwidth }) {
  const particlesRef = useRef([]);
  
  useFrame((state) => {
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const progress = (state.clock.elapsedTime * 0.5 + i * 0.2) % 1;
        const point = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...path[0]),
          new THREE.Vector3(...path[1]),
          progress
        );
        particle.position.copy(point);
      }
    });
  });

  const particleCount = Math.ceil(bandwidth / 20);

  return (
    <group>
      {/* Connection line */}
      <Line
        points={path}
        color={color}
        lineWidth={bandwidth / 50}
        transparent
        opacity={0.6}
      />
      
      {/* Flowing particles */}
      {[...Array(particleCount)].map((_, i) => (
        <mesh
          key={i}
          ref={el => particlesRef.current[i] = el}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function NetworkNode({ position, label, traffic }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={traffic / 100}
          metalness={0.8}
        />
      </mesh>
      <Sphere args={[0.3, 16, 16]}>
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
    </group>
  );
}

export default function DataFlowPathways({ networkData }) {
  const nodes = [
    { id: 'us-east', position: [-2, 1, 0], label: 'US East', traffic: 85 },
    { id: 'eu-west', position: [0, 1.5, -1], label: 'EU West', traffic: 92 },
    { id: 'asia-pac', position: [2, 0.5, 1], label: 'Asia Pacific', traffic: 78 },
    { id: 'us-west', position: [-1.5, -1, 1], label: 'US West', traffic: 65 },
    { id: 'africa', position: [0.5, -1.5, -0.5], label: 'Africa', traffic: 45 },
  ];

  const connections = [
    { from: 'us-east', to: 'eu-west', bandwidth: 95, latency: 45 },
    { from: 'eu-west', to: 'asia-pac', bandwidth: 88, latency: 120 },
    { from: 'asia-pac', to: 'us-west', bandwidth: 92, latency: 85 },
    { from: 'us-west', to: 'us-east', bandwidth: 98, latency: 25 },
    { from: 'eu-west', to: 'africa', bandwidth: 65, latency: 65 },
  ];

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
      
      {/* Network Nodes */}
      {nodes.map((node) => (
        <NetworkNode
          key={node.id}
          position={node.position}
          label={node.label}
          traffic={node.traffic}
        />
      ))}

      {/* Data Flow Pathways */}
      {connections.map((conn, i) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) return null;

        const color = conn.bandwidth > 90 ? '#00ff00' : conn.bandwidth > 70 ? '#ffff00' : '#ff0000';

        return (
          <FlowingData
            key={i}
            path={[fromNode.position, toNode.position]}
            color={color}
            bandwidth={conn.bandwidth}
          />
        );
      })}
    </Canvas>
  );
}