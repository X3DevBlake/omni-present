import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function TerrainMesh({ config }) {
  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    const size = config.terrain_config?.size_km || 10;
    const segments = 50;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    
    const vertices = geo.attributes.position.array;
    const variance = config.terrain_config?.elevation_variance || 1;
    
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * variance;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [config]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial 
        color="#2a9d8f" 
        wireframe={false}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function DynamicElement({ element, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group>
      <Box ref={meshRef} args={[0.5, 0.5, 0.5]} position={position}>
        <meshStandardMaterial color="#f4a261" emissive="#f4a261" emissiveIntensity={0.3} />
      </Box>
      <Text
        position={[position[0], position[1] + 1, position[2]]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {element.element_type}
      </Text>
    </group>
  );
}

export default function ProceduralEnvironmentGenerator3D({ environment }) {
  if (!environment) {
    return (
      <div className="h-[500px] flex items-center justify-center text-white/60">
        Generate an environment to see visualization
      </div>
    );
  }

  const dynamicElements = environment.dynamic_elements || [];
  const elementPositions = dynamicElements.map((_, i) => {
    const angle = (i / dynamicElements.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <div className="h-[500px] w-full bg-black/40 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#264653" />

        {/* Terrain */}
        <TerrainMesh config={environment} />

        {/* Dynamic elements */}
        {dynamicElements.map((element, index) => (
          <DynamicElement 
            key={index}
            element={element}
            position={elementPositions[index]}
          />
        ))}

        {/* Environment name */}
        <Text
          position={[0, 8, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {environment.environment_name}
        </Text>

        <Text
          position={[0, 6.5, 0]}
          fontSize={0.4}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
        >
          Complexity: {environment.complexity_level}/10
        </Text>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}