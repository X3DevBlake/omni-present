import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function OptimizationLandscape({ solutions }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.005;
    }
  });
  
  const geometry = React.useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 50, 50);
    const positions = geo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2;
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial
        color="#6366f1"
        emissive="#6366f1"
        emissiveIntensity={0.2}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function QuantumOptimization3D({ config }) {
  if (!config) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No optimization running</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Optimization landscape */}
      <OptimizationLandscape />
      
      {/* Current best solution marker */}
      <Sphere args={[0.3, 32, 32]} position={[0, 3, 0]}>
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.8}
        />
      </Sphere>
      
      {/* Quantum particles */}
      {[...Array(20)].map((_, idx) => {
        const angle = (idx / 20) * Math.PI * 2;
        const radius = 4 + Math.sin(idx) * 2;
        
        return (
          <Sphere
            key={idx}
            args={[0.08, 16, 16]}
            position={[
              Math.cos(angle) * radius,
              Math.sin(idx * 2) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00f5ff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </Sphere>
        );
      })}
      
      <Text
        position={[0, 6, -6]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Quantum Optimization
      </Text>
      
      <Text
        position={[0, 5.3, -6]}
        fontSize={0.2}
        color="#ffd700"
        anchorX="center"
      >
        Score: {config.optimization_score?.toFixed(2)} • {config.iterations_completed} iterations
      </Text>
      
      <Text
        position={[0, 4.9, -6]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="center"
      >
        {config.quantum_algorithm} • {(config.quantum_advantage_factor * 100).toFixed(0)}% speedup
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
      />
    </Canvas>
  );
}