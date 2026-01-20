import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GenerativeCore({ model }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const getColor = () => {
    switch (model.model_architecture) {
      case 'stable_diffusion': return '#a855f7';
      case 'dalle': return '#00f5ff';
      case 'stylegan': return '#ec4899';
      default: return '#3b82f6';
    }
  };

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <MeshDistortMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={0.4}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  );
}

function QualityRings({ metrics }) {
  return (
    <group>
      {Object.entries(metrics || {}).map(([key, value], i) => {
        const radius = 2 + i * 0.5;
        const points = [];
        for (let j = 0; j <= 64; j++) {
          const angle = (j / 64) * Math.PI * 2;
          points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
          ));
        }
        
        return (
          <group key={i}>
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={points.length}
                  array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00f5ff" transparent opacity={0.3} />
            </lineSegments>
            <Text position={[radius + 0.5, 0, 0]} fontSize={0.15} color="white">
              {key}: {typeof value === 'number' ? value.toFixed(2) : value}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function GenerativeStudio3D({ model }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {model && (
          <>
            <Text position={[0, 4, 0]} fontSize={0.5} color="#00f5ff">
              {model.model_name}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.25} color="#ffffff">
              {model.model_architecture.toUpperCase()}
            </Text>
            <Text position={[0, 2.8, 0]} fontSize={0.2} color="#44ff44">
              {model.generation_type.replace('_', ' → ')}
            </Text>
            <Text position={[0, 2.3, 0]} fontSize={0.18} color={
              model.training_status === 'deployed' ? '#44ff44' : '#ffaa00'
            }>
              {model.training_status}
            </Text>

            <GenerativeCore model={model} />
            <QualityRings metrics={model.quality_metrics} />

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                Generations: {model.generations_count}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffffff">
                Avg Time: {model.average_generation_time_ms?.toFixed(0)}ms
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}