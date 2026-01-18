import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

function WorldScene() {
  const agentsRef = useRef([]);
  const worldRef = useRef();

  useEffect(() => {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      metalness: 0.3,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    worldRef.current?.add(ground);

    // Create grid
    const gridHelper = new THREE.GridHelper(40, 40, '#ffffff', '#444444');
    gridHelper.position.y = -1.9;
    worldRef.current?.add(gridHelper);

    // Create agents (spheres)
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: `hsl(${(i * 45) % 360}, 100%, 50%)`,
        emissive: `hsl(${(i * 45) % 360}, 100%, 30%)`,
        emissiveIntensity: 0.3,
      });
      const agent = new THREE.Mesh(geometry, material);
      agent.position.set(
        Math.cos((i / 8) * Math.PI * 2) * 10,
        0,
        Math.sin((i / 8) * Math.PI * 2) * 10
      );
      agent.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          0,
          (Math.random() - 0.5) * 0.05
        ),
        targetX: Math.random() * 30 - 15,
        targetZ: Math.random() * 30 - 15,
      };
      worldRef.current?.add(agent);
      agentsRef.current.push(agent);
    }
  }, []);

  useFrame(() => {
    agentsRef.current.forEach((agent) => {
      // Move towards target
      const targetX = agent.userData.targetX;
      const targetZ = agent.userData.targetZ;
      const dx = targetX - agent.position.x;
      const dz = targetZ - agent.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 1) {
        agent.userData.targetX = Math.random() * 30 - 15;
        agent.userData.targetZ = Math.random() * 30 - 15;
      }

      agent.position.x += dx * 0.01;
      agent.position.z += dz * 0.01;

      // Keep in bounds
      agent.position.x = Math.max(-15, Math.min(15, agent.position.x));
      agent.position.z = Math.max(-15, Math.min(15, agent.position.z));

      // Rotate to face direction
      agent.rotation.y += 0.02;
    });
  });

  return (
    <>
      <scene ref={worldRef}>
        <OrbitControls autoRotate autoRotateSpeed={1} />
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={1.5} />
        <pointLight position={[-20, 20, -20]} intensity={0.8} color="#ff6b6b" />
      </scene>
    </>
  );
}

export default function WorldState3DSimulator() {
  return (
    <Canvas camera={{ position: [0, 20, 20], fov: 45 }}>
      <WorldScene />
    </Canvas>
  );
}