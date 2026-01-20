import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function DataPoint({ sample, position, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getColor = () => {
    if (sample.uncertainty_score > 0.7) return '#ff4444';
    if (sample.uncertainty_score > 0.4) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <group position={position} onClick={() => onClick?.(sample)}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15 + sample.uncertainty_score * 0.2]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={sample.uncertainty_score}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text position={[0, -0.4, 0]} fontSize={0.1} color="white">
        {sample.confidence?.toFixed(2)}
      </Text>
    </group>
  );
}

function UncertaintyCurve({ samples }) {
  const sortedSamples = [...(samples || [])].sort((a, b) => b.uncertainty_score - a.uncertainty_score);
  
  return (
    <group position={[-4, 0, 0]}>
      {sortedSamples.slice(0, 10).map((sample, i) => (
        <group key={i} position={[0, -i * 0.4, 0]}>
          <mesh>
            <boxGeometry args={[sample.uncertainty_score * 3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={sample.uncertainty_score > 0.7 ? '#ff4444' : '#ffaa00'}
              emissive={sample.uncertainty_score > 0.7 ? '#ff4444' : '#ffaa00'}
              emissiveIntensity={0.4}
            />
          </mesh>
          <Text position={[-2, 0, 0]} fontSize={0.12} color="white">
            {sample.sample_id}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function ActiveLearningVisualizer3D({ task, samples, onSampleClick }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        {task && (
          <>
            <group>
              <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
                {task.task_name}
              </Text>
              <Text position={[0, 3.3, 0]} fontSize={0.2} color="#ffffff">
                {task.annotated_count}/{task.total_samples} Annotated
              </Text>
              <Text position={[0, 2.8, 0]} fontSize={0.15} color="#44ff44">
                Quality: {(task.quality_metrics?.agreement_score * 100).toFixed(1)}%
              </Text>
            </group>

            <group position={[2, 0, 0]}>
              {samples?.map((sample, i) => {
                const angle = (i / samples.length) * Math.PI * 2;
                const radius = 2 + sample.uncertainty_score;
                return (
                  <DataPoint
                    key={i}
                    sample={sample}
                    position={[
                      Math.cos(angle) * radius,
                      sample.uncertainty_score * 2 - 1,
                      Math.sin(angle) * radius
                    ]}
                    onClick={onSampleClick}
                  />
                );
              })}
            </group>

            <UncertaintyCurve samples={samples} />

            {task.active_learning_config?.enabled && (
              <Text position={[0, -3, 0]} fontSize={0.2} color="#a855f7">
                🎯 Active Learning: {task.active_learning_config.query_strategy}
              </Text>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}