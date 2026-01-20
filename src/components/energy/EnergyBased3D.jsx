import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function EnergyMode({ position, energy, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.15 + 0.85;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    1 - (energy + 10) / 20
  );

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
      />
    </Sphere>
  );
}

export default function EnergyBased3D({ model }) {
  const landscape = model?.energy_landscape || {};
  const numModes = landscape.num_modes || 5;

  const modes = Array.from({ length: numModes }, (_, i) => {
    const angle = (i / numModes) * Math.PI * 2;
    const radius = 4;
    const energy = -8 + Math.random() * 10;
    return {
      position: [Math.cos(angle) * radius, energy * 0.3, Math.sin(angle) * radius],
      energy: energy,
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#f59e0b" />

      <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#f59e0b" 
          emissive="#f59e0b" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Energy-Based Model
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#f59e0b" anchorX="center">
        {model?.model_name || 'EBM'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {model?.training_method || 'contrastive_divergence'}
      </Text>

      {modes.map((mode, i) => (
        <EnergyMode key={i} {...mode} />
      ))}

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Mode Coverage: {model?.mode_coverage || 92}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          Sampling: {model?.sampling_method || 'Langevin'}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          Convergence: {model?.convergence_steps || 1000} steps
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}