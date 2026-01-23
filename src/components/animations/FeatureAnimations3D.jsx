import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Ring } from '@react-three/drei';

export function AgentSpawnEffect({ onComplete }) {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 2;
      const scale = Math.min(clock.elapsedTime * 0.5, 1);
      groupRef.current.scale.setScalar(scale);
      
      if (clock.elapsedTime > 2.5 && onComplete) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          distort={0.5}
          speed={3}
        />
      </Sphere>
      
      {[0, 1, 2].map((i) => (
        <Ring key={i} args={[1.2 + i * 0.3, 1.3 + i * 0.3, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1}
            transparent
            opacity={0.5 - i * 0.1}
          />
        </Ring>
      ))}
    </group>
  );
}

export function DataFlowParticles({ count = 150 }) {
  const particlesRef = useRef();
  
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 10,
    speed: Math.random() * 0.02 + 0.01
  }));

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        particle.position.z += particles[i].speed;
        if (particle.position.z > 5) particle.position.z = -5;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((p) => (
        <Sphere key={p.id} args={[0.05, 8, 8]} position={[p.x, p.y, p.z]}>
          <meshStandardMaterial
            color={p.id % 2 === 0 ? '#00ffff' : '#ff00ff'}
            emissive={p.id % 2 === 0 ? '#00ffff' : '#ff00ff'}
            emissiveIntensity={1}
          />
        </Sphere>
      ))}
    </group>
  );
}

export function NeuralPulseEffect({ intensity = 1 }) {
  const pulseRef = useRef();
  
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2.5) * 0.3 * intensity + 1;
      pulseRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={pulseRef} args={[0.5, 32, 32]}>
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={intensity * 2}
        transparent
        opacity={0.6}
      />
    </Sphere>
  );
}

export function TaskCompletionBurst() {
  const particlesRef = useRef();
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const time = clock.elapsedTime;
        particle.position.x = Math.cos(i * 0.5) * time * 2;
        particle.position.y = Math.sin(i * 0.3) * time * 2;
        particle.position.z = Math.sin(i * 0.7) * time * 2;
        particle.scale.setScalar(Math.max(0, 1 - time * 0.5));
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 30 }).map((_, i) => (
        <Sphere key={i} args={[0.1, 16, 16]}>
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={2}
          />
        </Sphere>
      ))}
    </group>
  );
}