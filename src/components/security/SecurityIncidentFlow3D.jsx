import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function IncidentNode({ incident, position, index }) {
  const nodeRef = useRef();

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.02;
      const offset = Math.sin(state.clock.elapsedTime * 2 + index) * 0.15;
      nodeRef.current.position.y = position[1] + offset;
    }
  });

  const severityColors = {
    'critical': '#dc2626',
    'high': '#ea580c',
    'medium': '#f59e0b',
    'low': '#3b82f6'
  };

  const color = severityColors[incident.severity] || '#6366f1';
  const isResolved = incident.resolution?.resolved;

  return (
    <group position={position}>
      <RoundedBox ref={nodeRef} args={[0.6, 0.6, 0.6]} radius={0.08}>
        <meshStandardMaterial
          color={isResolved ? '#10b981' : color}
          emissive={isResolved ? '#10b981' : color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
      >
        {incident.incident_type?.substring(0, 12)}
      </Text>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.08}
        color={isResolved ? '#10b981' : color}
        anchorX="center"
      >
        {isResolved ? 'Resolved' : 'Active'}
      </Text>
    </group>
  );
}

function ResponseLine({ from, to }) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...from, ...to])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.3} />
    </line>
  );
}

export default function SecurityIncidentFlow3D({ incidents }) {
  const positions = React.useMemo(() => {
    return incidents.slice(0, 15).map((_, idx) => {
      const angle = (idx / 15) * Math.PI * 2;
      const radius = 3 + (idx % 3) * 0.5;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle * 2),
        Math.sin(angle) * radius
      ];
    });
  }, [incidents]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#dc2626" />

      {/* Security Operations Center */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
        Security Incident Response
      </Text>

      {/* Incident Nodes */}
      {incidents.slice(0, 15).map((incident, idx) => (
        <IncidentNode
          key={incident.id}
          incident={incident}
          position={positions[idx]}
          index={idx}
        />
      ))}

      {/* Response Lines */}
      {incidents.slice(0, 15).map((_, idx) => (
        <ResponseLine
          key={`line-${idx}`}
          from={positions[idx]}
          to={[0, 0, 0]}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
      />
    </Canvas>
  );
}