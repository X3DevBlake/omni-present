import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function InteractiveGlobe3D({ locations = [], onLocationSelect }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.z = 2.5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0.1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Create gradient earth texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a3a52');
    gradient.addColorStop(0.5, '#2d5a7b');
    gradient.addColorStop(1, '#1a3a52');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add continents
    ctx.fillStyle = '#2a5f3f';
    ctx.fillRect(0, 300, canvas.width, 500);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // Add location markers
    const addMarker = (location) => {
      const lat = (location.latitude * Math.PI) / 180;
      const lon = (location.longitude * Math.PI) / 180;

      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);

      const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const colors = {
        agent: 0x00f5ff,
        office: 0xff00ff,
        market: 0xffd700,
        event: 0xff6347,
        poi: 0x32cd32,
        resource: 0x87ceeb,
      };
      const color = colors[location.location_type] || 0xffffff;
      const markerMaterial = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      marker.position.set(x, y, z);
      marker.userData = location;
      scene.add(marker);
      markersRef.current.push(marker);
    };

    locations.forEach(addMarker);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y,
        };
        globe.rotation.y += (deltaMove.x * Math.PI) / 500;
        globe.rotation.x += (deltaMove.y * Math.PI) / 500;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.001;
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
    });

    renderer.domElement.addEventListener('click', (e) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersRef.current);

      if (intersects.length > 0) {
        onLocationSelect?.(intersects[0].object.userData);
      }
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (!isDragging) {
        globe.rotation.y += 0.0002;
      }

      // Pulse markers
      markersRef.current.forEach((marker) => {
        marker.scale.x = 1 + Math.sin(Date.now() * 0.003) * 0.3;
        marker.scale.y = marker.scale.x;
        marker.scale.z = marker.scale.x;
      });

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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [locations, onLocationSelect]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-xl overflow-hidden border border-white/10"
      style={{ minHeight: '600px' }}
    />
  );
}