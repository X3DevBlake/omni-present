import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Database, HardDrive, Wifi, ChevronRight } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

// Blueprint 3D Component
function BlueprintComponent({ component, index, exploded }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      const displacement = new THREE.Vector3(...component.position)
        .normalize()
        .multiplyScalar(exploded ? 1.8 : 0);
      
      groupRef.current.position.x = component.position[0] + displacement.x;
      groupRef.current.position.y = component.position[1] + displacement.y;
      groupRef.current.position.z = component.position[2] + displacement.z;
    }
  }, [exploded, component.position]);

  return (
    <group ref={groupRef} position={component.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={component.size} />
        <meshStandardMaterial
          color={component.color}
          transparent
          opacity={0.85}
          emissive={component.color}
          emissiveIntensity={hovered ? 0.7 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh>
        <boxGeometry args={component.size.map(s => s * 1.02)} />
        <meshBasicMaterial color={component.color} wireframe transparent opacity={hovered ? 0.8 : 0.5} />
      </mesh>
    </group>
  );
}

// 3D Blueprint Core
function BlueprintCore({ exploded }) {
  const groupRef = useRef();

  const components = [
    { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#00f5ff', label: 'Neural Core' },
    { position: [1.2, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 1' },
    { position: [-1.2, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 2' },
    { position: [0, 1, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Memory Pool' },
    { position: [0, -1, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Storage Layer' },
    { position: [0, 0, 1], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'Network Hub' },
    { position: [0, 0, -1], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'I/O Controller' },
  ];

  useFrame((state) => {
    if (groupRef.current && !exploded) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {components.map((comp, i) => (
        <BlueprintComponent
          key={i}
          component={comp}
          index={i}
          exploded={exploded}
        />
      ))}

      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#00f5ff" 
          transparent 
          opacity={0.03} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

const blueprintLayers = [
  { icon: Cpu, label: 'Hardware Layer', tech: 'NVIDIA Reference Architectures', feature: 'Exploded view of GPU/Networking nodes' },
  { icon: Database, label: 'Data Layer', tech: 'BigQuery / Vertex AI Streams', feature: 'Volumetric pulse indicating data flow' },
  { icon: HardDrive, label: 'Logic Layer', tech: 'Generative AI Building Design', feature: 'Real-time parameter-based updates' },
  { icon: Wifi, label: 'UI/UX Layer', tech: '@react-three/drei HTML Occlusion', feature: 'Hoverable annotations with live telemetry' },
];

export default function Blueprint() {
  const [exploded, setExploded] = useState(false);

  return (
    <AuroraBackground className="min-h-screen">
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Technical
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Blueprint</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg px-4">
              Explore the architecture powering omnipresent intelligence—a modular, high-performance AI core.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative order-2 lg:order-1"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 aspect-square relative overflow-hidden">
                <Canvas
                  camera={{ position: [5, 3, 5], fov: 45 }}
                  gl={{ antialias: true, alpha: true }}
                  dpr={[1, 2]}
                >
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} color="#00f5ff" />
                  <pointLight position={[-10, -10, -10]} intensity={0.6} color="#a855f7" />
                  <spotLight position={[0, 10, 0]} intensity={0.5} color="#ec4899" />
                  
                  <BlueprintCore exploded={exploded} />
                  
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={10}
                  />
                </Canvas>
                
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <button
                    onClick={() => setExploded(!exploded)}
                    className={`w-full py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      exploded 
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                        : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    }`}
                  >
                    {exploded ? 'Collapse View' : 'Exploded View'}
                  </button>
                </div>

                <div className="absolute top-4 left-4 lg:hidden">
                  <div className="px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                    <p className="text-white/60 text-xs">Pinch to zoom • Drag to rotate</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {blueprintLayers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <div key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{layer.label}</h3>
                        <p className="text-white/40 text-xs sm:text-sm mb-2">{layer.tech}</p>
                        <div className="flex items-center gap-2 text-cyan-400/70 text-xs sm:text-sm">
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{layer.feature}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
}