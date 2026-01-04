import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { X, Thermometer } from 'lucide-react';
import GlassCard from './GlassCard';

function HeatmapMesh({ stressData, componentPositions }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // Create heatmap texture
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#00f5ff');
    gradient.addColorStop(0.3, '#00ff00');
    gradient.addColorStop(0.6, '#ffff00');
    gradient.addColorStop(0.8, '#ff8800');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Animate based on stress data
      const time = state.clock.getElapsedTime();
      const avgStress = stressData.reduce((a, b) => a + b.value, 0) / stressData.length;
      materialRef.current.opacity = 0.3 + Math.sin(time * 2) * 0.1;
      materialRef.current.emissiveIntensity = avgStress / 100;
    }
  });

  return (
    <group>
      {/* Base grid */}
      <mesh ref={meshRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0.4}
          emissive="#ff6600"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stress indicators at component positions */}
      {stressData.map((data, idx) => {
        const position = componentPositions[idx] || [0, 0, 0];
        const intensity = data.value / 100;
        const color = intensity > 0.8 ? '#ff0000' : 
                      intensity > 0.6 ? '#ff8800' : 
                      intensity > 0.4 ? '#ffff00' : 
                      intensity > 0.2 ? '#00ff00' : '#00f5ff';
        
        return (
          <group key={idx} position={position}>
            {/* Stress sphere */}
            <mesh>
              <sphereGeometry args={[0.2 + intensity * 0.3, 16, 16]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.6}
                emissive={color}
                emissiveIntensity={intensity}
              />
            </mesh>
            
            {/* Pulsing ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.4, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={intensity * 0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function HeatmapVisualization({ simulationResults, onClose }) {
  const stressData = useMemo(() => {
    if (!simulationResults?.impacts) return [];
    
    return simulationResults.impacts.map((impact, idx) => ({
      component: impact.component,
      value: impact.severity === 'critical' ? 90 : 
             impact.severity === 'warning' ? 60 : 30,
      label: impact.impact
    }));
  }, [simulationResults]);

  const componentPositions = [
    [0, 0, 0],
    [1.2, 0, 0],
    [-1.2, 0, 0],
    [0, 0.8, 0],
    [0, -0.8, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[80vh]"
      >
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">3D Stress Heatmap</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 3D Heatmap */}
          <div className="flex-1 rounded-xl overflow-hidden bg-black/40">
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6600" />
              
              <HeatmapMesh 
                stressData={stressData} 
                componentPositions={componentPositions}
              />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
              />
            </Canvas>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm">Stress Level:</span>
              <div className="flex items-center gap-2">
                {[
                  { color: '#00f5ff', label: 'Low' },
                  { color: '#00ff00', label: 'Normal' },
                  { color: '#ffff00', label: 'Elevated' },
                  { color: '#ff8800', label: 'High' },
                  { color: '#ff0000', label: 'Critical' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white/60 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-white/40 text-xs">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}