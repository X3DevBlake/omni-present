import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function FeatureBar({ position, feature }) {
  const height = Math.abs(feature.importance_score) * 3;
  const color = feature.contribution_direction === 'positive' ? '#10b981' : '#ef4444';
  
  return (
    <group position={position}>
      <Box args={[0.6, height, 0.6]} position={[0, height/2, 0]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Box>
      <Text position={[0, -0.5, 0]} fontSize={0.2} color="white" anchorX="center" maxWidth={2}>
        {feature.feature_name}
      </Text>
      <Text position={[0, -0.9, 0]} fontSize={0.15} color={color} anchorX="center">
        {(feature.importance_score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function Explainability3D({ report }) {
  const features = report?.feature_importance?.slice(0, 10) || [];

  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      {/* Central model being explained */}
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#60a5fa" 
          emissive="#60a5fa" 
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Model Explainability
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {report?.report_name || 'AI Explanation'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        Interpretability: {report?.interpretability_score || 75}%
      </Text>

      {/* Feature importance bars */}
      {features.map((feature, i) => (
        <FeatureBar
          key={i}
          position={[-8 + i * 1.8, 0, 0]}
          feature={feature}
        />
      ))}

      {/* Decision paths indicator */}
      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {report?.decision_paths?.length || 0} Decision Paths
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          {report?.counterfactual_explanations?.length || 0} Counterfactuals
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}