import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import GlassCard from './GlassCard';
import { Cpu, HardDrive, Wifi, Database, ChevronRight } from 'lucide-react';

// 3D Blueprint Component
function BlueprintCore({ exploded }) {
  const groupRef = useRef();
  const factor = exploded ? 1.5 : 0;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const components = [
    { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#00f5ff', label: 'Neural Core' },
    { position: [1.2, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array' },
    { position: [-1.2, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array' },
    { position: [0, 1, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Memory' },
    { position: [0, -1, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Storage' },
    { position: [0, 0, 1], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'Network' },
    { position: [0, 0, -1], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'I/O' },
  ];

  return (
    <group ref={groupRef}>
      {components.map((comp, i) => {
        const displacement = new THREE.Vector3(...comp.position).normalize().multiplyScalar(factor);
        const finalPos = [
          comp.position[0] + displacement.x,
          comp.position[1] + displacement.y,
          comp.position[2] + displacement.z,
        ];

        return (
          <group key={i} position={finalPos}>
            <mesh>
              <boxGeometry args={comp.size} />
              <meshStandardMaterial 
                color={comp.color} 
                transparent 
                opacity={0.8}
                emissive={comp.color}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Wireframe outline */}
            <mesh>
              <boxGeometry args={comp.size.map(s => s * 1.02)} />
              <meshBasicMaterial color={comp.color} wireframe transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Connection lines when not exploded */}
      {!exploded && (
        <>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 1.2, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.4} />
          </line>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, -1.2, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.4} />
          </line>
        </>
      )}
    </group>
  );
}

const blueprintLayers = [
  { icon: Cpu, label: 'Hardware Layer', tech: 'NVIDIA Reference Architectures', feature: 'Exploded view of GPU/Networking nodes' },
  { icon: Database, label: 'Data Layer', tech: 'BigQuery / Vertex AI Streams', feature: 'Volumetric pulse indicating data flow' },
  { icon: HardDrive, label: 'Logic Layer', tech: 'Generative AI Building Design', feature: 'Real-time parameter-based updates' },
  { icon: Wifi, label: 'UI/UX Layer', tech: '@react-three/drei HTML Occlusion', feature: 'Hoverable annotations with live telemetry' },
];

export default function BlueprintSection() {
  const [exploded, setExploded] = useState(false);

  return (
    <section id="blueprint" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Technical
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Blueprint</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            Explore the architecture powering omnipresent intelligence—a modular, high-performance AI core.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* 3D Blueprint */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <GlassCard className="aspect-square p-4">
              <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
                <BlueprintCore exploded={exploded} />
              </Canvas>
              
              {/* Explode Control */}
              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={() => setExploded(!exploded)}
                  className={`
                    w-full py-3 rounded-xl font-medium transition-all
                    ${exploded 
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                      : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'}
                  `}
                >
                  {exploded ? 'Collapse View' : 'Exploded View'}
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Blueprint Layers */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {blueprintLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <GlassCard key={index} className="p-5" hover>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-semibold mb-1">{layer.label}</h3>
                      <p className="text-white/40 text-sm mb-2">{layer.tech}</p>
                      <div className="flex items-center gap-2 text-cyan-400/70 text-sm">
                        <ChevronRight className="w-4 h-4" />
                        <span>{layer.feature}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}