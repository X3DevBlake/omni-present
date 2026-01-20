import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function RoleNode({ role, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const size = 0.2 + role.members_count / 50;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.1} color="white">
        {role.role_name}
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.08} color="#44ff44">
        {role.members_count} users
      </Text>
    </group>
  );
}

function AccessGate({ mfaRequired }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.5, 0.2, 16, 100]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial
        color={mfaRequired ? '#44ff44' : '#ffaa00'}
        emissive={mfaRequired ? '#44ff44' : '#ffaa00'}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

export default function AccessControl3D({ accessControl }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {accessControl && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {accessControl.access_policy_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {accessControl.policy_type.toUpperCase()} Model
            </Text>

            <AccessGate mfaRequired={accessControl.mfa_required} />

            {accessControl.roles?.map((role, i) => {
              const angle = (i / accessControl.roles.length) * Math.PI * 2;
              return (
                <RoleNode
                  key={i}
                  role={role}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {accessControl.roles?.length || 0} Roles | {accessControl.access_rules?.length || 0} Rules
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color={accessControl.mfa_required ? '#44ff44' : '#ffaa00'}>
                {accessControl.mfa_required ? '🔒 MFA Required' : 'MFA Optional'}
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.12} color="#ff8800">
                {accessControl.anomalous_access_detected} Anomalies Detected
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}