import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function ExampleNode({ position, index, k }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial 
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function FewShot3D({ learner }) {
  const kShot = learner?.support_set_size || 5;
  const nWay = learner?.num_classes || 5;

  const examples = Array.from({ length: Math.min(kShot * nWay, 30) }, (_, i) => {
    const classIndex = Math.floor(i / kShot);
    const angle = (classIndex / nWay) * Math.PI * 2;
    const radius = 3 + (i % kShot) * 0.5;
    return {
      position: [Math.cos(angle) * radius, (i % kShot) - 2, Math.sin(angle) * radius],
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.7}
          metalness={0.8}
        />
      </Sphere>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Few-Shot Learning
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {learner?.learner_name || 'Meta-Learner'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {nWay}-way {kShot}-shot • {learner?.meta_learning_algorithm || 'MAML'}
      </Text>

      {examples.map((ex, i) => (
        <ExampleNode key={i} {...ex} k={kShot} />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          5-shot: {((learner?.performance_metrics?.five_shot_accuracy || 0.84) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Generalization: {learner?.generalization_score || 87}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          Efficiency: {learner?.sample_efficiency?.toFixed(1) || '4.2'}x
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}