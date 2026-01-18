import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function InteractionScene() {
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);

  useEffect(() => {
    // Create agent nodes in circular formation
    const nodeCount = 8;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * 12;
      const z = Math.sin(angle) * 12;

      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.4,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, 0, z);
      sphere.userData = { id: i, x, z };
      nodesRef.current.push(sphere);
    }

    // Create connection lines (collaboration edges)
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() > 0.5) {
          const node1 = nodesRef.current[i];
          const node2 = nodesRef.current[j];

          const points = [node1.position, node2.position];
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: 0x00ff88,
              transparent: true,
              opacity: 0.4,
            })
          );
          edgesRef.current.push(line);
        }
      }
    }
  }, []);

  useFrame(() => {
    nodesRef.current.forEach((node, idx) => {
      // Pulsing effect
      const scale = 1 + Math.sin(Date.now() * 0.003 + idx) * 0.2;
      node.scale.set(scale, scale, scale);
      node.rotation.x += 0.01;
      node.rotation.y += 0.015;
    });

    edgesRef.current.forEach((edge) => {
      edge.material.opacity = 0.2 + Math.sin(Date.now() * 0.002) * 0.2;
    });
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1.5} />
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, 20]} intensity={0.8} color="#ff00ff" />

      {nodesRef.current.map((node, idx) => (
        <primitive key={idx} object={node} />
      ))}
      {edgesRef.current.map((edge, idx) => (
        <primitive key={idx} object={edge} />
      ))}

      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhongMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
}

export default function MultiAgentInteractionGraph() {
  return (
    <Canvas camera={{ position: [0, 8, 20], fov: 45 }}>
      <InteractionScene />
    </Canvas>
  );
}