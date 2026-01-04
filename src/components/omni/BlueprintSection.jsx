import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from './GlassCard';
import ComponentDetailPanel from './ComponentDetailPanel';
import { Cpu, HardDrive, Wifi, Database, ChevronRight, Mic, MicOff } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Enhanced Component with Annotations and Click Handler
function BlueprintComponent({ component, index, exploded, hoveredComponent, setHoveredComponent, onComponentClick, focusedComponent }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || focusedComponent === index ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Add rotation animation when focused
      if (focusedComponent === index) {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      }
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      const displacement = new THREE.Vector3(...component.position)
        .normalize()
        .multiplyScalar(exploded ? 1.8 : 0);
      
      gsap.to(groupRef.current.position, {
        x: component.position[0] + displacement.x,
        y: component.position[1] + displacement.y,
        z: component.position[2] + displacement.z,
        duration: 1,
        ease: 'power2.inOut',
      });
    }
  }, [exploded, component.position]);

  return (
    <group ref={groupRef} position={component.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          setHoveredComponent(index);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredComponent(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={() => onComponentClick(index)}
      >
        <boxGeometry args={component.size} />
        <meshStandardMaterial
          color={component.color}
          transparent
          opacity={0.85}
          emissive={component.color}
          emissiveIntensity={hovered || focusedComponent === index ? 0.7 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Wireframe */}
      <mesh>
        <boxGeometry args={component.size.map(s => s * 1.02)} />
        <meshBasicMaterial color={component.color} wireframe transparent opacity={hovered ? 0.8 : 0.5} />
      </mesh>
      
      {/* Spectral glow when focused */}
      {focusedComponent === index && (
        <mesh>
          <sphereGeometry args={[Math.max(...component.size) * 0.8, 16, 16]} />
          <meshBasicMaterial color={component.color} transparent opacity={0.1} />
        </mesh>
      )}

      {/* HTML Annotation with Occlusion */}
      <Html
        position={[0, component.size[1] / 2 + 0.3, 0]}
        center
        occlude
        style={{
          transition: 'all 0.3s',
          opacity: hovered || hoveredComponent === index || focusedComponent === index ? 1 : 0.6,
          transform: `scale(${hovered || hoveredComponent === index || focusedComponent === index ? 1.1 : 0.85})`,
        }}
      >
        <div className="pointer-events-none">
          <div className={`bg-black/90 backdrop-blur-xl border rounded-lg px-3 py-2 min-w-[120px] shadow-lg transition-all ${
            focusedComponent === index ? 'border-cyan-400/60 shadow-cyan-400/20' : 'border-white/20'
          }`}>
            <div className="text-xs font-semibold text-white mb-1">{component.label}</div>
            <div className="text-[10px] text-white/50">{component.description}</div>
            {component.stats && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="text-[10px] text-cyan-400">{component.stats}</div>
              </div>
            )}
            {(hovered || focusedComponent === index) && (
              <div className="mt-2 text-[9px] text-white/40">Click for details</div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Camera Controller with Scroll Sync
function CameraController({ scrollProgress }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Orbit camera based on scroll progress
    const angle = scrollProgress * Math.PI * 2;
    const radius = 6 + Math.sin(scrollProgress * Math.PI) * 1;
    const height = 2 + Math.sin(scrollProgress * Math.PI * 2) * 1;
    
    camera.position.x = Math.sin(angle) * radius;
    camera.position.y = height;
    camera.position.z = Math.cos(angle) * radius;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// 3D Blueprint Core
function BlueprintCore({ exploded, scrollProgress, focusedComponent, onComponentClick }) {
  const groupRef = useRef();
  const [hoveredComponent, setHoveredComponent] = useState(null);

  const components = [
    { 
      position: [0, 0, 0], 
      size: [0.8, 0.8, 0.8], 
      color: '#00f5ff', 
      label: 'Neural Core',
      description: 'Central AI processor',
      stats: '2.5 PetaFLOPS'
    },
    { 
      position: [1.2, 0, 0], 
      size: [0.5, 0.5, 0.5], 
      color: '#a855f7', 
      label: 'GPU Array 1',
      description: 'NVIDIA HGX 8-GPU',
      stats: '640GB HBM3'
    },
    { 
      position: [-1.2, 0, 0], 
      size: [0.5, 0.5, 0.5], 
      color: '#a855f7', 
      label: 'GPU Array 2',
      description: 'NVIDIA HGX 8-GPU',
      stats: '640GB HBM3'
    },
    { 
      position: [0, 1, 0], 
      size: [0.4, 0.3, 0.6], 
      color: '#ec4899', 
      label: 'Memory Pool',
      description: 'DDR5 System RAM',
      stats: '2TB Capacity'
    },
    { 
      position: [0, -1, 0], 
      size: [0.4, 0.3, 0.6], 
      color: '#ec4899', 
      label: 'Storage Layer',
      description: 'NVMe SSD Array',
      stats: '50TB Storage'
    },
    { 
      position: [0, 0, 1], 
      size: [0.3, 0.3, 0.3], 
      color: '#3b82f6', 
      label: 'Network Hub',
      description: '400Gbps InfiniBand',
      stats: 'Low-latency mesh'
    },
    { 
      position: [0, 0, -1], 
      size: [0.3, 0.3, 0.3], 
      color: '#3b82f6', 
      label: 'I/O Controller',
      description: 'PCIe Gen5 Interface',
      stats: '128 GT/s'
    },
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
          hoveredComponent={hoveredComponent}
          setHoveredComponent={setHoveredComponent}
          onComponentClick={onComponentClick}
          focusedComponent={focusedComponent}
        />
      ))}

      {/* Energy field effect */}
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

// Voice Assistant Component with Contextual Awareness
function VoiceAssistant({ onTranscript, focusedComponent }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const componentExplanations = {
    0: "The Neural Core is the heart of our system, operating at 2.5 PetaFLOPS. It uses a custom tensor core array architecture with support for multiple precision formats. The liquid cooling with phase change technology keeps this 450W powerhouse running at optimal temperatures.",
    1: "GPU Array 1 features NVIDIA HGX 8-GPU configuration with 640GB of HBM3 memory. Each GPU has 142,336 CUDA cores and delivers 700 watts of processing power. The 900 GB/s NVLink interconnect ensures seamless communication between GPUs.",
    2: "GPU Array 2 provides redundancy and load balancing. It mirrors Array 1's specifications, ensuring continuous operation even during intensive AI training workloads. The dual-array architecture maximizes throughput and reliability.",
    3: "The Memory Pool provides 2TB of DDR5 RAM running at 5600 MT/s across 8 channels. With 358 GB/s bandwidth and full ECC support, it handles massive datasets for real-time AI processing without bottlenecks.",
    4: "Our Storage Layer uses PCIe Gen5 NVMe SSDs with 50TB capacity. Read speeds reach 14,000 MB/s with 2.5 million IOPS, ensuring instant access to AI models and training data. The 10 DWPD endurance rating guarantees long-term reliability.",
    5: "The Network Hub uses InfiniBand HDR technology delivering 400 Gbps with sub-microsecond latency. The fat-tree mesh topology and RDMA support enable efficient data movement between all system components.",
    6: "The I/O Controller manages 64 lanes of PCIe Gen5, providing 128 GT/s bandwidth. It supports advanced protocols like NVMe and CXL 3.0, with 16 independent DMA engines for parallel data transfers."
  };

  useEffect(() => {
    if (focusedComponent !== null) {
      setTranscript(componentExplanations[focusedComponent] || "Component information loading...");
      onTranscript?.(componentExplanations[focusedComponent]);
    }
  }, [focusedComponent]);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening... Hover over or click any component for information.');
      
      setTimeout(() => {
        const generalResponse = focusedComponent !== null 
          ? componentExplanations[focusedComponent]
          : "I can explain any component in the blueprint. Try clicking on different parts to learn more about their specifications and role in the system.";
        setTranscript(generalResponse);
        onTranscript?.(generalResponse);
        
        setTimeout(() => {
          setIsListening(false);
        }, 6000);
      }, 1500);
    } else {
      setIsListening(false);
      if (focusedComponent === null) {
        setTranscript('');
      }
    }
  };

  return (
    <div className="absolute top-6 right-6 z-10">
      <motion.button
        onClick={toggleListening}
        className={`
          p-3 rounded-full transition-all shadow-lg
          ${isListening 
            ? 'bg-red-500/20 border-2 border-red-500/60 text-red-400' 
            : 'bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400'}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { scale: [1, 1.1, 1] } : {}}
        transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </motion.button>
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 max-w-xs"
        >
          <p className="text-white/80 text-sm">{transcript}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function BlueprintSection() {
  const [exploded, setExploded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [focusedComponent, setFocusedComponent] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => scrollTrigger.kill();
  }, []);

  return (
    <section id="blueprint" ref={sectionRef} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
          {/* 3D Blueprint with Touch Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <GlassCard className="aspect-square relative overflow-hidden">
              <Canvas
                ref={canvasRef}
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
                  focusedComponent={focusedComponent}
                  onComponentClick={(index) => {
                    setFocusedComponent(index);
                    setSelectedComponent(index);
                  }}
                />
                <CameraController scrollProgress={scrollProgress} />
                
                {/* Touch Controls for Mobile */}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={10}
                  touches={{
                    ONE: THREE.TOUCH.ROTATE,
                    TWO: THREE.TOUCH.DOLLY_PAN
                  }}
                />
              </Canvas>
              
              {/* Voice Assistant */}
              <VoiceAssistant 
                focusedComponent={focusedComponent}
                onTranscript={(text) => console.log('Assistant:', text)} 
              />
              
              {/* Controls */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex gap-3">
                <button
                  onClick={() => setExploded(!exploded)}
                  className={`
                    flex-1 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base
                    ${exploded 
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                      : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'}
                  `}
                >
                  {exploded ? 'Collapse' : 'Explode'}
                </button>
                
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 text-xs sm:text-sm whitespace-nowrap">
                  Scroll: {Math.round(scrollProgress * 100)}%
                </div>
              </div>

              {/* Mobile Instructions */}
              <div className="absolute top-4 left-4 lg:hidden">
                <div className="px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                  <p className="text-white/60 text-xs">Pinch to zoom • Drag to rotate</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Blueprint Layers - Responsive Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {blueprintLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <GlassCard key={index} className="p-4 sm:p-5" hover>
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
                </GlassCard>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-12 lg:mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-white/30 text-sm">Scroll to explore the blueprint from different angles</p>
          <div className="mt-4 mx-auto w-48 sm:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}