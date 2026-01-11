import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Portfolio3DBalance() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 4;
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create bars representing portfolio allocation
    const allocations = [
      { name: 'Cards', value: 25, color: 0xff0080 },
      { name: 'Crypto', value: 35, color: 0xffaa00 },
      { name: 'DeFi', value: 25, color: 0x00ff00 },
      { name: 'Omni', value: 15, color: 0xffff00 },
    ];

    const group = new THREE.Group();
    const barWidth = 0.6;
    const spacing = 1.2;

    allocations.forEach((alloc, idx) => {
      const geometry = new THREE.BoxGeometry(barWidth, alloc.value / 10, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: alloc.color,
        emissive: alloc.color,
        emissiveIntensity: 0.3,
        metalness: 0.8,
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (idx - 1.5) * spacing;
      bar.userData = { targetY: alloc.value / 10, currentY: 0 };
      group.add(bar);
    });

    scene.add(group);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x505050));

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      group.rotation.x = 0.3;
      group.rotation.z += 0.002;

      group.children.forEach(bar => {
        if (bar.userData) {
          bar.userData.currentY += (bar.userData.targetY - bar.userData.currentY) * 0.05;
          bar.scale.y = bar.userData.currentY / (bar.userData.targetY || 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-96 rounded-lg border border-white/10 overflow-hidden" />;
}