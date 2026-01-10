import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function TransactionCityscape3D({ transactions = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 100, 1000);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Create building structures for each transaction category
    const categoryColors = {
      housing: 0x3b82f6,
      food: 0x10b981,
      transport: 0xf59e0b,
      entertainment: 0xec4899,
      utilities: 0x6366f1,
      healthcare: 0x14b8a6,
      education: 0x8b5cf6,
      shopping: 0xf97316,
      other: 0x6b7280
    };

    // Group transactions by category
    const categoryGroups = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'other';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(tx);
    });

    // Create buildings
    let buildingIndex = 0;
    Object.entries(categoryGroups).forEach(([category, txs]) => {
      const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);
      const height = Math.min(totalAmount / 100, 50); // Scale height
      const color = categoryColors[category] || categoryColors.other;

      const geometry = new THREE.BoxGeometry(3, height, 3);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.6,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const building = new THREE.Mesh(geometry, material);
      building.position.set(
        Math.cos(buildingIndex * Math.PI * 2 / Object.keys(categoryGroups).length) * 20,
        height / 2,
        Math.sin(buildingIndex * Math.PI * 2 / Object.keys(categoryGroups).length) * 20
      );
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData = { category, amount: totalAmount, count: txs.length };

      scene.add(building);
      buildingIndex++;
    });

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.1,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(150, 10, 0x333333, 0x222222);
    scene.add(gridHelper);

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      camera.position.x = Math.cos(Date.now() * 0.0001) * 50;
      camera.position.z = Math.sin(Date.now() * 0.0001) * 50;
      camera.lookAt(0, 15, 0);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [transactions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '500px' }}
    />
  );
}