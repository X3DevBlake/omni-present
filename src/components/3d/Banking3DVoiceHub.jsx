import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';

export default function Banking3DVoiceHub() {
  const containerRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 500, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 5;
    renderer.setSize(containerRef.current.clientWidth, 500);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Central sphere representing banking hub
    const coreGeometry = new THREE.SphereGeometry(1, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaff,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Orbiting spheres for each service (cards, crypto, DeFi, token)
    const services = [
      { name: 'Cards', color: 0xff0080, angle: 0 },
      { name: 'Crypto', color: 0xffaa00, angle: Math.PI / 2 },
      { name: 'DeFi', color: 0x00ff00, angle: Math.PI },
      { name: 'Omni', color: 0xffff00, angle: (3 * Math.PI) / 2 },
    ];

    const orbiters = services.map(service => {
      const geo = new THREE.SphereGeometry(0.4, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: service.color,
        emissive: service.color,
        emissiveIntensity: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = Math.cos(service.angle) * 3;
      mesh.position.z = Math.sin(service.angle) * 3;
      mesh.userData = { angle: service.angle, speed: 0.01 };
      scene.add(mesh);
      return mesh;
    });

    // Voice wave particles
    const waveParticles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0x00ffff, size: 0.05 })
    );
    scene.add(waveParticles);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      core.rotation.x += 0.005;
      core.rotation.y += 0.008;

      // Orbit services
      orbiters.forEach(orbiter => {
        orbiter.userData.angle += orbiter.userData.speed;
        orbiter.position.x = Math.cos(orbiter.userData.angle) * 3;
        orbiter.position.z = Math.sin(orbiter.userData.angle) * 3;
        orbiter.rotation.x += 0.01;
        orbiter.rotation.y += 0.01;
      });

      // Pulse effect
      const pulse = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
      coreMaterial.emissiveIntensity = 0.2 + pulse * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-96 rounded-lg border border-white/10 overflow-hidden" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 right-4 flex gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsListening(!isListening)}
          className={`p-3 rounded-full transition-all ${
            isListening
              ? 'bg-red-500/30 border border-red-400'
              : 'bg-cyan-500/20 border border-cyan-400'
          }`}
        >
          <Mic className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-3 rounded-full bg-white/10 border border-white/20 hover:border-white/30"
        >
          <Volume2 className="w-5 h-5 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}