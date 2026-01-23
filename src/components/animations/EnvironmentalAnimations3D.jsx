import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cloud } from '@react-three/drei';
import * as THREE from 'three';

export function AmbientParticleField({ count = 200, color = '#00ffff' }) {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ]
    }));
  }, [count]);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        particle.position.x += particles[i].velocity[0];
        particle.position.y += particles[i].velocity[1];
        particle.position.z += particles[i].velocity[2];
        
        if (Math.abs(particle.position.x) > 15) particles[i].velocity[0] *= -1;
        if (Math.abs(particle.position.y) > 15) particles[i].velocity[1] *= -1;
        if (Math.abs(particle.position.z) > 15) particles[i].velocity[2] *= -1;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={p.position}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
}

export function HolographicShimmer() {
  const planeRef = useRef();
  
  useFrame(({ clock }) => {
    if (planeRef.current) {
      planeRef.current.material.opacity = Math.sin(clock.elapsedTime * 2) * 0.3 + 0.5;
      planeRef.current.position.y = Math.sin(clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={planeRef} rotation={[Math.PI / 4, 0, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.5}
        transparent
        opacity={0.5}
        wireframe
      />
    </mesh>
  );
}

export function EnergyWave({ amplitude = 1 }) {
  const waveRef = useRef();
  
  useFrame(({ clock }) => {
    if (waveRef.current && waveRef.current.geometry) {
      const positions = waveRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave = Math.sin(x * 2 + clock.elapsedTime) * Math.cos(z * 2 + clock.elapsedTime);
        positions.setY(i, wave * amplitude);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
}

export function PortalVortex() {
  const vortexRef = useRef();
  
  useFrame(({ clock }) => {
    if (vortexRef.current) {
      vortexRef.current.rotation.z = clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={vortexRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere key={i} args={[2 - i * 0.2, 32, 32]} position={[0, 0, -i * 0.5]}>
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1 - i * 0.1}
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      ))}
    </group>
  );
}