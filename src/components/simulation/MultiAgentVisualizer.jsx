import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function MultiAgentVisualizer({ agentCount = 10, duration = 60 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const agentsRef = useRef([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create agent particles
    const agents = [];
    const colors = [0x00f5ff, 0xff00ff, 0xffd700, 0xff6347, 0x32cd32, 0x87ceeb];

    for (let i = 0; i < agentCount; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshPhongMaterial({ color: colors[i % colors.length] });
      const agent = new THREE.Mesh(geometry, material);

      agent.position.x = (Math.random() - 0.5) * 50;
      agent.position.y = (Math.random() - 0.5) * 50;
      agent.position.z = (Math.random() - 0.5) * 20;

      agent.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2,
        },
        originalColor: colors[i % colors.length],
      };

      scene.add(agent);
      agents.push(agent);
    }
    agentsRef.current = agents;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (isPlaying) {
        timeRef.current += 16.67; // ~60fps
        setProgress((timeRef.current / (duration * 1000)) * 100);

        if (timeRef.current >= duration * 1000) {
          setIsPlaying(false);
          timeRef.current = 0;
          setProgress(0);
        }
      }

      // Update agent positions
      agents.forEach((agent) => {
        agent.position.x += agent.userData.velocity.x;
        agent.position.y += agent.userData.velocity.y;
        agent.position.z += agent.userData.velocity.z;

        // Bounce off walls
        if (Math.abs(agent.position.x) > 25) agent.userData.velocity.x *= -1;
        if (Math.abs(agent.position.y) > 25) agent.userData.velocity.y *= -1;
        if (Math.abs(agent.position.z) > 10) agent.userData.velocity.z *= -1;

        agent.rotation.x += 0.01;
        agent.rotation.y += 0.01;
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

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [agentCount, duration]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    timeRef.current = 0;
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-white/10"
        style={{ height: '400px' }}
      />

      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 mx-4">
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>

        <span className="text-white text-sm font-mono">
          {Math.round(progress)}% / {duration}s
        </span>
      </div>
    </motion.div>
  );
}