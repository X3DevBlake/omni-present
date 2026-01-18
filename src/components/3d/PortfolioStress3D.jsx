import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Text } from '@react-three/drei';

function StressBar({ position, scenario }) {
  const meshRef = useRef();
  const height = Math.abs(scenario.impact) / 10;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Cylinder ref={meshRef} args={[0.3, 0.3, height, 32]} position={[0, height / 2, 0]}>
        <meshStandardMaterial 
          color={scenario.impact < -50 ? '#dc2626' : scenario.impact < -30 ? '#f59e0b' : '#eab308'}
          emissive={scenario.impact < -50 ? '#dc2626' : '#f59e0b'}
          emissiveIntensity={0.3}
        />
      </Cylinder>
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {scenario.impact}%
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        maxWidth={2}
      >
        {scenario.scenario}
      </Text>
    </group>
  );
}

export default function PortfolioStress3D({ scenarios = [] }) {
  const positions = scenarios.map((_, i) => {
    const x = (i - scenarios.length / 2) * 2;
    return [x, 0, 0];
  });

  return (
    <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ef4444" />
      
      {scenarios.map((scenario, i) => (
        <StressBar
          key={i}
          position={positions[i]}
          scenario={scenario}
        />
      ))}
      
      <OrbitControls enablePan={false} />
      <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />
    </Canvas>
  );
}