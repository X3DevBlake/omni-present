import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Scenario3DComparison() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.set(0, 0, 40);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create scenario towers
    const scenarios = [
      { name: 'Base', value: 215, color: 0x00ffff, x: -15 },
      { name: 'Optimistic', value: 245, color: 0x00ff88, x: -5 },
      { name: 'Pessimistic', value: 185, color: 0xff6644, x: 5 },
      { name: 'Job Change', value: 265, color: 0xff00ff, x: 15 },
    ];

    const towerMeshes = [];

    scenarios.forEach((scenario) => {
      // Create tower
      const height = scenario.value / 50;
      const geometry = new THREE.BoxGeometry(3, height, 3);
      const material = new THREE.MeshStandardMaterial({
        color: scenario.color,
        emissive: scenario.color,
        emissiveIntensity: 0.3,
        metalness: 0.6,
        roughness: 0.2,
      });

      const tower = new THREE.Mesh(geometry, material);
      tower.position.set(scenario.x, height / 2, 0);
      tower.userData = scenario;
      scene.add(tower);
      towerMeshes.push(tower);

      // Add label plane
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(scenario.name, 128, 50);
      ctx.font = '24px Arial';
      ctx.fillText(`$${scenario.value}k`, 128, 90);

      const texture = new THREE.CanvasTexture(canvas);
      const labelGeometry = new THREE.PlaneGeometry(6, 3);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(scenario.x, height + 4, 0);
      scene.add(label);
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(0, 20, 20);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      towerMeshes.forEach((tower, idx) => {
        tower.rotation.y += 0.005;
        tower.position.y = tower.userData.value / 100 + Math.sin(time + idx) * 0.3;
        
        // Hover effect
        tower.scale.x = 1 + Math.sin(time * 2 + idx) * 0.05;
        tower.scale.z = 1 + Math.sin(time * 2 + idx) * 0.05;
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-6 z-10"
      >
        <h2 className="text-3xl font-bold text-white">What-If Scenarios</h2>
        <p className="text-white/60 text-sm">10-year portfolio projections</p>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4"
      >
        <p className="text-white font-bold mb-3">Scenarios</p>
        {[
          { name: 'Base Case', color: 'bg-cyan-500' },
          { name: 'Optimistic', color: 'bg-green-500' },
          { name: 'Pessimistic', color: 'bg-orange-500' },
          { name: 'Job Change', color: 'bg-purple-500' },
        ].map((scenario, idx) => (
          <div key={idx} className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <div className={`w-3 h-3 rounded ${scenario.color}`} />
            {scenario.name}
          </div>
        ))}
      </motion.div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 max-w-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-lg p-4 z-10"
      >
        <p className="text-green-400 font-bold">Recommended Path</p>
        <p className="text-white/80 text-sm mt-2">
          Job Change scenario offers 23% better outcome. Consider the timing and risk factors in your decision.
        </p>
      </motion.div>
    </div>
  );
}