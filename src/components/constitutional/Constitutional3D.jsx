import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus } from '@react-three/drei';

function PrincipleOrbit({ index, total }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 3;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = Math.cos(angle + time * 0.3) * radius;
      meshRef.current.position.z = Math.sin(angle + time * 0.3) * radius;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]}>
      <meshStandardMaterial 
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function Constitutional3D({ system }) {
  const numPrinciples = system?.constitution?.length || 5;

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#a855f7" />

      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Torus args={[3, 0.1, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.4} />
      </Torus>

      {Array.from({ length: numPrinciples }, (_, i) => (
        <PrincipleOrbit key={i} index={i} total={numPrinciples} />
      ))}

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Constitutional AI
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
        {system?.system_name || 'Ethical System'}
      </Text>

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Ethics: {((system?.alignment_scores?.ethical_adherence || 0.96) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
          Self-Correction: {((system?.self_correction_rate || 0.91) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          {numPrinciples} Principles
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}