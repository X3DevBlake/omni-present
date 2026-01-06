import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function FloatingFeatureSphere({ position, color, label, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && state?.clock) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

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
    return features.map((_, i) => {
      if (i < features.length - 1) {
        const start = features[i].position;
        const end = features[i + 1].position;
        
        const points = [
          new THREE.Vector3(...start),
          new THREE.Vector3(...end)
        ];
        
        return new THREE.BufferGeometry().setFromPoints(points);
      }
      return null;
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
    if (particlesRef.current && state) {
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
    { position: [-5, 2, 0], color: '#00f5ff', label: 'Real-Time Intelligence' },
    { position: [0, 3, -3], color: '#a855f7', label: 'Neural Mesh' },
    { position: [5, 2, 0], color: '#ec4899', label: 'Context Awareness' },
    { position: [-3, -1, 2], color: '#3b82f6', label: 'Security' },
    { position: [3, -1, 2], color: '#10b981', label: 'Generative AI' }
  ];

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
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
            onClick={() => setSelectedFeature(feature)}
          />
        ))}
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {selectedFeature && (
        <motion.div
          className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{selectedFeature.label}</h3>
              <p className="text-white/60 text-sm">Explore this feature in our interactive 3D space</p>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}