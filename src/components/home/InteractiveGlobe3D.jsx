import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function GlobeScene({ agents }) {
  const globeRef = useRef();
  const particlesRef = useRef();
  const [hoveredAgent, setHoveredAgent] = useState(null);

  useEffect(() => {
    if (!globeRef.current) return;

    // Create globe texture with gradient
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Ocean blue gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a1e3f');
    gradient.addColorStop(0.5, '#1a4d7a');
    gradient.addColorStop(1, '#0a1e3f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add continents (simplified)
    ctx.fillStyle = '#1a5f3f';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, Math.random() * 100 + 50, Math.random() * 80 + 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    globeRef.current.material.map = texture;
  }, []);

  // Create particle agents
  useEffect(() => {
    if (!agents || agents.length === 0) return;

    const particleCount = Math.min(agents.length, 50);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      positions[i * 3] = 2.5 * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = 2.5 * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = 2.5 * Math.cos(phi);

      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.8;
      colors[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    if (particlesRef.current) {
      particlesRef.current.geometry = geometry;
      particlesRef.current.material = material;
    }
  }, [agents]);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0002;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={true} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Sphere ref={globeRef} args={[2.5, 64, 32]} scale={1}>
        <meshPhongMaterial emissive="#0a4d7a" shininess={5} />
      </Sphere>

      <points ref={particlesRef} />

      {hoveredAgent && (
        <Html position={[0, 3, 0]} center>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/80 border border-cyan-500 rounded-lg px-3 py-2 text-cyan-300 text-sm whitespace-nowrap"
          >
            {hoveredAgent}
          </motion.div>
        </Html>
      )}
    </>
  );
}

export default function InteractiveGlobe3D({ agents = [] }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <GlobeScene agents={agents} />
    </Canvas>
  );
}