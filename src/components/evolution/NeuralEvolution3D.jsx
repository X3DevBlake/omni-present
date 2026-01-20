import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import * as THREE from 'three';

function ArchitectureNode({ position, architecture, isEvolved, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });

  const color = isEvolved ? '#10b981' : '#60a5fa';

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          wireframe={!isEvolved}
        />
      </Box>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {architecture.architecture_name}
      </Text>
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.22}
        color={color}
        anchorX="center"
      >
        Score: {architecture.performance_score?.toFixed(2) || 0}
      </Text>
    </group>
  );
}

function EvolutionPath({ start, end }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#8b5cf6"
      lineWidth={3}
      transparent
      opacity={0.6}
      dashed
      dashSize={0.3}
      gapSize={0.1}
    />
  );
}

export default function NeuralEvolution3D({ evolution, onNodeClick }) {
  const parentPos = [-4, 0, 0];
  const evolvedPos = [4, 0, 0];

  return (
    <Canvas camera={{ position: [0, 3, 12], fov: 60 }} style={{ height: '650px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#8b5cf6" />

      {/* Evolution engine core */}
      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#ec4899" 
          emissive="#ec4899" 
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 2.5, 0]} fontSize={0.6} color="white" anchorX="center">
        Neural Evolution
      </Text>
      <Text position={[0, 1.9, 0]} fontSize={0.3} color="#a78bfa" anchorX="center">
        {evolution?.evolution_method || 'neuroevolution'}
      </Text>
      <Text position={[0, 1.4, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        Generation {evolution?.generation || 1}
      </Text>

      {/* Parent architecture */}
      {evolution?.parent_architecture && (
        <ArchitectureNode
          position={parentPos}
          architecture={evolution.parent_architecture}
          isEvolved={false}
          onClick={() => onNodeClick?.('parent')}
        />
      )}

      {/* Evolved architecture */}
      {evolution?.evolved_architecture && (
        <ArchitectureNode
          position={evolvedPos}
          architecture={evolution.evolved_architecture}
          isEvolved={true}
          onClick={() => onNodeClick?.('evolved')}
        />
      )}

      {/* Evolution path */}
      {evolution?.parent_architecture && evolution?.evolved_architecture && (
        <EvolutionPath start={parentPos} end={evolvedPos} />
      )}

      {/* Mutation indicator */}
      <group position={[0, -3, 0]}>
        <Text fontSize={0.3} color="#fbbf24" anchorX="center">
          Mutation: {((evolution?.mutation_rate || 0.1) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.25} color="white" anchorX="center">
          Status: {evolution?.convergence_status || 'evolving'}
        </Text>
      </group>

      <OrbitControls 
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
      />
    </Canvas>
  );
}