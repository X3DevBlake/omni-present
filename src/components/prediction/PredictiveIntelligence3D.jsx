import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

function PredictionNode({ position, prediction, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const confidenceColor = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    prediction.confidence / 100
  );

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={confidenceColor} 
          emissive={confidenceColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {prediction.prediction?.slice(0, 30) || 'Prediction'}
      </Text>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color="#60a5fa"
        anchorX="center"
      >
        {prediction.confidence?.toFixed(0)}% confident
      </Text>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.18}
        color="#a0a0a0"
        anchorX="center"
      >
        {prediction.timeframe}
      </Text>
    </group>
  );
}

function TrendLine({ points, color }) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

export default function PredictiveIntelligence3D({ model, predictions }) {
  const predictionPositions = predictions?.slice(0, 12).map((pred, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 6;
    const height = (pred.impact_score || 50) / 20 - 2.5;
    return {
      prediction: pred,
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ]
    };
  }) || [];

  const trendPoints = predictionPositions.map(p => p.position);

  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#3b82f6" />

      {/* Central prediction engine */}
      <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Cone args={[3, 1, 64]} position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6"
          transparent
          opacity={0.3}
          wireframe
        />
      </Cone>

      <Text position={[0, 3, 0]} fontSize={0.7} color="white" anchorX="center">
        Predictive Intelligence
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {model?.model_name || 'AI Predictor'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        Accuracy: {((model?.accuracy_metrics?.f1_score || 0.85) * 100).toFixed(0)}%
      </Text>

      {/* Prediction nodes */}
      {predictionPositions.map(({ prediction, position }, i) => (
        <PredictionNode
          key={i}
          position={position}
          prediction={prediction}
          index={i}
        />
      ))}

      {/* Trend visualization */}
      {trendPoints.length > 1 && (
        <TrendLine points={trendPoints} color="#60a5fa" />
      )}

      {/* Time horizon indicator */}
      <group position={[0, -4, 0]}>
        <Text fontSize={0.4} color="#fbbf24" anchorX="center">
          Horizon: {model?.prediction_horizon_hours || 24}h
        </Text>
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={15}
        maxDistance={40}
      />
    </Canvas>
  );
}