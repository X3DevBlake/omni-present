import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ExperimentNode({ position, experiment, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  const accuracy = experiment.final_metrics?.test_accuracy || 0;
  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    accuracy
  );

  return (
    <Sphere ref={meshRef} args={[0.4, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function ExperimentTracker3D({ experiments }) {
  const sortedExperiments = [...(experiments || [])].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  const nodes = sortedExperiments.slice(0, 20).map((exp, i) => ({
    position: [
      i * 0.8 - 8,
      (exp.final_metrics?.test_accuracy || 0) * 4 - 2,
      0
    ],
    experiment: exp,
    index: i
  }));

  return (
    <Canvas camera={{ position: [0, 3, 12], fov: 60 }} style={{ height: '500px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Text position={[0, 3.5, 0]} fontSize={0.5} color="white" anchorX="center">
        Experiment Timeline
      </Text>

      {nodes.map((node, i) => (
        <ExperimentNode key={i} {...node} />
      ))}

      {nodes.length > 1 && (
        <Line
          points={nodes.map(n => n.position)}
          color="#60a5fa"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      )}

      <Text position={[0, -2.5, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {experiments?.length || 0} Experiments Tracked
      </Text>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}