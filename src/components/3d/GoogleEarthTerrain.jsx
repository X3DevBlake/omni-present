import React, { useMemo } from 'react';
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';

export default function GoogleEarthTerrain({ config }) {
  // Generate procedural terrain based on Google Earth coordinates
  const terrain = useMemo(() => {
    const size = 100;
    const segments = 50;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Generate height map (simplified - would use actual elevation data)
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      vertices[i + 2] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2; // Height
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [config]);

  // Simplified building representation
  const buildings = useMemo(() => {
    if (!config?.buildings_enabled) return [];
    
    const buildingCount = 20;
    return Array.from({ length: buildingCount }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 80,
      z: (Math.random() - 0.5) * 80,
      height: Math.random() * 10 + 5,
      width: Math.random() * 3 + 2
    }));
  }, [config]);

  return (
    <group>
      {/* Terrain */}
      {config?.terrain_enabled && (
        <mesh geometry={terrain} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <meshStandardMaterial 
            color="#1a3a1a"
            wireframe={false}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Grid */}
      <gridHelper args={[100, 50, '#00FFFF', '#8A2BE2']} position={[0, -4.9, 0]} />

      {/* Buildings */}
      {buildings.map((building) => (
        <Box 
          key={building.id}
          args={[building.width, building.height, building.width]}
          position={[building.x, building.height / 2 - 5, building.z]}
        >
          <meshPhongMaterial 
            color="#2a2a3a"
            emissive="#00FFFF"
            emissiveIntensity={0.1}
            transparent
            opacity={0.8}
          />
        </Box>
      ))}

      {/* Location Info */}
      {config && (
        <mesh position={[0, -4, 0]}>
          <planeGeometry args={[20, 5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}