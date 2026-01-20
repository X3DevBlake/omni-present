import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function LearningNode({ node, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  const accuracy = node.local_model_accuracy || 0.5;
  const size = 0.3 + accuracy * 0.5;
  const color = accuracy > 0.9 ? '#10b981' : accuracy > 0.8 ? '#fbbf24' : '#3b82f6';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {node.node_name}
      </Text>
      
      <Text
        position={[0, -size - 0.3, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {(accuracy * 100).toFixed(1)}%
      </Text>
      
      <Text
        position={[0, -size - 0.6, 0]}
        fontSize={0.08}
        color="#64748b"
        anchorX="center"
      >
        {node.local_data_size.toLocaleString()} samples
      </Text>
    </group>
  );
}

export default function FederatedLearningNetwork3D({ nodes = [] }) {
  const positions = React.useMemo(() => {
    return nodes.map((_, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2;
      const radius = 4;
      
      return [
        Math.cos(angle) * radius,
        Math.sin(idx * 0.5) * 1.5,
        Math.sin(angle) * radius
      ];
    });
  }, [nodes]);
  
  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No federated learning nodes</p>
      </div>
    );
  }
  
  const avgAccuracy = nodes.reduce((sum, n) => sum + (n.local_model_accuracy || 0), 0) / nodes.length;
  
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Central aggregation server */}
      <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      <Text position={[0, 0, 0]} fontSize={0.2} color="white" anchorX="center">
        GLOBAL
      </Text>
      
      {/* Learning nodes */}
      {nodes.map((node, idx) => (
        <React.Fragment key={node.id || idx}>
          <LearningNode node={node} position={positions[idx]} />
          
          {/* Connection to global server */}
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#00f5ff"
            lineWidth={2}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}
      
      <Text
        position={[0, 6, -6]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Federated Learning Network
      </Text>
      
      <Text
        position={[0, 5.3, -6]}
        fontSize={0.25}
        color="#10b981"
        anchorX="center"
      >
        Global Accuracy: {(avgAccuracy * 100).toFixed(2)}%
      </Text>
      
      <Text
        position={[0, 4.9, -6]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="center"
      >
        {nodes.length} Distributed Nodes
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}