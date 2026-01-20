import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function ResourceBar({ label, current, optimized, position, color }) {
  return (
    <group position={position}>
      <mesh position={[-1, 0, 0]}>
        <boxGeometry args={[current * 0.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[optimized * 0.5, 0.3, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.12} color="white">
        {label}
      </Text>
      <Text position={[-1, 0.5, 0]} fontSize={0.1} color="#ff8800">
        Current: {current}
      </Text>
      <Text position={[1, 0.5, 0]} fontSize={0.1} color={color}>
        Optimized: {optimized}
      </Text>
    </group>
  );
}

function SavingsIndicator({ savings }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={[0, 2, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.2, 16, 100]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.5} color="#44ff44">
        -{savings.toFixed(0)}%
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.15} color="white">
        Cost Savings
      </Text>
    </group>
  );
}

export default function ResourceOptimization3D({ optimization }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#44ff44" />
        
        {optimization && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {optimization.optimization_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {optimization.optimization_algorithm.replace('_', ' ').toUpperCase()}
            </Text>

            <SavingsIndicator savings={optimization.cost_analysis?.savings_percentage || 0} />

            <ResourceBar
              label="CPU Cores"
              current={optimization.current_allocation?.cpu_cores || 0}
              optimized={optimization.optimized_allocation?.cpu_cores || 0}
              position={[0, -0.5, 0]}
              color="#00f5ff"
            />
            <ResourceBar
              label="Memory (GB)"
              current={optimization.current_allocation?.memory_gb || 0}
              optimized={optimization.optimized_allocation?.memory_gb || 0}
              position={[0, -1.5, 0]}
              color="#a855f7"
            />
            <ResourceBar
              label="GPU Count"
              current={optimization.current_allocation?.gpu_count || 0}
              optimized={optimization.optimized_allocation?.gpu_count || 0}
              position={[0, -2.5, 0]}
              color="#ec4899"
            />

            <group position={[0, -4, 0]}>
              <Text fontSize={0.12} color="#44ff44">
                Monthly Savings: ${optimization.cost_analysis?.estimated_monthly_savings?.toFixed(2)}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}