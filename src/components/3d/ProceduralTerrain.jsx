import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function ProceduralTerrain({ cpuLoad = 50, activeProcesses = 0 }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 50, 50);
    const positions = geo.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      // Create terrain based on CPU load and active processes
      const noise = Math.sin(x * 0.1 + cpuLoad * 0.1) * Math.cos(y * 0.1) * (cpuLoad / 10);
      const processHeight = activeProcesses * 0.2;
      
      positions[i + 2] = noise + processHeight;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [cpuLoad, activeProcesses]);

  const getTerrainColor = () => {
    if (cpuLoad > 80) return '#ff4444'; // Red for high CPU
    if (cpuLoad > 50) return '#ffaa44'; // Orange for medium
    return '#44ff44'; // Green for healthy
  };

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <meshStandardMaterial color={getTerrainColor()} wireframe />
    </mesh>
  );
}