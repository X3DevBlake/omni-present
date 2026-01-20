import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DataParticles({ count, diversity }) {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10 * diversity;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10 * diversity;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 * diversity;
    }
    return positions;
  }, [count, diversity]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles}>
      <PointMaterial
        transparent
        color="#00f5ff"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function QualityMetrics({ dataset }) {
  if (!dataset?.quality_metrics) return null;

  const metrics = [
    { label: 'FID Score', value: dataset.quality_metrics.fid_score?.toFixed(1), color: '#44ff44' },
    { label: 'Inception', value: dataset.quality_metrics.inception_score?.toFixed(2), color: '#00f5ff' },
    { label: 'Privacy', value: (dataset.quality_metrics.privacy_score * 100).toFixed(1) + '%', color: '#a855f7' },
    { label: 'Similarity', value: (dataset.quality_metrics.statistical_similarity * 100).toFixed(1) + '%', color: '#ec4899' }
  ];

  return (
    <group position={[4, 0, 0]}>
      {metrics.map((metric, i) => (
        <group key={i} position={[0, 1.5 - i * 0.6, 0]}>
          <Text fontSize={0.15} color={metric.color} position={[0, 0.2, 0]}>
            {metric.label}
          </Text>
          <Text fontSize={0.25} color="white" position={[0, -0.2, 0]}>
            {metric.value}
          </Text>
        </group>
      ))}
    </group>
  );
}

function GeneratorCore({ model_type }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getColor = () => {
    switch (model_type) {
      case 'diffusion': return '#a855f7';
      case 'gan': return '#00f5ff';
      case 'vae': return '#ec4899';
      default: return '#3b82f6';
    }
  };

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

export default function SyntheticDataVisualizer3D({ dataset }) {
  const particleCount = Math.min(dataset?.samples_generated || 100, 1000);
  const diversity = dataset?.generation_config?.diversity_score || 0.75;

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {dataset && (
          <>
            <group>
              <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
                {dataset.dataset_name}
              </Text>
              <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
                {dataset.generator_model.toUpperCase()} | {dataset.data_type}
              </Text>
              <Text position={[0, 3.3, 0]} fontSize={0.18} color="#44ff44">
                {dataset.samples_generated}/{dataset.generation_config?.num_samples} Generated
              </Text>
              <Text position={[0, 2.8, 0]} fontSize={0.15} color={dataset.status === 'completed' ? '#44ff44' : '#ffaa00'}>
                Status: {dataset.status}
              </Text>
            </group>

            <GeneratorCore model_type={dataset.generator_model} />
            <DataParticles count={particleCount} diversity={diversity} />
            <QualityMetrics dataset={dataset} />

            {dataset.privacy_preserving && (
              <Text position={[0, -3.5, 0]} fontSize={0.2} color="#a855f7">
                🔒 Privacy Preserving
              </Text>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}