import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import * as THREE from 'three';

function RiskCube({ position, risk, intensity }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  const color = new THREE.Color(
    intensity > 0.7 ? '#ef4444' :
    intensity > 0.4 ? '#f59e0b' : '#10b981'
  );

  return (
    <Box ref={meshRef} args={[0.8, intensity * 2, 0.8]} position={position}>
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </Box>
  );
}

export default function RiskHeatmap3D({ risks = [] }) {
  const gridSize = 5;
  const spacing = 2;
  
  const riskGrid = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const x = (i % gridSize) - gridSize / 2;
    const z = Math.floor(i / gridSize) - gridSize / 2;
    const intensity = Math.random(); // In real app, map risks to grid positions
    
    return {
      position: [x * spacing, 0, z * spacing],
      intensity,
      risk: risks[i % risks.length]
    };
  });

  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ef4444" />
      
      {riskGrid.map((item, i) => (
        <RiskCube
          key={i}
          position={item.position}
          risk={item.risk}
          intensity={item.intensity}
        />
      ))}
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
      <gridHelper args={[20, 20, '#334155', '#1e293b']} />
    </Canvas>
  );
}