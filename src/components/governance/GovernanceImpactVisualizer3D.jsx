import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box } from '@react-three/drei';

function MetricBar({ position, label, value, maxValue, color }) {
  const height = (value / maxValue) * 5;
  const yOffset = height / 2;

  return (
    <group position={position}>
      <Box args={[0.8, height, 0.8]} position={[0, yOffset, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Box>
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {label}
      </Text>
      <Text
        position={[0, height + 0.9, 0]}
        fontSize={0.25}
        color={value >= 0 ? '#10b981' : '#ef4444'}
        anchorX="center"
      >
        {value >= 0 ? '+' : ''}{value.toFixed(1)}%
      </Text>
    </group>
  );
}

function ProposalNode({ position, proposal, impact, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const totalImpact = Object.values(impact || {}).reduce((sum, val) => sum + Math.abs(val), 0);
  const scale = 0.5 + Math.min(totalImpact / 100, 1);
  const color = totalImpact > 50 ? '#10b981' : totalImpact > 20 ? '#f59e0b' : '#6b7280';

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[scale, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </Sphere>
      <Text
        position={[0, scale + 0.7, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {proposal.title?.slice(0, 20)}
      </Text>
    </group>
  );
}

export default function GovernanceImpactVisualizer3D({ impactMetrics, proposals }) {
  const latestMetric = impactMetrics?.[0];
  
  const metrics = [
    { label: 'Agent Perf', value: latestMetric?.impact_metrics?.agent_performance_change || 0, color: '#3b82f6' },
    { label: 'Sim Efficiency', value: latestMetric?.impact_metrics?.simulation_efficiency_change || 0, color: '#10b981' },
    { label: 'DeFi Returns', value: latestMetric?.impact_metrics?.defi_returns_change || 0, color: '#f59e0b' },
    { label: 'Security', value: latestMetric?.impact_metrics?.security_incidents_change || 0, color: '#ef4444' },
    { label: 'User Sat', value: latestMetric?.impact_metrics?.user_satisfaction_change || 0, color: '#8b5cf6' },
    { label: 'Treasury', value: latestMetric?.impact_metrics?.treasury_balance_change || 0, color: '#ec4899' }
  ];

  const maxValue = Math.max(...metrics.map(m => Math.abs(m.value)), 50);

  return (
    <Canvas camera={{ position: [0, 8, 20], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, 10, -10]} intensity={0.6} />

      <Text position={[0, 8, 0]} fontSize={0.6} color="white">
        Governance Impact Analysis
      </Text>

      {/* Metric bars */}
      {metrics.map((metric, i) => (
        <MetricBar
          key={i}
          position={[(i - 2.5) * 2.5, 0, 0]}
          label={metric.label}
          value={metric.value}
          maxValue={maxValue}
          color={metric.color}
        />
      ))}

      {/* Timeline of proposals */}
      {impactMetrics?.slice(0, 5).map((metric, i) => (
        <ProposalNode
          key={metric.id}
          position={[(i - 2) * 4, 6, -5]}
          proposal={{ title: metric.decision_summary }}
          impact={metric.impact_metrics}
        />
      ))}

      {/* Timeline line */}
      <Line
        points={[[-10, 5.5, -5], [10, 5.5, -5]]}
        color="#6366f1"
        lineWidth={2}
      />

      {/* Blockchain verification indicator */}
      {latestMetric?.blockchain_verification?.verified_on_chain && (
        <group position={[0, -3, 0]}>
          <Sphere args={[0.5, 32, 32]}>
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </Sphere>
          <Text position={[0, 0.8, 0]} fontSize={0.25} color="#10b981">
            ✓ On-Chain Verified
          </Text>
          <Text position={[0, 1.2, 0]} fontSize={0.2} color="#6b7280">
            Block #{latestMetric.blockchain_verification.block_number}
          </Text>
        </group>
      )}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}