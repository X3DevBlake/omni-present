import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';

function ResourceBar({ resource, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const usage = (resource.used_amount || 0) / (resource.allocated_amount || 1);
      const targetScale = [1, usage * 5, 1];
      meshRef.current.scale.x += (targetScale[0] - meshRef.current.scale.x) * 0.1;
      meshRef.current.scale.y += (targetScale[1] - meshRef.current.scale.y) * 0.1;
      meshRef.current.scale.z += (targetScale[2] - meshRef.current.scale.z) * 0.1;
    }
  });

  const typeColors = {
    cpu: '#00f5ff',
    gpu: '#a855f7',
    memory: '#00ff88',
    storage: '#ff8800',
    network: '#ff0066',
  };

  const color = typeColors[resource.resource_type] || '#888888';
  const usage = (resource.used_amount || 0) / (resource.allocated_amount || 1);

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 1, 0.8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={usage > 0.8 ? 1 : 0.5}
          transparent
          opacity={0.8}
        />
      </Box>

      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {resource.resource_type}
      </Text>

      <Text
        position={[0, 6, 0]}
        fontSize={0.15}
        color={usage > 0.8 ? '#ff4444' : '#00ff88'}
        anchorX="center"
      >
        {(usage * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function ResourceUtilization3D({ resources }) {
  const positions = resources.slice(0, 10).map((_, index) => {
    return [index * 2 - 5, 0, 0];
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />

        {resources.slice(0, 10).map((resource, index) => (
          <ResourceBar
            key={resource.id}
            resource={resource}
            position={positions[index]}
            index={index}
          />
        ))}

        <OrbitControls enableZoom={true} enablePan={false} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {resources.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No resource allocations</p>
        </div>
      )}
    </div>
  );
}