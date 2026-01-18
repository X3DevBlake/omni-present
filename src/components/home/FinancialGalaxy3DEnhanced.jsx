import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function GalaxyScene({ portfolioData }) {
  const sceneRef = useRef();
  const starsRef = useRef();
  const planetsRef = useRef([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    // Create stars background
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    if (starsRef.current) {
      starsRef.current.geometry = geometry;
      starsRef.current.material = material;
    }
  }, []);

  // Create portfolio planets
  useEffect(() => {
    const categories = [
      { name: 'Savings', color: '#4ade80', value: 45000, position: [10, 0, 0] },
      { name: 'Investments', color: '#3b82f6', value: 80000, position: [-10, 5, 0] },
      { name: 'Crypto', color: '#f59e0b', value: 15000, position: [0, -8, 5] },
      { name: 'Bonds', color: '#8b5cf6', value: 30000, position: [5, 10, -3] },
    ];

    categories.forEach((cat, idx) => {
      if (!planetsRef.current[idx]) {
        const geometry = new THREE.SphereGeometry(Math.sqrt(cat.value) / 100, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: cat.color,
          emissive: cat.color,
          emissiveIntensity: 0.3,
          shininess: 100,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...cat.position);
        mesh.userData = cat;
        planetsRef.current[idx] = mesh;
        sceneRef.current?.add(mesh);
      }
    });
  }, []);

  useFrame(() => {
    planetsRef.current.forEach((planet, idx) => {
      if (planet) {
        planet.rotation.x += 0.001;
        planet.rotation.y += 0.002;
        
        // Orbit animation
        const orbitSpeed = 0.001 + idx * 0.0002;
        const orbitRadius = 15;
        planet.position.x = Math.cos(Date.now() * orbitSpeed) * orbitRadius;
        planet.position.z = Math.sin(Date.now() * orbitSpeed) * orbitRadius;
      }
    });

    if (starsRef.current) {
      starsRef.current.rotation.x += 0.00001;
      starsRef.current.rotation.y += 0.00001;
    }
  });

  return (
    <>
      <scene ref={sceneRef}>
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
        <ambientLight intensity={0.4} />
        <pointLight position={[20, 20, 20]} intensity={1.5} />
        <pointLight position={[-20, -20, -20]} intensity={0.5} />
        
        <points ref={starsRef} />
      </scene>

      {tooltip && (
        <Html position={tooltip.position}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/90 border border-cyan-500/50 rounded-lg px-4 py-3 text-cyan-300 text-sm"
          >
            <div className="font-bold">{tooltip.name}</div>
            <div className="text-xs text-cyan-400">${tooltip.value.toLocaleString()}</div>
          </motion.div>
        </Html>
      )}
    </>
  );
}

export default function FinancialGalaxy3DEnhanced() {
  const [portfolioData] = useState({
    savings: 45000,
    investments: 80000,
    crypto: 15000,
    bonds: 30000,
  });

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 15, 30], fov: 45 }}>
        <GalaxyScene portfolioData={portfolioData} />
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-cyan-500/30 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Savings', value: '$45K', icon: Wallet, color: 'text-green-400' },
            { label: 'Investments', value: '$80K', icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Crypto', value: '$15K', icon: TrendingUp, color: 'text-amber-400' },
            { label: 'Bonds', value: '$30K', icon: TrendingDown, color: 'text-purple-400' },
          ].map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <IconComponent className={`w-4 h-4 ${stat.color}`} />
                <div>
                  <div className="text-xs text-cyan-300">{stat.label}</div>
                  <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}