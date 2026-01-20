import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function NeuralComponent({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color="#00f5ff">
        Neural Network
      </Text>
    </group>
  );
}

function SymbolicComponent({ position, rules }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color="#a855f7">
        Logic Engine
      </Text>
      <Text position={[0, -1.6, 0]} fontSize={0.15} color="#ffffff">
        {rules?.length || 0} rules
      </Text>
    </group>
  );
}

function IntegrationBridge({ from, to }) {
  const points = [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3((from[0] + to[0]) / 2, from[1] + 1, from[2]),
    new THREE.Vector3(to[0], to[1], to[2])
  ];

  return (
    <Line
      points={points}
      color="#ec4899"
      lineWidth={3}
    />
  );
}

function ReasoningMetrics({ capabilities }) {
  if (!capabilities) return null;

  const metrics = [
    { label: 'Deductive', value: capabilities.deductive_reasoning, pos: [0, 2, 0], color: '#44ff44' },
    { label: 'Inductive', value: capabilities.inductive_reasoning, pos: [0, 1.2, 0], color: '#ffaa00' },
    { label: 'Abductive', value: capabilities.abductive_reasoning, pos: [0, 0.4, 0], color: '#ff4444' },
    { label: 'Analogical', value: capabilities.analogical_reasoning, pos: [0, -0.4, 0], color: '#00f5ff' }
  ];

  return (
    <group position={[4, 0, 0]}>
      {metrics.map((m, i) => (
        <group key={i} position={m.pos}>
          <mesh>
            <boxGeometry args={[m.value * 3, 0.2, 0.2]} />
            <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.4} />
          </mesh>
          <Text position={[-2, 0, 0]} fontSize={0.12} color="white">
            {m.label}: {(m.value * 100).toFixed(0)}%
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function NeuroSymbolic3D({ model }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {model && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#ec4899">
              {model.model_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {model.integration_method.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#44ff44">
              Explainability: {(model.explainability_score * 100).toFixed(0)}%
            </Text>

            <NeuralComponent position={[-2, 0, 0]} />
            <SymbolicComponent position={[2, 0, 0]} rules={model.knowledge_base} />
            <IntegrationBridge from={[-2, 0, 0]} to={[2, 0, 0]} />

            <ReasoningMetrics capabilities={model.reasoning_capabilities} />

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                Accuracy: {(model.performance_metrics?.accuracy * 100).toFixed(1)}% | 
                Depth: {model.performance_metrics?.reasoning_depth}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}