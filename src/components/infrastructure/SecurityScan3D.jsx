import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function VulnerabilityMarker({ vuln, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.1;
    }
  });

  const getSeverityColor = () => {
    switch (vuln.severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#ffff00';
      default: return '#44ff44';
    }
  };

  const getSeveritySize = () => {
    switch (vuln.severity) {
      case 'critical': return 0.3;
      case 'high': return 0.25;
      case 'medium': return 0.2;
      default: return 0.15;
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[getSeveritySize(), 16, 16]} />
        <meshStandardMaterial
          color={getSeverityColor()}
          emissive={getSeverityColor()}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

function SecurityScoreGauge({ score }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -(score / 100) * Math.PI * 1.5 + Math.PI * 0.75;
    }
  });

  const getColor = () => {
    if (score >= 80) return '#44ff44';
    if (score >= 60) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.5, 0.1, 16, 100, Math.PI * 1.5]} rotation={[0, 0, Math.PI * 0.75]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 0.05, 0.05]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0, -2, 0]} fontSize={0.6} color={getColor()}>
        {score.toFixed(0)}
      </Text>
      <Text position={[0, -2.7, 0]} fontSize={0.2} color="white">
        Security Score
      </Text>
    </group>
  );
}

export default function SecurityScan3D({ scan }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />
        
        {scan && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {scan.scan_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {scan.scan_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={scan.scan_status === 'completed' ? '#44ff44' : '#ffaa00'}>
              Status: {scan.scan_status}
            </Text>

            <SecurityScoreGauge score={scan.security_score || 75} />

            {scan.vulnerabilities_found?.slice(0, 15).map((vuln, i) => {
              const angle = (i / Math.min(scan.vulnerabilities_found.length, 15)) * Math.PI * 2;
              const radius = 3;
              
              return (
                <VulnerabilityMarker
                  key={i}
                  vuln={vuln}
                  position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                />
              );
            })}

            <group position={[4, 1, 0]}>
              <Text fontSize={0.12} color="#ff4444">
                Critical: {scan.vulnerabilities_found?.filter(v => v.severity === 'critical').length}
              </Text>
              <Text position={[0, -0.3, 0]} fontSize={0.12} color="#ff8800">
                High: {scan.vulnerabilities_found?.filter(v => v.severity === 'high').length}
              </Text>
              <Text position={[0, -0.6, 0]} fontSize={0.12} color="#ffaa00">
                Medium: {scan.vulnerabilities_found?.filter(v => v.severity === 'medium').length}
              </Text>
            </group>

            <group position={[-4, 0, 0]}>
              <Text fontSize={0.12} color="#44ff44">
                ✓ GDPR: {scan.compliance_checks?.gdpr_compliant ? 'Yes' : 'No'}
              </Text>
              <Text position={[0, -0.3, 0]} fontSize={0.12} color="#00f5ff">
                ✓ SOC2: {scan.compliance_checks?.soc2_compliant ? 'Yes' : 'No'}
              </Text>
            </group>

            {scan.auto_remediation?.enabled && (
              <group position={[0, -4, 0]}>
                <Text fontSize={0.15} color="#a855f7">
                  🔧 Auto-Fixes Applied: {scan.auto_remediation.fixes_applied}
                </Text>
              </group>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}