import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ThreatCore({ threat }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && threat.threat_status !== 'resolved') {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.015;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getSeverityColor = () => {
    switch (threat.severity_level) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      default: return '#ffaa00';
    }
  };

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial
        color={getSeverityColor()}
        emissive={getSeverityColor()}
        emissiveIntensity={0.8}
        wireframe={threat.threat_status === 'resolved'}
      />
    </mesh>
  );
}

function IOCMarker({ ioc, position }) {
  return (
    <group position={position}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={ioc.confidence}
        />
      </Sphere>
      <Text position={[0, -0.4, 0]} fontSize={0.08} color="white">
        {ioc.ioc_type}
      </Text>
    </group>
  );
}

function MitigationStep({ step, position, index }) {
  const getColor = () => {
    switch (step.status) {
      case 'completed': return '#44ff44';
      case 'in_progress': return '#ffaa00';
      default: return '#888888';
    }
  };

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.2, 0.2]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="white">
        Step {index + 1}
      </Text>
    </group>
  );
}

export default function ThreatIntelligence3D({ threat }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />
        
        {threat && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#ff4444">
              {threat.threat_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {threat.threat_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.25} color="#ff8800">
              Risk Score: {threat.risk_score?.toFixed(0)}
            </Text>

            <ThreatCore threat={threat} />

            {threat.indicators_of_compromise?.slice(0, 6).map((ioc, i) => {
              const angle = (i / Math.min(threat.indicators_of_compromise.length, 6)) * Math.PI * 2;
              return (
                <IOCMarker
                  key={i}
                  ioc={ioc}
                  position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            {threat.mitigation_steps?.slice(0, 5).map((step, i) => (
              <MitigationStep
                key={i}
                step={step}
                position={[i * 1.2 - 2.4, -2, 0]}
                index={i}
              />
            ))}

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.15} color={
                threat.threat_status === 'resolved' ? '#44ff44' : '#ff8800'
              }>
                Status: {threat.threat_status.toUpperCase()}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                {threat.affected_assets?.length || 0} Assets Affected
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}