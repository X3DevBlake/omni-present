import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TrainingCurve({ metrics, color }) {
  const points = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];
    return metrics.map((m, i) => new THREE.Vector3(i * 0.5 - 2, m * 5, 0));
  }, [metrics]);

  return points.length > 1 ? (
    <Line points={points} color={color} lineWidth={3} />
  ) : null;
}

function GradientFlowBars({ gradients }) {
  return (
    <group position={[3, 0, 0]}>
      {gradients?.map((grad, i) => (
        <group key={i} position={[0, i * 0.3 - 2, 0]}>
          <mesh>
            <boxGeometry args={[grad.gradient_norm, 0.2, 0.2]} />
            <meshStandardMaterial 
              color={grad.gradient_norm > 1 ? '#ff4444' : '#44ff44'} 
              emissive={grad.gradient_norm > 1 ? '#ff0000' : '#00ff00'}
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text position={[-1.5, 0, 0]} fontSize={0.15} color="white">
            {grad.layer}
          </Text>
        </group>
      ))}
    </group>
  );
}

function MetricsDisplay({ session }) {
  if (!session) return null;
  
  return (
    <group position={[0, 3, 0]}>
      <Text fontSize={0.3} color="#00f5ff" position={[0, 0.5, 0]}>
        {session.session_name}
      </Text>
      <Text fontSize={0.2} color="#ffffff" position={[0, 0, 0]}>
        Epoch: {session.current_epoch}/{session.total_epochs}
      </Text>
      <Text fontSize={0.18} color="#44ff44" position={[0, -0.5, 0]}>
        Loss: {session.metrics?.loss?.toFixed(4)} | Acc: {(session.metrics?.accuracy * 100).toFixed(1)}%
      </Text>
      <Text fontSize={0.15} color="#ffaa00" position={[0, -0.9, 0]}>
        GPU: {session.resource_usage?.gpu_utilization?.toFixed(0)}% | Mem: {session.resource_usage?.memory_usage_gb?.toFixed(1)}GB
      </Text>
    </group>
  );
}

function RotatingCore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial 
        color="#a855f7" 
        emissive="#a855f7" 
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

export default function RealTimeTrainingVisualizer3D({ session }) {
  const lossHistory = session?.metrics ? Array(10).fill(session.metrics.loss) : [];
  const accuracyHistory = session?.metrics ? Array(10).fill(session.metrics.accuracy) : [];

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        <RotatingCore />
        <MetricsDisplay session={session} />
        
        <group position={[-3, -1, 0]}>
          <TrainingCurve metrics={lossHistory} color="#ff4444" />
          <Text position={[0, 2.5, 0]} fontSize={0.2} color="#ff4444">
            Loss Curve
          </Text>
        </group>
        
        <group position={[0, -1, 0]}>
          <TrainingCurve metrics={accuracyHistory} color="#44ff44" />
          <Text position={[0, 2.5, 0]} fontSize={0.2} color="#44ff44">
            Accuracy Curve
          </Text>
        </group>
        
        <GradientFlowBars gradients={session?.gradient_flow} />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}