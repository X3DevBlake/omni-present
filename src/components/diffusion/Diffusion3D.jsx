import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

function NoiseParticle({ position, timestep, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.x += Math.sin(time + index) * 0.01;
      meshRef.current.position.z += Math.cos(time + index) * 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const alpha = 1 - (timestep / 1000);
  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    alpha
  );

  return (
    <Box ref={meshRef} args={[0.15, 0.15, 0.15]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
      />
    </Box>
  );
}

export default function Diffusion3D({ model }) {
  const timesteps = model?.timesteps || 1000;
  const particleCount = 80;

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 2 + (i / particleCount) * 4;
    return {
      position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius],
      timestep: (i / particleCount) * timesteps,
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#a855f7" />

      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#a855f7" 
          emissive="#a855f7" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Diffusion Model
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
        {model?.model_name || 'DDPM'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {model?.diffusion_type || 'LatentDiffusion'}
      </Text>

      {particles.map((p, i) => (
        <NoiseParticle key={i} {...p} />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          FID: {model?.generation_quality?.fid_score?.toFixed(1) || '12.5'}
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Steps: {model?.sampling_steps || 50}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          Guidance: {model?.guidance_scale || 7.5}
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}