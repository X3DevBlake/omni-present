import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Anomaly3DDetector() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 30;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create anomaly spheres
    const anomalies = [
      { position: [-10, 5, 0], severity: 'critical', label: 'Fraud Alert' },
      { position: [10, -5, 0], severity: 'high', label: 'Subscription' },
      { position: [0, 0, -10], severity: 'medium', label: 'Investment Drift' },
    ];

    const anomalySpheres = [];

    anomalies.forEach((anomaly) => {
      const colorMap = {
        critical: 0xff0000,
        high: 0xff9900,
        medium: 0xffff00,
      };

      const geometry = new THREE.IcosahedronGeometry(2, 3);
      const material = new THREE.MeshStandardMaterial({
        color: colorMap[anomaly.severity],
        emissive: colorMap[anomaly.severity],
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...anomaly.position);
      mesh.userData.anomaly = anomaly;
      scene.add(mesh);
      anomalySpheres.push(mesh);

      // Add warning pulses
      const pulseGeometry = new THREE.IcosahedronGeometry(3, 2);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: colorMap[anomaly.severity],
        transparent: true,
        opacity: 0.2,
      });

      const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulseMesh.position.copy(mesh.position);
      mesh.pulseChild = pulseMesh;
      scene.add(pulseMesh);
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      // Animate anomaly spheres
      anomalySpheres.forEach((sphere) => {
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.015;

        // Pulse effect
        if (sphere.pulseChild) {
          const scale = 1 + Math.sin(time * 3) * 0.2;
          sphere.pulseChild.scale.set(scale, scale, scale);
          sphere.pulseChild.material.opacity = 0.3 - Math.sin(time * 3) * 0.1;
        }

        // Orbit around center
        const orbitRadius = 15;
        const orbitSpeed = 0.5;
        sphere.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
        sphere.position.y = Math.sin(time * orbitSpeed * 0.7) * orbitRadius * 0.5;
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
      >
        <h2 className="text-3xl font-bold text-white mb-4">Anomaly Detection System</h2>
        <p className="text-white/60">3 anomalies detected • Immediate action required</p>
      </motion.div>

      {/* Alerts Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 space-y-3 z-20 max-w-sm"
      >
        {[
          { severity: 'critical', title: 'Fraud Alert', desc: 'Suspicious transaction detected' },
          { severity: 'high', title: 'Subscription Overload', desc: '$47/month unused services' },
          { severity: 'medium', title: 'Portfolio Drift', desc: 'Tech allocation +17%' },
        ].map((alert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border backdrop-blur-md ${
              alert.severity === 'critical'
                ? 'bg-red-500/20 border-red-400'
                : alert.severity === 'high'
                ? 'bg-orange-500/20 border-orange-400'
                : 'bg-yellow-500/20 border-yellow-400'
            }`}
          >
            <p className="text-white font-bold">{alert.title}</p>
            <p className="text-white/70 text-sm">{alert.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}