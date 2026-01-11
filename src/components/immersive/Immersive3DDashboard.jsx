import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, Maximize2 } from 'lucide-react';
import * as THREE from 'three';

function DataOrb({ position, color, size = 0.5 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe={false}
      />
    </mesh>
  );
}

function DataFlowLine({ start, end }) {
  const points = [start, end];
  return (
    <line>
      <bufferGeometry
        attach="geometry"
        vertices={points.map(p => new THREE.Vector3(...p))}
      />
      <lineBasicMaterial attach="material" color="#00f5ff" linewidth={2} />
    </line>
  );
}

function Dashboard3DScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls enableZoom={true} autoRotate={true} autoRotateSpeed={2} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Central Data Orb */}
      <DataOrb position={[0, 0, 0]} color="#00f5ff" size={1} />
      
      {/* Surrounding Data Points */}
      <DataOrb position={[3, 2, 0]} color="#a855f7" size={0.6} />
      <DataOrb position={[-3, 2, 0]} color="#ec4899" size={0.6} />
      <DataOrb position={[0, -3, 2]} color="#00ff00" size={0.6} />
      <DataOrb position={[2, -2, -3]} color="#fbbf24" size={0.5} />
      
      {/* Grid */}
      <gridHelper args={[20, 20]} position={[0, -4, 0]} />
    </>
  );
}

export default function Immersive3DDashboard({ data }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl overflow-hidden border border-white/10 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-96'
      }`}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <Dashboard3DScene />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLabels(!showLabels)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
          title="Toggle labels"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
          title="Voice control"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
        </motion.button>
      </div>

      {/* Data Info Overlay */}
      {showLabels && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-40 bg-black/60 backdrop-blur border border-white/10 rounded-lg p-4 max-w-xs"
        >
          <h4 className="text-cyan-400 font-bold mb-2">Real-time Analytics</h4>
          <div className="space-y-1 text-sm text-white/70">
            <p>Portfolio Value: $124,500</p>
            <p>Daily Change: +2.4%</p>
            <p>Active Agents: 3</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}