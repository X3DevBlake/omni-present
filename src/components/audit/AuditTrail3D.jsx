import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AuditEntry({ entry, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  const getActorColor = () => {
    switch (entry.actor_type) {
      case 'user': return '#00f5ff';
      case 'agent': return '#a855f7';
      case 'system': return '#44ff44';
      default: return '#ffffff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <Sphere args={[0.12, 16, 16]}>
          <meshStandardMaterial
            color={getActorColor()}
            emissive={getActorColor()}
            emissiveIntensity={0.6}
          />
        </Sphere>
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.06} color="white">
        {entry.action}
      </Text>
    </group>
  );
}

function AuditTimeline({ entries }) {
  const points = entries?.slice(0, 20).map((_, i) => 
    new THREE.Vector3(i * 0.4 - 4, 0, 0)
  ) || [];

  return points.length > 1 ? (
    <Line points={points} color="#00f5ff" lineWidth={2} opacity={0.5} transparent />
  ) : null;
}

export default function AuditTrail3D({ trail }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {trail && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {trail.trail_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {trail.scope?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={
              trail.tamper_detection?.tampering_detected ? '#ff4444' : '#44ff44'
            }>
              {trail.tamper_detection?.tampering_detected ? '⚠ Tampering Detected' : '✓ Integrity Verified'}
            </Text>

            <AuditTimeline entries={trail.audit_entries} />

            {trail.audit_entries?.slice(0, 20).map((entry, i) => (
              <AuditEntry
                key={i}
                entry={entry}
                position={[i * 0.4 - 4, 0, 0]}
                index={i}
              />
            ))}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {trail.audit_entries?.length || 0} Audit Entries
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#a855f7">
                Retention: {trail.retention_policy?.retention_days || 0} days
              </Text>
              {trail.retention_policy?.immutable && (
                <Text position={[0, -0.8, 0]} fontSize={0.12} color="#00f5ff">
                  🔒 Immutable Trail
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