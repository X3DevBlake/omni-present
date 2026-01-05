import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Database, HardDrive, Wifi, ChevronRight, X, Info, Layers, Plus, Trash2 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

// Component data with detailed info
const componentsData = [
  { 
    position: [0, 0, 0], 
    size: [0.8, 0.8, 0.8], 
    color: '#00f5ff', 
    label: 'Neural Core',
    description: 'Central AI processor',
    stats: '2.5 PetaFLOPS',
    details: {
      specs: 'Custom tensor core array with multi-precision support',
      power: '450W TDP',
      cooling: 'Liquid cooling with phase change technology',
      performance: 'INT8: 5 PFLOPS, FP16: 2.5 PFLOPS, FP32: 1.25 PFLOPS'
    }
  },
  { 
    position: [1.2, 0, 0], 
    size: [0.5, 0.5, 0.5], 
    color: '#a855f7', 
    label: 'GPU Array 1',
    description: 'NVIDIA HGX 8-GPU',
    stats: '640GB HBM3',
    details: {
      specs: 'NVIDIA HGX H100 configuration',
      cores: '142,336 CUDA cores per GPU',
      memory: '80GB HBM3 per GPU, 900 GB/s bandwidth',
      interconnect: 'NVLink 900 GB/s per GPU'
    }
  },
  { 
    position: [-1.2, 0, 0], 
    size: [0.5, 0.5, 0.5], 
    color: '#a855f7', 
    label: 'GPU Array 2',
    description: 'NVIDIA HGX 8-GPU',
    stats: '640GB HBM3',
    details: {
      specs: 'Redundant HGX H100 for load balancing',
      cores: '142,336 CUDA cores per GPU',
      memory: '80GB HBM3 per GPU',
      purpose: 'Ensures continuous operation during intensive workloads'
    }
  },
  { 
    position: [0, 1, 0], 
    size: [0.4, 0.3, 0.6], 
    color: '#ec4899', 
    label: 'Memory Pool',
    description: 'DDR5 System RAM',
    stats: '2TB Capacity',
    details: {
      specs: 'DDR5-5600 across 8 channels',
      bandwidth: '358 GB/s aggregate',
      ecc: 'Full ECC support',
      latency: 'CL40 (7.14ns)'
    }
  },
  { 
    position: [0, -1, 0], 
    size: [0.4, 0.3, 0.6], 
    color: '#ec4899', 
    label: 'Storage Layer',
    description: 'NVMe SSD Array',
    stats: '50TB Storage',
    details: {
      specs: 'PCIe Gen5 NVMe SSDs',
      speed: '14,000 MB/s read, 12,000 MB/s write',
      iops: '2.5M random IOPS',
      endurance: '10 DWPD (Drive Writes Per Day)'
    }
  },
  { 
    position: [0, 0, 1], 
    size: [0.3, 0.3, 0.3], 
    color: '#3b82f6', 
    label: 'Network Hub',
    description: '400Gbps InfiniBand',
    stats: 'Low-latency mesh',
    details: {
      specs: 'InfiniBand HDR (High Data Rate)',
      bandwidth: '400 Gbps bidirectional',
      latency: 'Sub-microsecond',
      topology: 'Fat-tree mesh with RDMA'
    }
  },
  { 
    position: [0, 0, -1], 
    size: [0.3, 0.3, 0.3], 
    color: '#3b82f6', 
    label: 'I/O Controller',
    description: 'PCIe Gen5 Interface',
    stats: '128 GT/s',
    details: {
      specs: 'PCIe 5.0 x64 lanes',
      bandwidth: '128 GT/s (256 GB/s bidirectional)',
      protocols: 'NVMe, CXL 3.0',
      dma: '16 independent DMA engines'
    }
  },
];

// Blueprint 3D Component with animations
function BlueprintComponent({ component, index, exploded, scrollProgress, isSelected, onClick, buildMode, onBuildModeClick }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Rotation based on scroll
      if (!buildMode && !exploded) {
        meshRef.current.rotation.y = scrollProgress * Math.PI * 2 + index * 0.5;
      }

      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      const displacement = new THREE.Vector3(...component.position)
        .normalize()
        .multiplyScalar(exploded ? 1.8 : 0);
      
      const targetX = component.position[0] + displacement.x;
      const targetY = component.position[1] + displacement.y;
      const targetZ = component.position[2] + displacement.z;

      if (buildMode) {
        return;
      }

      const startX = groupRef.current.position.x;
      const startY = groupRef.current.position.y;
      const startZ = groupRef.current.position.z;

      let progress = 0;
      const animate = () => {
        progress += 0.02;
        if (progress < 1) {
          groupRef.current.position.x = startX + (targetX - startX) * progress;
          groupRef.current.position.y = startY + (targetY - startY) * progress;
          groupRef.current.position.z = startZ + (targetZ - startZ) * progress;
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [exploded, component.position, buildMode]);

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
        onClick={(e) => {
          e.stopPropagation();
          if (buildMode) {
            onBuildModeClick?.();
          } else {
            onClick?.();
          }
        }}
      >
        <boxGeometry args={component.size} />
        <meshStandardMaterial
          color={component.color}
          transparent
          opacity={buildMode ? 0.7 : 0.85}
          emissive={component.color}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh>
        <boxGeometry args={component.size.map(s => s * 1.02)} />
        <meshBasicMaterial 
          color={component.color} 
          wireframe 
          transparent 
          opacity={hovered || isSelected ? 0.8 : 0.5} 
        />
      </mesh>

      {isSelected && (
        <mesh>
          <sphereGeometry args={[Math.max(...component.size) * 0.8, 16, 16]} />
          <meshBasicMaterial color={component.color} transparent opacity={0.1} />
        </mesh>
      )}

      {(hovered || isSelected) && !buildMode && (
        <Html position={[0, component.size[1] / 2 + 0.4, 0]} center>
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 min-w-[120px] shadow-xl pointer-events-none">
            <div className="text-xs font-semibold text-white">{component.label}</div>
            <div className="text-[10px] text-cyan-400 mt-1">{component.stats}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Blueprint Core
function BlueprintCore({ exploded, scrollProgress, selectedComponent, onComponentClick, buildMode, buildComponents, onBuildComponentClick }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && !exploded && !buildMode) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  const componentsToRender = buildMode ? buildComponents : componentsData;

  return (
    <group ref={groupRef}>
      {componentsToRender.map((comp, i) => (
        <BlueprintComponent
          key={buildMode ? comp.id : i}
          component={comp}
          index={i}
          exploded={exploded}
          scrollProgress={scrollProgress}
          isSelected={selectedComponent === i}
          onClick={() => !buildMode && onComponentClick(i)}
          buildMode={buildMode}
          onBuildModeClick={() => buildMode && onBuildComponentClick(i)}
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [buildMode, setBuildMode] = useState(false);
  const [buildComponents, setBuildComponents] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / viewportHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addComponentToBuild = (componentType) => {
    const baseComponent = componentsData[componentType];
    const newComponent = {
      ...baseComponent,
      id: `${Date.now()}-${Math.random()}`,
      position: [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 3
      ]
    };
    setBuildComponents([...buildComponents, newComponent]);
  };

  const removeComponentFromBuild = (index) => {
    setBuildComponents(buildComponents.filter((_, i) => i !== index));
  };

  const selectedComponentData = componentsData[selectedComponent];

  return (
    <AuroraBackground className="min-h-screen">
      <section ref={sectionRef} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Technical
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Blueprint</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg px-4">
              {buildMode ? 'Assemble your custom AI infrastructure' : 'Explore the architecture powering omnipresent intelligence'}
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
                  
                  <BlueprintCore 
                    exploded={exploded} 
                    scrollProgress={scrollProgress}
                    selectedComponent={selectedComponent}
                    onComponentClick={setSelectedComponent}
                    buildMode={buildMode}
                    buildComponents={buildComponents}
                    onBuildComponentClick={removeComponentFromBuild}
                  />
                  
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={10}
                  />
                </Canvas>
                
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex gap-2">
                  {!buildMode && (
                    <button
                      onClick={() => setExploded(!exploded)}
                      className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                        exploded 
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                          : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                      }`}
                    >
                      {exploded ? 'Collapse' : 'Explode'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setBuildMode(!buildMode);
                      setSelectedComponent(null);
                      if (!buildMode) setBuildComponents([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      buildMode
                        ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                        : 'bg-green-500/20 border border-green-500/40 text-green-300'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    {buildMode ? 'Exit Build' : 'Build Mode'}
                  </button>
                </div>

                <div className="absolute top-4 left-4 lg:hidden">
                  <div className="px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                    <p className="text-white/60 text-xs">Pinch to zoom • Drag to rotate</p>
                  </div>
                </div>

                {!buildMode && (
                  <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-cyan-500/30">
                    <div className="text-cyan-400 text-xs font-medium">
                      Scroll: {Math.round(scrollProgress * 100)}%
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {buildMode ? (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg mb-3">Add Components</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                    {componentsData.map((comp, index) => (
                      <button
                        key={index}
                        onClick={() => addComponentToBuild(index)}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: comp.color, opacity: 0.5 }} />
                        </div>
                        <div className="text-white text-sm font-medium text-left">{comp.label}</div>
                        <div className="text-white/40 text-xs text-left">{comp.stats}</div>
                      </button>
                    ))}
                  </div>
                  
                  {buildComponents.length > 0 && (
                    <div className="mt-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                      <h4 className="text-white font-medium mb-2 text-sm">Your Build ({buildComponents.length})</h4>
                      <div className="text-white/60 text-xs">Click components in 3D view to remove them</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {blueprintLayers.map((layer, index) => {
                    const Icon = layer.icon;
                    return (
                      <div key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-white font-semibold mb-1 text-sm">{layer.label}</h3>
                            <p className="text-white/40 text-xs mb-2">{layer.tech}</p>
                            <div className="flex items-center gap-2 text-cyan-400/70 text-xs">
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{layer.feature}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Component Detail Panel */}
      <AnimatePresence>
        {selectedComponent !== null && selectedComponentData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedComponent(null)}
            />
            <motion.div
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setSelectedComponent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedComponentData.color, opacity: 0.2 }}
                >
                  <Info className="w-8 h-8" style={{ color: selectedComponentData.color }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedComponentData.label}</h3>
                  <p className="text-white/50">{selectedComponentData.description}</p>
                  <div className="mt-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm inline-block">
                    {selectedComponentData.stats}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(selectedComponentData.details).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded-xl p-4">
                    <div className="text-cyan-400 text-sm font-medium mb-1 capitalize">{key}</div>
                    <div className="text-white/80 text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
}