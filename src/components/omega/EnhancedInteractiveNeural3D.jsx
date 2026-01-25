import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text, Html, Float, Trail } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export const InteractiveNeuron = ({ position, id, type, connections, onClick, isSelected, onHover }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulseOffset] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + pulseOffset) * 0.1;
      const scale = isSelected ? 1.8 + pulse : hovered ? 1.4 : 1 + pulse * 0.3;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 3;
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3;
      }
    }
  });

  const typeColors = {
    cognitive: '#ec4899',
    sensory: '#3b82f6',
    motor: '#10b981',
    memory: '#f59e0b'
  };
  
  return (
    <group position={position}>
      <Float speed={isSelected ? 4 : 2} rotationIntensity={isSelected ? 2 : 0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.12, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick({ id, type, position, connections });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(id);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <meshPhysicalMaterial
            color={typeColors[type] || '#8b5cf6'}
            emissive={typeColors[type] || '#8b5cf6'}
            emissiveIntensity={isSelected ? 2 : hovered ? 1.5 : 0.8}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
        
        {/* Particle trail effect when selected */}
        {isSelected && (
          <Sphere args={[0.18, 16, 16]}>
            <meshBasicMaterial color={typeColors[type]} transparent opacity={0.15} />
          </Sphere>
        )}
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/95 border-2 border-purple-400 rounded-xl p-4 min-w-[200px] backdrop-blur-xl shadow-2xl"
            >
              <div className="text-purple-400 font-bold text-sm mb-2">Neuron #{id}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections:</span>
                  <span className="text-cyan-400 font-bold">{connections?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Activity:</span>
                  <span className="text-green-400">{(Math.random() * 100).toFixed(0)}%</span>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-purple-500/30 text-cyan-400 text-xs font-semibold">
                  ⚡ Firing pattern active
                </div>
              )}
            </motion.div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export const SynapticConnection = ({ from, to, strength, active, isHighlighted }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = active 
        ? 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.3
        : 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color={isHighlighted ? '#ec4899' : active ? '#3b82f6' : '#374151'}
      lineWidth={isHighlighted ? 3 : active ? 2 : 0.5}
      transparent
      opacity={isHighlighted ? 0.9 : active ? 0.6 : 0.2}
    />
  );
};

export const NeuralActivityPulse = ({ from, to, active }) => {
  const particleRef = useRef();
  
  useFrame((state) => {
    if (particleRef.current && active) {
      const t = (state.clock.elapsedTime % 1);
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromVec, toVec, t);
    }
  });

  return active ? (
    <Sphere ref={particleRef} args={[0.05, 12, 12]} position={from}>
      <meshBasicMaterial color="#fbbf24" />
    </Sphere>
  ) : null;
};