import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Badge3DAnimation({ badgeEmoji = '🏆', onComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 3;
    renderer.setSize(containerRef.current.clientWidth, 300);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create glowing sphere for badge
    const geometry = new THREE.IcosahedronGeometry(1.5, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });

    const badgeMesh = new THREE.Mesh(geometry, material);
    scene.add(badgeMesh);

    // Particle rings
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 3;
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    const particleMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1 });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    let startTime = Date.now();
    const duration = 3000; // 3 second animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Rotation
      badgeMesh.rotation.x += 0.02;
      badgeMesh.rotation.y += 0.03;

      // Scale up animation
      badgeMesh.scale.set(
        progress * 1.5,
        progress * 1.5,
        progress * 1.5
      );

      // Particle ring rotation
      particles.rotation.z += 0.01;

      // Pulse effect
      const pulse = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
      material.emissiveIntensity = 0.4 + pulse * 0.4;

      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="w-full h-80 flex items-center justify-center">
      <div className="absolute text-6xl animate-bounce">{badgeEmoji}</div>
    </div>
  );
}