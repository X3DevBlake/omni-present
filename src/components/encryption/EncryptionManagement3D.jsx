import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function EncryptionCore({ standard }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={0.7}
        wireframe
      />
    </mesh>
  );
}

function EncryptedAsset({ asset, position }) {
  const getColor = () => {
    switch (asset.encryption_status) {
      case 'encrypted': return '#44ff44';
      case 'rotating': return '#ffaa00';
      default: return '#ff4444';
    }
  };

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {asset.asset_type}
      </Text>
    </group>
  );
}

export default function EncryptionManagement3D({ encryptionPolicy }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {encryptionPolicy && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {encryptionPolicy.encryption_policy_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {encryptionPolicy.encryption_standard?.replace('_', '-').toUpperCase()}
            </Text>

            <EncryptionCore standard={encryptionPolicy.encryption_standard} />

            {encryptionPolicy.encrypted_assets?.slice(0, 8).map((asset, i) => {
              const angle = (i / Math.min(encryptionPolicy.encrypted_assets.length, 8)) * Math.PI * 2;
              return (
                <EncryptedAsset
                  key={i}
                  asset={asset}
                  position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {encryptionPolicy.encrypted_assets?.length || 0} Assets Encrypted
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#00f5ff">
                {encryptionPolicy.key_management?.keys_active || 0} Active Keys
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.12} color="#ffffff">
                Rotation: {encryptionPolicy.key_management?.key_rotation_days || 0} days
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}