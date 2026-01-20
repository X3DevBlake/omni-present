import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function UncertaintyCloud({ position, entropy }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      meshRef.current.scale.setScalar(pulse * entropy * 5);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
      <meshStandardMaterial 
        color="#a855f7"
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

export default function Bayesian3D({ model }) {
  const entropy = model?.uncertainty_metrics?.prediction_entropy || 0.45;
  const calibration = model?.uncertainty_metrics?.confidence_calibration || 0.91;

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#a855f7" />

      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.7}
          metalness={0.8}
        />
      </Sphere>

      <UncertaintyCloud position={[0, 0, 0]} entropy={entropy} />

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Bayesian Deep Learning
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#3b82f6" anchorX="center">
        {model?.model_name || 'BNN'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#a855f7" anchorX="center">
        {model?.inference_method || 'VI'} • {model?.uncertainty_type || 'epistemic'}
      </Text>

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Calibration: {(calibration * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          OOD Detection: {((model?.out_of_distribution_detection || 0.88) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#a855f7" anchorX="center">
          Samples: {model?.posterior_samples || 100}
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}