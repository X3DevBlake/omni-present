import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function BlockNode({ audit, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      
      if (audit.status === 'pending') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getStatusColor = () => {
    switch (audit.status) {
      case 'confirmed': return '#44ff44';
      case 'pending': return '#ffaa00';
      case 'failed': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.08} color="white">
        Block {audit.block_number}
      </Text>
      {audit.verification?.verified && (
        <Text position={[0, 0.6, 0]} fontSize={0.1} color="#44ff44">
          ✓
        </Text>
      )}
    </group>
  );
}

function BlockchainChain({ audits }) {
  const sortedAudits = [...(audits || [])].sort((a, b) => a.block_number - b.block_number);
  
  return (
    <>
      {sortedAudits.slice(0, 10).map((audit, i) => {
        if (i === 0) return null;
        
        const points = [
          new THREE.Vector3(i * 1.2 - 6, 0, 0),
          new THREE.Vector3((i - 1) * 1.2 - 6, 0, 0)
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color="#00f5ff"
            lineWidth={3}
          />
        );
      })}
    </>
  );
}

export default function BlockchainAudit3D({ audits }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
          Blockchain Audit Trail
        </Text>
        <Text position={[0, 3.4, 0]} fontSize={0.2} color="#ffffff">
          {audits?.length || 0} Immutable Records
        </Text>

        <BlockchainChain audits={audits} />

        {audits?.slice(0, 10).map((audit, i) => (
          <BlockNode
            key={audit.id}
            audit={audit}
            position={[i * 1.2 - 6, 0, 0]}
          />
        ))}

        <group position={[0, -3, 0]}>
          <Text fontSize={0.15} color="#44ff44">
            Confirmed: {audits?.filter(a => a.status === 'confirmed').length}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffaa00">
            Pending: {audits?.filter(a => a.status === 'pending').length}
          </Text>
          <Text position={[0, -0.8, 0]} fontSize={0.15} color="#a855f7">
            Verified: {audits?.filter(a => a.verification?.verified).length}
          </Text>
        </group>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}