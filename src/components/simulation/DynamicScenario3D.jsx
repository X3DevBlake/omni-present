import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AdaptiveRule({ rule, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + index) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const color = rule.triggered ? '#00ff88' : '#a855f7';

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 0.3, 1]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={rule.triggered ? 0.8 : 0.4}
          transparent
          opacity={0.8}
        />
      </Box>

      <Text
        position={[0, 1, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {rule.rule_name}
      </Text>
    </group>
  );
}

export default function DynamicScenario3D({ scenario }) {
  const rules = scenario?.adaptive_rules || [];

  const positions = rules.map((_, index) => {
    const angle = (index / rules.length) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5) * 2,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {/* Central scenario core */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </Sphere>

        {rules.map((rule, index) => (
          <React.Fragment key={index}>
            <AdaptiveRule rule={rule} position={positions[index]} index={index} />
            
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#a855f7"
              lineWidth={2}
              transparent
              opacity={0.4}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>

      {!scenario && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Generate a scenario to visualize</p>
        </div>
      )}
    </div>
  );
}