import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';
import { X, Layers, Scissors, Activity } from 'lucide-react';
import GlassCard from './GlassCard';

function IsolatedComponent({ component, viewMode, stressLevel }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const subComponentsRef = useRef([]);

  useFrame((state) => {
    if (meshRef.current && viewMode === 'exploded') {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }

    // Deformation effect based on stress
    if (meshRef.current && viewMode === 'stress') {
      const deformation = Math.sin(state.clock.getElapsedTime() * 2) * 0.02 * stressLevel;
      meshRef.current.scale.y = 1 + deformation;
    }
  });

  useEffect(() => {
    if (groupRef.current && viewMode === 'exploded') {
      // Explode sub-components
      subComponentsRef.current.forEach((mesh, i) => {
        if (mesh) {
          gsap.to(mesh.position, {
            y: (i - 1) * 0.5,
            duration: 1,
            ease: 'power2.out',
          });
        }
      });
    } else if (groupRef.current) {
      subComponentsRef.current.forEach((mesh) => {
        if (mesh) {
          gsap.to(mesh.position, {
            y: 0,
            duration: 1,
            ease: 'power2.out',
          });
        }
      });
    }
  }, [viewMode]);

  // Sub-components for exploded view
  const subComponents = [
    { size: [0.7, 0.1, 0.7], offset: 0, color: component.color, label: 'Top Layer' },
    { size: [0.6, 0.3, 0.6], offset: 0, color: component.color, label: 'Core' },
    { size: [0.7, 0.1, 0.7], offset: 0, color: component.color, label: 'Bottom Layer' },
  ];

  return (
    <group ref={groupRef}>
      {viewMode === 'exploded' ? (
        // Exploded view with sub-components
        subComponents.map((sub, i) => (
          <mesh
            key={i}
            ref={(el) => (subComponentsRef.current[i] = el)}
            position={[0, sub.offset, 0]}
          >
            <boxGeometry args={sub.size} />
            <meshStandardMaterial
              color={sub.color}
              transparent
              opacity={0.85}
              emissive={sub.color}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))
      ) : viewMode === 'cross-section' ? (
        // Cross-section view
        <group>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[component.size[0] * 0.6, component.size[1], component.size[2]]} />
            <meshStandardMaterial
              color={component.color}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Internal structures */}
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.1, component.size[1] * 0.8, component.size[2] * 0.8]} />
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.2, 0.1, 0]}>
            <boxGeometry args={[0.1, component.size[1] * 0.6, component.size[2] * 0.6]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ) : (
        // Normal or stress view
        <mesh ref={meshRef}>
          <boxGeometry args={component.size} />
          <meshStandardMaterial
            color={viewMode === 'stress' ? (stressLevel > 0.7 ? '#ef4444' : stressLevel > 0.4 ? '#f59e0b' : component.color) : component.color}
            transparent
            opacity={0.85}
            emissive={component.color}
            emissiveIntensity={viewMode === 'stress' ? 0.5 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Wireframe overlay */}
      <mesh>
        <boxGeometry args={component.size.map((s) => s * 1.02)} />
        <meshBasicMaterial color={component.color} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function ComponentIsolationView({ component, componentIndex, onClose, telemetry, onViewModeChange }) {
  const [viewMode, setViewMode] = React.useState('normal');
  const stressLevel = telemetry ? (componentIndex === 0 ? telemetry.cpuLoad / 100 : telemetry.gpuLoad / 100) : 0.5;

  React.useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode]);

  const viewModes = [
    { id: 'normal', label: 'Normal', icon: Layers },
    { id: 'exploded', label: 'Exploded', icon: Layers },
    { id: 'cross-section', label: 'Cross-Section', icon: Scissors },
    { id: 'stress', label: 'Stress Analysis', icon: Activity },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          <GlassCard className="flex-1 p-4 sm:p-6 flex flex-col" glow glowColor="cyan">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{component.label}</h2>
                <p className="text-cyan-400 text-sm">{component.description}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      viewMode === mode.id
                        ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-300'
                        : 'bg-white/5 border border-white/10 text-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 rounded-xl overflow-hidden bg-black/20">
              <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
                <pointLight position={[-5, -5, -5]} intensity={0.8} color="#a855f7" />
                <spotLight position={[0, 10, 0]} intensity={0.7} color="#ec4899" />

                <IsolatedComponent component={component} viewMode={viewMode} stressLevel={stressLevel} />

                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={viewMode === 'normal'}
                  autoRotateSpeed={2}
                />
              </Canvas>
            </div>

            {/* Info Panel */}
            {viewMode === 'stress' && (
              <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Current Load</span>
                  <span className={`font-bold ${stressLevel > 0.7 ? 'text-red-400' : stressLevel > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {Math.round(stressLevel * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${stressLevel > 0.7 ? 'bg-red-500' : stressLevel > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${stressLevel * 100}%` }}
                  />
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}