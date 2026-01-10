import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function EnhancedFinancialGalaxy3D({ assets = [], liabilities = [], goals = [], marketConditions = {} }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create asset nodes (blue spheres)
    const assetGroup = new THREE.Group();
    assets.forEach((asset, idx) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        emissive: 0x00f5ff,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        Math.sin(idx * Math.PI * 2 / assets.length) * 15,
        Math.cos(idx * Math.PI * 2 / assets.length) * 15,
        Math.sin(idx * 2) * 5
      );
      sphere.userData = { type: 'asset', value: asset.value };
      assetGroup.add(sphere);
    });
    scene.add(assetGroup);

    // Create liability nodes (red spheres)
    const liabilityGroup = new THREE.Group();
    liabilities.forEach((liability, idx) => {
      const geometry = new THREE.SphereGeometry(0.4, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        emissive: 0xff6b6b,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.5
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        Math.sin(idx * Math.PI * 2 / liabilities.length + Math.PI) * 10,
        Math.cos(idx * Math.PI * 2 / liabilities.length + Math.PI) * 10,
        Math.sin(idx * 2) * 5
      );
      sphere.userData = { type: 'liability', value: liability.value };
      liabilityGroup.add(sphere);
    });
    scene.add(liabilityGroup);

    // Create goal nodes (yellow stars)
    const goalGroup = new THREE.Group();
    goals.forEach((goal, idx) => {
      const geometry = new THREE.TetrahedronGeometry(0.6);
      const material = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2
      });
      const tetrahedron = new THREE.Mesh(geometry, material);
      tetrahedron.position.set(
        Math.sin(idx * Math.PI * 2 / goals.length + Math.PI * 0.5) * 20,
        Math.cos(idx * Math.PI * 2 / goals.length + Math.PI * 0.5) * 20,
        Math.sin(idx * 3) * 8
      );
      tetrahedron.userData = { type: 'goal', name: goal.name, progress: goal.progress_percentage };
      goalGroup.add(tetrahedron);
    });
    scene.add(goalGroup);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Add point lights for glow effect
    const pointLight = new THREE.PointLight(0x00f5ff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Rotation animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      assetGroup.rotation.z += 0.001;
      liabilityGroup.rotation.z -= 0.0008;
      goalGroup.rotation.z += 0.0012;

      // Orbital motion
      assetGroup.rotation.x += 0.0003;
      liabilityGroup.rotation.y += 0.0004;

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
  }, [assets, liabilities, goals]);

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