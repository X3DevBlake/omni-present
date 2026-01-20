import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

function SpatialAnchor({ anchor, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const hover = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = anchor.position[1] + hover;
    }
  });

  const colors = {
    'agent_profile': '#60a5fa',
    'market_data': '#10b981',
    'analytics': '#f59e0b',
    'collaboration': '#ec4899'
  };

  return (
    <group onClick={onClick}>
      <Box 
        ref={meshRef}
        args={[0.8, 0.8, 0.8]}
        position={anchor.position}
      >
        <meshStandardMaterial 
          color={colors[anchor.content_type] || '#6b7280'}
          emissive={colors[anchor.content_type] || '#6b7280'}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </Box>
      <Text
        position={[anchor.position[0], anchor.position[1] + 1, anchor.position[2]]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {anchor.content_type}
      </Text>
      <Text
        position={[anchor.position[0], anchor.position[1] + 0.6, anchor.position[2]]}
        fontSize={0.2}
        color="#a0a0a0"
        anchorX="center"
      >
        {anchor.interaction_type}
      </Text>
    </group>
  );
}

function HolographicLayer({ layer, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Plane
      ref={meshRef}
      args={[15, 10]}
      position={[0, 0, -layer.depth * 2]}
      rotation={[0, 0, 0]}
    >
      <meshStandardMaterial 
        color="#8b5cf6"
        transparent
        opacity={layer.opacity * 0.1}
        side={THREE.DoubleSide}
        wireframe
      />
    </Plane>
  );
}

export default function ImmersiveXRHub3D({ xrInterface, onAnchorClick }) {
  const spatialAnchors = xrInterface?.spatial_anchors || [];
  const holographicLayers = xrInterface?.holographic_layers || [];

  return (
    <Canvas camera={{ position: [0, 3, 10], fov: 75 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, 5, -10]} intensity={0.6} color="#8b5cf6" />
      <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.8} />

      {/* XR Space Grid */}
      <gridHelper args={[20, 20, '#404040', '#202020']} />

      {/* Central XR Core */}
      <Sphere args={[1, 64, 64]} position={[0, 2, 0]}>
        <meshStandardMaterial 
          color="#ec4899" 
          emissive="#ec4899" 
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Immersive XR Interface
      </Text>
      <Text position={[0, 3.4, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {xrInterface?.interface_type?.toUpperCase() || 'MIXED REALITY'}
      </Text>

      {/* Spatial Anchors */}
      {spatialAnchors.map((anchor, i) => (
        <SpatialAnchor
          key={i}
          anchor={anchor}
          onClick={() => onAnchorClick?.(anchor)}
        />
      ))}

      {/* Holographic Layers */}
      {holographicLayers.map((layer, i) => (
        <HolographicLayer key={i} layer={layer} index={i} />
      ))}

      {/* Gesture Indicators */}
      {xrInterface?.user_presence?.hand_tracking_enabled && (
        <group position={[-8, 1, 0]}>
          <Text fontSize={0.3} color="#60a5fa">
            ✋ Hand Tracking
          </Text>
        </group>
      )}

      {xrInterface?.user_presence?.eye_tracking_enabled && (
        <group position={[8, 1, 0]}>
          <Text fontSize={0.3} color="#10b981">
            👁️ Eye Tracking
          </Text>
        </group>
      )}

      {xrInterface?.user_presence?.spatial_audio_enabled && (
        <group position={[0, -2, 0]}>
          <Text fontSize={0.3} color="#f59e0b">
            🔊 Spatial Audio
          </Text>
        </group>
      )}

      <OrbitControls 
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
      />
    </Canvas>
  );
}