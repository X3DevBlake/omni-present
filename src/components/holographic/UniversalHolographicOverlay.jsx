import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus, Html } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function HolographicEntity({ projection, onClick }) {
  const meshRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const props = projection.visual_properties || {};
    const animType = props.animation_type || 'pulse';
    const speed = props.animation_speed || 1.0;
    const time = state.clock.elapsedTime * speed;

    switch (animType) {
      case 'pulse':
        const pulse = Math.sin(time * 2) * 0.2 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
        break;
      case 'rotate':
        meshRef.current.rotation.y += 0.01 * speed;
        break;
      case 'float':
        meshRef.current.position.y = (projection.spatial_anchor?.y || 0) + Math.sin(time) * 0.3;
        break;
      case 'shimmer':
        if (meshRef.current.material) {
          meshRef.current.material.emissiveIntensity = Math.sin(time * 3) * 0.3 + 0.7;
        }
        break;
    }

    // Particle effects
    if (particlesRef.current && props.animation_type === 'pulse') {
      particlesRef.current.rotation.y += 0.02;
    }
  });

  const anchor = projection.spatial_anchor || { x: 0, y: 1.5, z: 0 };
  const props = projection.visual_properties || {};
  const color = new THREE.Color(props.color || '#00FFFF');

  const renderShape = () => {
    switch (projection.content_type) {
      case 'agent_avatar':
        return (
          <Sphere args={[props.scale || 0.5, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={props.glow_intensity || 0.5}
              transparent
              opacity={props.opacity || 0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        );
      case 'data_visualization':
        return (
          <Box args={[props.scale || 1, props.scale || 1, props.scale || 1]}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={props.glow_intensity || 0.5}
              transparent
              opacity={props.opacity || 0.7}
              wireframe
            />
          </Box>
        );
      case 'ui_element':
        return (
          <Torus args={[props.scale || 0.5, 0.2, 16, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={props.glow_intensity || 0.8}
              transparent
              opacity={props.opacity || 0.9}
            />
          </Torus>
        );
      default:
        return (
          <Sphere args={[props.scale || 0.5, 16, 16]}>
            <meshStandardMaterial
              color={color}
              transparent
              opacity={props.opacity || 0.6}
            />
          </Sphere>
        );
    }
  };

  return (
    <group
      position={[anchor.x, anchor.y, anchor.z]}
      rotation={[anchor.rotation_x || 0, anchor.rotation_y || 0, anchor.rotation_z || 0]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={meshRef}>
        {renderShape()}
      </group>

      {/* Particle effects */}
      {props.animation_type === 'pulse' && (
        <group ref={particlesRef}>
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 1.5;
            return (
              <Sphere
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(i) * 0.5,
                  Math.sin(angle) * radius
                ]}
                args={[0.05, 8, 8]}
              >
                <meshBasicMaterial color={color} transparent opacity={0.6} />
              </Sphere>
            );
          })}
        </group>
      )}

      {hovered && projection.interactive && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-cyan-500">
            <div className="text-white text-xs font-semibold">
              {projection.content_type.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-cyan-400 text-xs">Click to interact</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function HolographicScene({ projections, onProjectionClick }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
      <pointLight position={[-10, 5, -10]} intensity={0.7} color="#FF00FF" />
      <pointLight position={[0, -5, 10]} intensity={0.5} color="#FFD700" />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        autoRotate={false}
        minDistance={3}
        maxDistance={30}
      />

      {projections.map((projection, idx) => (
        <HolographicEntity
          key={projection.id || idx}
          projection={projection}
          onClick={() => onProjectionClick(projection)}
        />
      ))}

      <gridHelper args={[20, 20, '#333333', '#111111']} position={[0, 0, 0]} />
    </>
  );
}

export default function UniversalHolographicOverlay({ 
  enabled = true,
  spatialBounds,
  contentTypes,
  onProjectionInteract
}) {
  const [selectedProjection, setSelectedProjection] = useState(null);

  const { data: projections = [], isLoading } = useQuery({
    queryKey: ['holographic-projections', spatialBounds, contentTypes],
    queryFn: async () => {
      const response = await base44.functions.invoke('holographicProjectionEngine', {
        action: 'query_projections',
        projection_data: {
          spatial_bounds: spatialBounds,
          content_types: contentTypes
        }
      });
      return response.data.projections || [];
    },
    refetchInterval: 2000,
    enabled
  });

  const handleProjectionClick = (projection) => {
    setSelectedProjection(projection);
    if (onProjectionInteract) {
      onProjectionInteract(projection);
    }
  };

  if (!enabled || projections.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-40"
    >
      <div className="h-full w-full pointer-events-auto">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <HolographicScene
            projections={projections}
            onProjectionClick={handleProjectionClick}
          />
        </Canvas>
      </div>

      {selectedProjection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur border border-cyan-500 rounded-lg p-4 max-w-xs">
            <div className="text-white font-semibold mb-2">
              {selectedProjection.content_type}
            </div>
            <div className="text-sm text-slate-300 mb-3">
              Position: ({selectedProjection.spatial_anchor.x.toFixed(1)}, {selectedProjection.spatial_anchor.y.toFixed(1)}, {selectedProjection.spatial_anchor.z.toFixed(1)})
            </div>
            <button
              onClick={() => setSelectedProjection(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}