import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import * as THREE from 'three';

function NetworkLayer({ layer, position, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  const size = Math.log(layer.units || 64) / 10;
  
  const typeColors = {
    'dense': '#3b82f6',
    'conv2d': '#10b981',
    'lstm': '#a855f7',
    'attention': '#fbbf24',
    'dropout': '#64748b'
  };
  
  const color = typeColors[layer.type] || '#ffffff';
  
  return (
    <group position={position}>
      <Box ref={meshRef} args={[size, 0.3, size]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </Box>
      
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {layer.type}
      </Text>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color="#00f5ff"
        anchorX="center"
      >
        {layer.units} units
      </Text>
    </group>
  );
}

export default function NeuralArchitectureExplorer3D({ architecture }) {
  if (!architecture?.layers) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No architecture data</p>
      </div>
    );
  }
  
  const layers = architecture.layers;
  
  const positions = React.useMemo(() => {
    return layers.map((_, idx) => {
      const x = (idx - layers.length / 2) * 1.5;
      return [x, 0, 0];
    });
  }, [layers]);
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Neural network layers */}
      {layers.map((layer, idx) => (
        <React.Fragment key={idx}>
          <NetworkLayer
            layer={layer}
            position={positions[idx]}
            index={idx}
          />
          
          {/* Connections to next layer */}
          {idx < layers.length - 1 && (
            <>
              <Line
                points={[
                  [positions[idx][0] + 0.5, 0.15, 0],
                  [positions[idx + 1][0] - 0.5, 0.15, 0]
                ]}
                color="#00f5ff"
                lineWidth={2}
                transparent
                opacity={0.4}
              />
              <Line
                points={[
                  [positions[idx][0] + 0.5, -0.15, 0],
                  [positions[idx + 1][0] - 0.5, -0.15, 0]
                ]}
                color="#00f5ff"
                lineWidth={2}
                transparent
                opacity={0.4}
              />
            </>
          )}
        </React.Fragment>
      ))}
      
      {/* Input marker */}
      <Sphere args={[0.15, 16, 16]} position={[positions[0][0] - 1.5, 0, 0]}>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
      </Sphere>
      <Text position={[positions[0][0] - 1.5, -0.5, 0]} fontSize={0.12} color="#10b981" anchorX="center">
        INPUT
      </Text>
      
      {/* Output marker */}
      <Sphere args={[0.15, 16, 16]} position={[positions[positions.length - 1][0] + 1.5, 0, 0]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
      </Sphere>
      <Text position={[positions[positions.length - 1][0] + 1.5, -0.5, 0]} fontSize={0.12} color="#ef4444" anchorX="center">
        OUTPUT
      </Text>
      
      <Text
        position={[0, 4, -4]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Neural Architecture
      </Text>
      
      <Text
        position={[0, 3.3, -4]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        {layers.length} Layers • {layers.reduce((sum, l) => sum + (l.units || 0), 0).toLocaleString()} Parameters
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
      />
    </Canvas>
  );
}