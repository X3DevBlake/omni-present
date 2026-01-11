import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function TransactionFlow3D() {
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

    // Create transaction particles
    const transactionGroup = new THREE.Group();
    scene.add(transactionGroup);

    const createTransaction = (startPos, endPos, color) => {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshPhongMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.copy(startPos);
      sphere.userData = {
        startPos: startPos.clone(),
        endPos: endPos.clone(),
        progress: 0,
        duration: 2 + Math.random() * 2,
      };

      transactionGroup.add(sphere);
      return sphere;
    };

    // Create ongoing transactions
    const transactions = [];
    const createTransactionStream = () => {
      const startPos = new THREE.Vector3(-15, (Math.random() - 0.5) * 10, 0);
      const endPos = new THREE.Vector3(15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      const colors = [0x00ff88, 0xff6644, 0x00ffff, 0xffff00];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const tx = createTransaction(startPos, endPos, color);
      transactions.push(tx);
    };

    // Create initial transactions
    for (let i = 0; i < 5; i++) {
      createTransactionStream();
    }

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    let frameCount = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frameCount++;

      // Create new transactions periodically
      if (frameCount % 60 === 0) {
        createTransactionStream();
      }

      // Update transactions
      transactions.forEach((tx, idx) => {
        tx.userData.progress += 1 / (60 * tx.userData.duration);

        if (tx.userData.progress >= 1) {
          transactionGroup.remove(tx);
          transactions.splice(idx, 1);
        } else {
          const start = tx.userData.startPos;
          const end = tx.userData.endPos;
          tx.position.lerpVectors(start, end, tx.userData.progress);
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

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
      >
        <h2 className="text-3xl font-bold text-white">Real-Time Transaction Flow</h2>
        <p className="text-white/60 mt-2">Visualizing live financial movements</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 z-20"
      >
        <div className="space-y-2">
          <div className="flex justify-between gap-8">
            <div>
              <p className="text-white/60 text-xs">Transactions Today</p>
              <p className="text-2xl font-bold text-white">47</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Total Volume</p>
              <p className="text-2xl font-bold text-green-400">$234k</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}