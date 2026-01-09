import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as THREE from 'three';

function FloatingFeatureSphere({ position, color, label, description, stats, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && state && state.clock) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });
  
  useFrame(() => {}, [hovered]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {hovered && (
          <Sphere args={[1.3, 32, 32]} position={[0, 0, 0]}>
            <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
          </Sphere>
        )}
        
        <mesh position={[0, -1.5, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.8 : 0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function ConnectionLines({ features }) {
  const geometries = React.useMemo(() => {
    if (!features || features.length === 0) return [];
    return features.map((feature, i) => {
      if (!feature || !feature.position || i >= features.length - 1) return null;
      const next = features[i + 1];
      if (!next || !next.position) return null;
      
      const start = feature.position;
      const end = next.position;
      
      const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ];
      
      return new THREE.BufferGeometry().setFromPoints(points);
    }).filter(Boolean);
  }, [features]);

  return (
    <group>
      {geometries.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial color="#00f5ff" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  );
}

function ParticleField() {
  const particlesRef = useRef();
  const particleCount = 1000;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f5ff" transparent opacity={0.6} />
    </points>
  );
}

export default function Interactive3DFeatures() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    { 
      position: [-5, 2, 0], 
      color: '#00f5ff', 
      label: 'Real-Time Intelligence',
      description: 'Process and analyze data instantly with sub-millisecond latency.',
      stats: ['<1ms Response', '99.99% Uptime', '10M+ Requests/sec']
    },
    { 
      position: [0, 3, -3], 
      color: '#a855f7', 
      label: 'Neural Mesh',
      description: 'Distributed AI network that learns and adapts across all nodes.',
      stats: ['Self-Healing', 'Auto-Scaling', 'Edge Computing']
    },
    { 
      position: [5, 2, 0], 
      color: '#ec4899', 
      label: 'Context Awareness',
      description: 'Understand user intent and environment for personalized responses.',
      stats: ['Multi-Modal', 'Semantic Search', 'Predictive']
    },
    { 
      position: [-3, -1, 2], 
      color: '#3b82f6', 
      label: 'Security',
      description: 'Enterprise-grade security with end-to-end encryption and compliance.',
      stats: ['Zero Trust', 'SOC 2 Certified', 'GDPR Compliant']
    },
    { 
      position: [3, -1, 2], 
      color: '#10b981', 
      label: 'Generative AI',
      description: 'Create content, code, and solutions with advanced AI models.',
      stats: ['GPT-4 Powered', 'Fine-Tunable', 'Multi-Language']
    }
  ];

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-black/20">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <ParticleField />
        <ConnectionLines features={features} />
        
        {features.map((feature, i) => (
          <FloatingFeatureSphere
            key={i}
            position={feature.position}
            color={feature.color}
            label={feature.label}
            description={feature.description}
            stats={feature.stats}
            onClick={() => setSelectedFeature(feature)}
          />
        ))}
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {selectedFeature && (
        <motion.div
          className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedFeature.color}20`, border: `2px solid ${selectedFeature.color}40` }}>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: selectedFeature.color }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1">{selectedFeature.label}</h3>
                <p className="text-white/70 text-sm">{selectedFeature.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {selectedFeature.stats.map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-xs text-white/60 mb-1">Feature {i + 1}</div>
                <div className="text-white font-semibold text-sm">{stat}</div>
              </div>
            ))}
          </div>

          <button 
            className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(to right, ${selectedFeature.color}, ${selectedFeature.color}cc)` }}
          >
            Learn More →
          </button>
        </motion.div>
      )}
    </div>
  );
}