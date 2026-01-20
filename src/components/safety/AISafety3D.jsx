import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

function SafetyDimension({ position, label, score, color }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, score * 0.05, 1]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Box>
      <Text position={[0, -0.8, 0]} fontSize={0.25} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color={color} anchorX="center">
        {score}%
      </Text>
    </group>
  );
}

function VulnerabilityMarker({ position, severity }) {
  const colors = {
    low: '#10b981',
    medium: '#fbbf24',
    high: '#f59e0b',
    critical: '#ef4444'
  };

  return (
    <Sphere args={[0.3, 16, 16]} position={position}>
      <meshStandardMaterial 
        color={colors[severity] || '#6b7280'}
        emissive={colors[severity] || '#6b7280'}
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
}

export default function AISafety3D({ safetyCheck, onDimensionClick }) {
  const dimensions = safetyCheck?.safety_dimensions || {};
  const vulnerabilities = safetyCheck?.red_team_results || [];

  const safetyDims = [
    { label: 'Robustness', score: dimensions.robustness || 82, color: '#3b82f6', position: [-6, 0, 0] },
    { label: 'Fairness', score: dimensions.fairness || 88, color: '#10b981', position: [-3, 0, 0] },
    { label: 'Transparency', score: dimensions.transparency || 75, color: '#fbbf24', position: [0, 0, 0] },
    { label: 'Privacy', score: dimensions.privacy || 95, color: '#8b5cf6', position: [3, 0, 0] },
    { label: 'Alignment', score: dimensions.alignment || 90, color: '#ec4899', position: [6, 0, 0] }
  ];

  return (
    <Canvas camera={{ position: [0, 6, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      {/* Central safety core */}
      <Torus args={[2, 0.5, 32, 64]} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981" 
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </Torus>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        AI Safety Audit
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {safetyCheck?.check_name || 'Safety Check'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.35} color={safetyCheck?.certification_ready ? '#10b981' : '#fbbf24'} anchorX="center">
        Overall: {safetyCheck?.overall_safety_score || 84}%
      </Text>

      {/* Safety dimensions */}
      {safetyDims.map((dim, i) => (
        <SafetyDimension key={i} {...dim} />
      ))}

      {/* Vulnerability markers */}
      {vulnerabilities.slice(0, 5).map((vuln, i) => (
        <VulnerabilityMarker
          key={i}
          position={[
            Math.cos(i * 0.8) * 4,
            2 + i * 0.5,
            Math.sin(i * 0.8) * 4
          ]}
          severity={vuln.severity}
        />
      ))}

      {/* Status */}
      <group position={[0, -3, 0]}>
        {safetyCheck?.certification_ready ? (
          <Text fontSize={0.4} color="#10b981" anchorX="center">
            ✓ Ready for Certification
          </Text>
        ) : (
          <Text fontSize={0.4} color="#fbbf24" anchorX="center">
            ⚠️ Improvements Needed
          </Text>
        )}
        <Text position={[0, -0.7, 0]} fontSize={0.25} color="white" anchorX="center">
          {vulnerabilities.length} vulnerabilities detected
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}