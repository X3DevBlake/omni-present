import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function DataClassificationNode({ data, position }) {
  const getColor = () => {
    switch (data.classification) {
      case 'pii': return '#ff4444';
      case 'confidential': return '#ff8800';
      case 'internal': return '#ffaa00';
      default: return '#00f5ff';
    }
  };

  return (
    <group position={position}>
      <Sphere args={[0.2, 16, 16]}>
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={data.encryption_required ? 0.8 : 0.3}
        />
      </Sphere>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="white">
        {data.data_type}
      </Text>
      {data.encryption_required && (
        <Text position={[0, 0.4, 0]} fontSize={0.06} color="#44ff44">
          🔒
        </Text>
      )}
    </group>
  );
}

function PrivacyShield({ score }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={score / 100}
        wireframe
      />
    </mesh>
  );
}

export default function PrivacyManagement3D({ privacyPolicy }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {privacyPolicy && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#a855f7">
              {privacyPolicy.privacy_policy_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.25} color="#44ff44">
              Privacy Score: {privacyPolicy.privacy_score?.toFixed(0)}%
            </Text>

            <PrivacyShield score={privacyPolicy.privacy_score} />

            {privacyPolicy.data_classification?.map((data, i) => {
              const angle = (i / privacyPolicy.data_classification.length) * Math.PI * 2;
              return (
                <DataClassificationNode
                  key={i}
                  data={data}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.12} color="#00f5ff">
                {privacyPolicy.anonymization?.enabled ? '✓ Anonymization Active' : 'Anonymization Disabled'}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                Techniques: {privacyPolicy.anonymization?.techniques?.join(', ')}
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.12} color="#ff8800">
                {privacyPolicy.privacy_incidents?.length || 0} Incidents
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}