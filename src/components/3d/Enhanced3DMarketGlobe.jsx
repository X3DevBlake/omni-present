import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Enhanced3DMarketGlobe() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 40;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create globe
    const globeGeometry = new THREE.IcosahedronGeometry(15, 5);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a52,
      emissive: 0x0a1f2e,
      metalness: 0.7,
      roughness: 0.3,
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add market hotspots
    const markets = [
      { name: 'US', lat: 40, lng: -100, value: 45, color: 0x00ff88 },
      { name: 'EU', lat: 50, lng: 10, value: 30, color: 0x00ffff },
      { name: 'Asia', lat: 35, lng: 100, value: 20, color: 0xff00ff },
      { name: 'Emerging', lat: -10, lng: 50, value: 5, color: 0xffff00 },
    ];

    markets.forEach((market) => {
      const phi = (90 - market.lat) * (Math.PI / 180);
      const theta = (market.lng + 180) * (Math.PI / 180);

      const x = -(15 * Math.sin(phi) * Math.cos(theta));
      const y = 15 * Math.cos(phi);
      const z = 15 * Math.sin(phi) * Math.sin(theta);

      // Create market sphere
      const size = market.value / 10;
      const hotspotGeometry = new THREE.IcosahedronGeometry(size, 3);
      const hotspotMaterial = new THREE.MeshStandardMaterial({
        color: market.color,
        emissive: market.color,
        emissiveIntensity: 0.6,
      });

      const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
      hotspot.position.set(x, y, z);
      globe.add(hotspot);

      // Add pulse rings
      const ringGeometry = new THREE.TorusGeometry(size * 2.5, 0.2, 8, 8);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: market.color,
        transparent: true,
        opacity: 0.3,
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(hotspot.position);
      ring.lookAt(0, 0, 0);
      globe.add(ring);
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(30, 30, 30);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x505050);
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

      if (globe) {
        globe.rotation.x += 0.0002;
        globe.rotation.y += 0.0005;

        // Mouse interaction
        globe.rotation.x += mouseY * 0.0002;
        globe.rotation.y += mouseX * 0.0002;

        // Pulse effect on hotspots
        globe.children.forEach((child, idx) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            child.scale.set(
              1 + Math.sin(time * 2 + idx * 0.5) * 0.3,
              1 + Math.sin(time * 2 + idx * 0.5) * 0.3,
              1 + Math.sin(time * 2 + idx * 0.5) * 0.3
            );
            child.material.opacity = 0.2 + Math.sin(time * 2 + idx * 0.5) * 0.2;
          }
        });
      }

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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-6 z-10"
      >
        <h2 className="text-3xl font-bold text-white">Global Market Sentiment</h2>
        <p className="text-white/60 text-sm">Real-time market hotspots and sentiment</p>
      </motion.div>

      {/* Market Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 z-10 space-y-2"
      >
        {[
          { market: 'US Markets', sentiment: 'Bullish', color: 'text-green-400' },
          { market: 'EU Markets', sentiment: 'Neutral', color: 'text-yellow-400' },
          { market: 'Asian Markets', sentiment: 'Cautious', color: 'text-orange-400' },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between gap-4 text-sm">
            <p className="text-white/80">{item.market}</p>
            <p className={`font-bold ${item.color}`}>{item.sentiment}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}