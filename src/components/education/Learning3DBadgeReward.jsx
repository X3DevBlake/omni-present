import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function Learning3DBadgeReward({ badge, badgeName, onComplete }) {
  const containerRef = useRef(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 3;
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Badge sphere
    const geometry = new THREE.IcosahedronGeometry(1, 5);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const badge3D = new THREE.Mesh(geometry, material);
    scene.add(badge3D);

    // Rotating ring
    const ringGeometry = new THREE.TorusGeometry(1.8, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaff,
      emissiveIntensity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      positions.push(
        Math.cos(angle) * 2.5,
        Math.sin(angle) * 2.5,
        0
      );
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1 });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x505050));

    let startTime = Date.now();
    const duration = 4000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Scale up
      badge3D.scale.set(progress, progress, progress);
      badge3D.rotation.x += 0.02;
      badge3D.rotation.y += 0.03;

      // Ring rotation
      ring.rotation.z -= 0.02;

      // Particle orbit
      particles.rotation.z += 0.01;

      // Pulse
      const pulse = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
      material.emissiveIntensity = 0.4 + pulse * 0.4;

      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setShowMessage(true);
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-96 rounded-lg border border-yellow-400/30 bg-yellow-500/5 overflow-hidden">
      <div ref={containerRef} />
      
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 text-center"
          >
            <p className="text-yellow-300 font-bold text-lg">{badge} Badge Earned!</p>
            <p className="text-yellow-200/80 text-sm">{badgeName}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';