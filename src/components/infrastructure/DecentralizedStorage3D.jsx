import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function StorageNode({ storage, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      if (storage.pinned) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getStorageColor = () => {
    switch (storage.storage_type) {
      case 'ipfs': return '#00f5ff';
      case 'arweave': return '#a855f7';
      case 'filecoin': return '#3b82f6';
      default: return '#44ff44';
    }
  };

  const size = Math.log10(storage.file_size_bytes + 1) * 0.1;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={getStorageColor()}
          emissive={getStorageColor()}
          emissiveIntensity={storage.pinned ? 0.6 : 0.3}
          wireframe={!storage.pinned}
        />
      </mesh>
      {storage.encryption?.encrypted && (
        <Sphere args={[size + 0.15, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ffaa00"
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
}

function RedundancyIndicators({ storages }) {
  const avgRedundancy = storages?.reduce((sum, s) => sum + (s.redundancy_level || 0), 0) / (storages?.length || 1);
  
  return (
    <group position={[4, 0, 0]}>
      <Text fontSize={0.2} color="#00f5ff">
        Redundancy
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.4} color="#44ff44">
        {avgRedundancy.toFixed(1)}x
      </Text>
    </group>
  );
}

export default function DecentralizedStorage3D({ storages }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
          Decentralized Storage
        </Text>
        <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
          {storages?.length || 0} Files Stored
        </Text>

        {storages?.slice(0, 30).map((storage, i) => {
          const angle = (i / Math.min(storages.length, 30)) * Math.PI * 2;
          const radius = 2 + Math.random() * 2;
          const height = (Math.random() - 0.5) * 3;
          
          return (
            <StorageNode
              key={storage.id}
              storage={storage}
              position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
            />
          );
        })}

        <RedundancyIndicators storages={storages} />

        <group position={[-4, 0, 0]}>
          <Text fontSize={0.15} color="#ffffff">
            Total Size:
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.2} color="#00f5ff">
            {(storages?.reduce((sum, s) => sum + s.file_size_bytes, 0) / (1024 * 1024)).toFixed(1)} MB
          </Text>
        </group>

        <group position={[0, -3.5, 0]}>
          <Text fontSize={0.12} color="#a855f7">
            🔒 Encrypted: {storages?.filter(s => s.encryption?.encrypted).length}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffaa00">
            📌 Pinned: {storages?.filter(s => s.pinned).length}
          </Text>
        </group>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}