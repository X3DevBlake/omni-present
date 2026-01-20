import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function PipelineStage({ stage, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    }
  });

  const getColor = () => {
    if (stage.error_rate > 0.01) return '#ff4444';
    if (stage.error_rate > 0.005) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {stage.stage_type}
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.07} color="#00f5ff">
        {stage.records_processed}
      </Text>
    </group>
  );
}

function DataFlow({ stages }) {
  return (
    <>
      {stages?.map((_, i) => {
        if (i === stages.length - 1) return null;
        
        const points = [
          new THREE.Vector3(i * 2 - 3, 0, 0),
          new THREE.Vector3((i + 1) * 2 - 3, 0, 0)
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color="#00f5ff"
            lineWidth={2}
          />
        );
      })}
    </>
  );
}

export default function DataPipeline3D({ pipeline }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {pipeline && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {pipeline.pipeline_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {pipeline.pipeline_type.toUpperCase()} Pipeline
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={
              pipeline.status === 'running' ? '#44ff44' : '#ffaa00'
            }>
              Status: {pipeline.status}
            </Text>

            <DataFlow stages={pipeline.stages} />

            {pipeline.stages?.map((stage, i) => (
              <PipelineStage
                key={i}
                stage={stage}
                position={[i * 2 - 3, 0, 0]}
                index={i}
              />
            ))}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {pipeline.throughput?.records_per_second?.toFixed(0)} rec/s
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#00f5ff">
                Quality: {(pipeline.quality_metrics?.data_accuracy * 100).toFixed(1)}%
              </Text>
              {pipeline.auto_scaling && (
                <Text position={[0, -0.8, 0]} fontSize={0.12} color="#a855f7">
                  🔄 Auto-Scaling Enabled
                </Text>
              )}
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}