import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function NavigationPortal3D({ hub, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const config = hub.portal_3d_config;
    
    if (config?.animation_style === 'rotate') {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    } else if (config?.animation_style === 'pulse') {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale * (hovered ? 1.2 : 1));
    } else if (config?.animation_style === 'float') {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
    } else if (config?.animation_style === 'shimmer') {
      meshRef.current.rotation.z += 0.008;
    }

    if (meshRef.current.material) {
      meshRef.current.material.emissiveIntensity = hovered ? 1.2 : 0.6;
    }
  });

  const getGeometry = () => {
    const type = hub.portal_3d_config?.geometry_type;
    switch (type) {
      case 'sphere': return <sphereGeometry args={[0.8, 32, 32]} />;
      case 'torus': return <torusGeometry args={[0.7, 0.3, 16, 100]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.8, 1]} />;
      case 'octahedron': return <octahedronGeometry args={[0.8, 2]} />;
      default: return <sphereGeometry args={[0.8, 32, 32]} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={hub.portal_3d_config?.primary_color || '#00f5ff'}
          emissive={hub.portal_3d_config?.primary_color || '#00f5ff'}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {hub.portal_3d_config?.particle_effects && (
        <points>
          <sphereGeometry args={[1.2, 32, 32]} />
          <pointsMaterial
            size={0.03}
            color={hub.portal_3d_config?.secondary_color || '#a855f7'}
            transparent
            opacity={0.6}
          />
        </points>
      )}

      <Text
        position={[0, -1.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        fontWeight="bold"
      >
        {hub.display_name}
      </Text>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm border border-white/20">
            <div className="font-semibold">{hub.display_name}</div>
            {hub.usage_stats && (
              <div className="text-xs text-white/70 mt-1">
                {hub.usage_stats.total_visits} visits
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}