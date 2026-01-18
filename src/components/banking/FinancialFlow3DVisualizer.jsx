import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

function FlowScene() {
  const sceneRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    // Create account nodes
    const accounts = [
      { position: [-10, 0, 0], label: 'Checking', color: '#3b82f6' },
      { position: [10, 0, 0], label: 'Savings', color: '#10b981' },
      { position: [0, 10, 0], label: 'Investments', color: '#f59e0b' },
      { position: [0, -10, 0], label: 'Crypto', color: '#ec4899' },
    ];

    accounts.forEach((acc) => {
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: acc.color,
        emissive: acc.color,
        emissiveIntensity: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...acc.position);
      sceneRef.current?.add(sphere);
    });

    // Create money flow particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: '#fbbf24',
        emissive: '#fbbf24',
        emissiveIntensity: 0.8,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
      particle.userData.velocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      };
      sceneRef.current?.add(particle);
      particlesRef.current.push(particle);
    }
  }, []);

  useFrame(() => {
    particlesRef.current.forEach((particle) => {
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;

      if (Math.abs(particle.position.x) > 12) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 12) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 12) particle.userData.velocity.z *= -1;

      particle.rotation.x += 0.01;
      particle.rotation.y += 0.01;
    });
  });

  return (
    <>
      <scene ref={sceneRef}>
        <OrbitControls autoRotate autoRotateSpeed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[15, 15, 15]} intensity={1.5} />
      </scene>
    </>
  );
}

export default function FinancialFlow3DVisualizer() {
  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
      <FlowScene />
    </Canvas>
  );
}