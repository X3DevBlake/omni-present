import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function PolicyOrb({ policy, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + policy.compliance_rate * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getCategoryColor = () => {
    switch (policy.category) {
      case 'data': return '#00f5ff';
      case 'ethical': return '#a855f7';
      case 'operational': return '#44ff44';
      case 'financial': return '#ffaa00';
      default: return '#ffffff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial
            color={getCategoryColor()}
            emissive={getCategoryColor()}
            emissiveIntensity={policy.compliance_rate}
          />
        </Sphere>
      </mesh>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="white">
        {policy.category}
      </Text>
    </group>
  );
}

function GovernanceHub({ model }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

export default function GovernanceFramework3D({ framework }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {framework && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#a855f7">
              {framework.framework_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {framework.governance_model.toUpperCase()} Governance
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#44ff44">
              Transparency: {(framework.transparency_score * 100).toFixed(0)}%
            </Text>

            <GovernanceHub model={framework.governance_model} />

            {framework.policies?.slice(0, 8).map((policy, i) => {
              const angle = (i / Math.min(framework.policies.length, 8)) * Math.PI * 2;
              return (
                <PolicyOrb
                  key={i}
                  policy={policy}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#00f5ff">
                {framework.policies?.length || 0} Policies
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffaa00">
                {framework.proposals?.filter(p => p.status === 'voting').length || 0} Active Proposals
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.12} color="#ffffff">
                {framework.risk_assessments?.length || 0} Risk Assessments
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}