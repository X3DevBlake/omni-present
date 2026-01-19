import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';

function TerrainMesh({ config }) {
  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    const size = config.terrain_config?.size || 50;
    const segments = 100;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Generate procedural heightmap
    const seed = config.terrain_config?.seed || 'default';
    const vertices = geo.attributes.position.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Simple noise function (Perlin-like)
      const height = 
        Math.sin(x * 0.1 + seed.length) * 2 +
        Math.cos(z * 0.1 + seed.length) * 2 +
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3;
      
      vertices[i + 2] = height;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [config]);
  
  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#2d5016"
        wireframe={false}
        flatShading
      />
    </mesh>
  );
}

function ResourceNode({ resource, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = 
        resource.position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
    }
  });
  
  const colors = {
    'food': '#fbbf24',
    'water': '#3b82f6',
    'materials': '#8b4513',
    'energy': '#ef4444'
  };
  
  const color = colors[resource.type] || '#ffffff';
  
  return (
    <group position={resource.position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {resource.type}
      </Text>
    </group>
  );
}

function WeatherSystem({ config }) {
  if (!config.weather_system?.enabled) return null;
  
  return (
    <>
      <Sky
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
      />
      
      {/* Clouds */}
      {[...Array(5)].map((_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 40,
            10 + Math.random() * 5,
            (Math.random() - 0.5) * 40
          ]}
          speed={0.2}
          opacity={0.5}
        />
      ))}
    </>
  );
}

export default function ProceduralWorld3D({ environmentConfig, resources = [] }) {
  if (!environmentConfig) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No environment configuration</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 20, 30], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, 10, -5]} intensity={0.5} color="#00f5ff" />
      
      {/* Weather and sky */}
      <WeatherSystem config={environmentConfig} />
      
      {/* Terrain */}
      <TerrainMesh config={environmentConfig} />
      
      {/* Resource nodes */}
      {resources.map((resource, idx) => (
        <ResourceNode
          key={idx}
          resource={resource}
          index={idx}
        />
      ))}
      
      {/* Environment info */}
      <Text
        position={[0, 15, -20]}
        fontSize={0.8}
        color="white"
        anchorX="center"
      >
        {environmentConfig.environment_name}
      </Text>
      
      <Text
        position={[0, 13.5, -20]}
        fontSize={0.3}
        color="#00f5ff"
        anchorX="center"
      >
        {environmentConfig.environment_type.toUpperCase()} • {resources.length} Resources
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={10}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}