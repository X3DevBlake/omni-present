import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function ComplianceRing({ score }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  const getColor = () => {
    if (score > 90) return '#44ff44';
    if (score > 75) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[2, 0.15, 16, 100]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.6}
        />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.5} color={getColor()}>
        {score.toFixed(0)}%
      </Text>
    </group>
  );
}

function RequirementNode({ requirement, position }) {
  const getStatusColor = () => {
    switch (requirement.compliance_status) {
      case 'compliant': return '#44ff44';
      case 'partial': return '#ffaa00';
      case 'non_compliant': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <group position={position}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="white">
        {requirement.category}
      </Text>
    </group>
  );
}

export default function CompliancePolicy3D({ policy }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#44ff44" />
        
        {policy && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {policy.policy_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {policy.regulatory_framework.toUpperCase()}
            </Text>

            <ComplianceRing score={policy.compliance_score || 0} />

            {policy.requirements?.slice(0, 12).map((req, i) => {
              const angle = (i / Math.min(policy.requirements.length, 12)) * Math.PI * 2;
              return (
                <RequirementNode
                  key={i}
                  requirement={req}
                  position={[Math.cos(angle) * 3.5, Math.sin(angle) * 2.5, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {policy.requirements?.filter(r => r.compliance_status === 'compliant').length} / {policy.requirements?.length} Compliant
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ff8800">
                {policy.violations?.length || 0} Violations
              </Text>
              {policy.automated_checks && (
                <Text position={[0, -0.8, 0]} fontSize={0.12} color="#a855f7">
                  🤖 Automated Checks Enabled
                </Text>
              )}
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}