import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Gamification3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.set(0, 5, 20);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create level progression tower
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    const maxLevel = 10;
    const currentLevel = 5;

    for (let i = 1; i <= maxLevel; i++) {
      const geometry = new THREE.BoxGeometry(4, 1.5, 4);
      const color = i <= currentLevel ? 0x00ff88 : 0x404040;
      const emissive = i <= currentLevel ? 0x00ff88 : 0x000000;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: i <= currentLevel ? 0.5 : 0,
        metalness: 0.5,
        roughness: 0.2,
      });

      const level = new THREE.Mesh(geometry, material);
      level.position.y = i * 2 - 1;
      level.userData = { level: i, isCurrent: i === currentLevel };
      towerGroup.add(level);

      // Add badge on top of current level
      if (i === currentLevel) {
        const badgeGeometry = new THREE.IcosahedronGeometry(1.5, 3);
        const badgeMaterial = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.8,
        });
        const badge = new THREE.Mesh(badgeGeometry, badgeMaterial);
        badge.position.y = 1;
        level.add(badge);
        level.badge = badge;
      }
    }

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(10, 20, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      towerGroup.children.forEach((level, idx) => {
        level.rotation.y += 0.003;

        if (level.userData.isCurrent && level.badge) {
          level.badge.rotation.x += 0.05;
          level.badge.rotation.y += 0.03;
          level.badge.position.y = 1 + Math.sin(time * 2) * 0.3;
        }

        // Highlight animation
        if (level.userData.isCurrent) {
          const scale = 1 + Math.sin(time * 3) * 0.1;
          level.scale.set(scale, 1, scale);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-6 z-10"
      >
        <h2 className="text-3xl font-bold text-white">Your Journey</h2>
        <p className="text-white/60 text-sm">Level 5 - Financial Scholar</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 z-10 space-y-3"
      >
        <div>
          <p className="text-white/60 text-xs">Total Points</p>
          <p className="text-2xl font-bold text-yellow-400">1,250</p>
        </div>
        <div>
          <p className="text-white/60 text-xs">Progress to Level 6</p>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Badges Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 z-10"
      >
        <p className="text-white font-bold mb-3">Recent Badges</p>
        <div className="flex gap-2">
          {['💰', '🏆', '🔥'].map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="text-3xl"
            >
              {badge}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 right-6 max-w-sm bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-lg p-4 z-10"
      >
        <p className="text-cyan-400 font-bold">Next Milestone</p>
        <p className="text-white/80 text-sm mt-2">
          Complete "Tax Optimizer" badge to reach Level 6. Find 3 more tax-saving opportunities.
        </p>
      </motion.div>
    </div>
  );
}