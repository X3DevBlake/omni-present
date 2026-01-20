import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function FeatureNodes({ features }) {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {features?.slice(0, 20).map((feature, i) => {
        const angle = (i / features.length) * Math.PI * 2;
        const radius = 2 + feature.importance_score * 2;
        
        return (
          <group
            key={i}
            position={[
              Math.cos(angle) * radius,
              (feature.correlation_with_target || 0) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <Sphere args={[0.1 + feature.importance_score * 0.2, 16, 16]}>
              <meshStandardMaterial
                color={feature.importance_score > 0.7 ? '#44ff44' : '#00f5ff'}
                emissive={feature.importance_score > 0.7 ? '#44ff44' : '#00f5ff'}
                emissiveIntensity={feature.importance_score}
              />
            </Sphere>
            {feature.importance_score > 0.8 && (
              <Text position={[0, 0.4, 0]} fontSize={0.08} color="white">
                {feature.feature_name}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

function TransformationPipeline({ pipeline }) {
  return (
    <group position={[0, -2.5, 0]}>
      {pipeline?.map((step, i) => (
        <group key={i} position={[i * 1.5 - 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.8]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.4} />
          </mesh>
          <Text position={[0, -0.7, 0]} fontSize={0.1} color="white">
            {step.transformation}
          </Text>
        </group>
      ))}
    </group>
  );
}

function ImprovementBar({ impact }) {
  if (!impact) return null;

  const improvement = impact.improvement_percentage || 0;
  
  return (
    <group position={[4, 1, 0]}>
      <mesh>
        <boxGeometry args={[0.3, (improvement / 10), 0.3]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.2} color="#44ff44">
        +{improvement.toFixed(1)}%
      </Text>
      <Text position={[0, -2, 0]} fontSize={0.12} color="white">
        Performance Gain
      </Text>
    </group>
  );
}

export default function FeatureEngineering3D({ pipeline }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {pipeline && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {pipeline.pipeline_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {pipeline.automation_level.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#a855f7">
              {pipeline.feature_discovery?.auto_discovered_features} features discovered
            </Text>

            <FeatureNodes features={pipeline.generated_features} />
            <TransformationPipeline pipeline={pipeline.transformation_pipeline} />
            <ImprovementBar impact={pipeline.performance_impact} />

            <group position={[-4, -1, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                Selected: {pipeline.feature_selection?.feature_count}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#00f5ff">
                Method: {pipeline.feature_selection?.method}
              </Text>
            </group>

            <group position={[0, -4, 0]}>
              <Text fontSize={0.12} color="#ffffff">
                Processing: {pipeline.computational_cost?.processing_time_ms?.toFixed(0)}ms
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}