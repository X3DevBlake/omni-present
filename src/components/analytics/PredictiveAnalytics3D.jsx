import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function PredictionCurve({ predictions }) {
  const points = predictions?.slice(0, 24).map((p, i) => 
    new THREE.Vector3(i * 0.3 - 3.5, (p.predicted_value - 100) / 10, 0)
  ) || [];

  const confidenceUpper = predictions?.slice(0, 24).map((p, i) => 
    new THREE.Vector3(i * 0.3 - 3.5, (p.confidence_interval.upper - 100) / 10, 0.2)
  ) || [];

  const confidenceLower = predictions?.slice(0, 24).map((p, i) => 
    new THREE.Vector3(i * 0.3 - 3.5, (p.confidence_interval.lower - 100) / 10, 0.2)
  ) || [];

  return (
    <>
      <Line points={points} color="#00f5ff" lineWidth={3} />
      <Line points={confidenceUpper} color="#a855f7" lineWidth={1} opacity={0.5} transparent />
      <Line points={confidenceLower} color="#a855f7" lineWidth={1} opacity={0.5} transparent />
    </>
  );
}

function AccuracyIndicator({ metrics }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[4, 0, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.8, 0.2, 16, 100]} />
        <meshStandardMaterial
          color="#44ff44"
          emissive="#44ff44"
          emissiveIntensity={metrics?.prediction_accuracy || 0.8}
        />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.3} color="#44ff44">
        {((metrics?.prediction_accuracy || 0) * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function PredictiveAnalytics3D({ analytics }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {analytics && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {analytics.analytics_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {analytics.prediction_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#a855f7">
              Algorithm: {analytics.model_config?.algorithm?.toUpperCase()}
            </Text>

            <PredictionCurve predictions={analytics.predictions} />
            <AccuracyIndicator metrics={analytics.accuracy_metrics} />

            <group position={[-4, 1, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                MAE: {analytics.accuracy_metrics?.mae?.toFixed(2)}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffffff">
                RMSE: {analytics.accuracy_metrics?.rmse?.toFixed(2)}
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.15} color="#44ff44">
                R²: {analytics.accuracy_metrics?.r2_score?.toFixed(3)}
              </Text>
            </group>

            <group position={[0, -3, 0]}>
              <Text fontSize={0.12} color="#00f5ff">
                {analytics.predictions?.length} Predictions Generated
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color={analytics.auto_retrain ? '#44ff44' : '#888888'}>
                {analytics.auto_retrain ? '🔄 Auto-Retrain Enabled' : 'Manual Training'}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}