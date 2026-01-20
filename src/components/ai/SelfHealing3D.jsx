import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function HealthCore({ status }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      
      if (status === 'recovering') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getColor = () => {
    switch (status) {
      case 'healthy': return '#44ff44';
      case 'degraded': return '#ffaa00';
      case 'recovering': return '#00f5ff';
      case 'critical': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

function AnomalyMarkers({ anomalies }) {
  return (
    <group position={[3, 0, 0]}>
      {anomalies?.slice(0, 5).map((anomaly, i) => {
        const severityColors = {
          low: '#44ff44',
          medium: '#ffaa00',
          high: '#ff8800',
          critical: '#ff4444'
        };
        
        return (
          <group key={i} position={[0, 2 - i * 0.8, 0]}>
            <Sphere args={[0.15, 16, 16]}>
              <meshStandardMaterial
                color={severityColors[anomaly.severity]}
                emissive={severityColors[anomaly.severity]}
                emissiveIntensity={0.8}
              />
            </Sphere>
            <Text position={[0.5, 0, 0]} fontSize={0.12} color="white">
              {anomaly.anomaly_type}
            </Text>
            <Text position={[0.5, -0.2, 0]} fontSize={0.09} color={severityColors[anomaly.severity]}>
              {anomaly.severity}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function RecoveryStrategies({ strategies }) {
  return (
    <group position={[-3.5, 1.5, 0]}>
      {strategies?.slice(0, 4).map((strategy, i) => (
        <group key={i} position={[0, -i * 0.6, 0]}>
          <mesh>
            <boxGeometry args={[strategy.success_rate * 2, 0.3, 0.3]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.4} />
          </mesh>
          <Text position={[-1.5, 0, 0]} fontSize={0.1} color="white">
            {strategy.strategy_name}
          </Text>
        </group>
      ))}
    </group>
  );
}

function MetricsDisplay({ metrics }) {
  if (!metrics) return null;

  return (
    <group position={[0, -2.5, 0]}>
      <Text fontSize={0.15} color="#44ff44">
        Success Rate: {(metrics.success_rate * 100).toFixed(1)}%
      </Text>
      <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffaa00">
        Response Time: {metrics.response_time_ms?.toFixed(0)}ms
      </Text>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="#00f5ff">
        Error Rate: {(metrics.error_rate * 100).toFixed(2)}%
      </Text>
    </group>
  );
}

export default function SelfHealing3D({ agent }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#44ff44" />
        
        {agent && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              Self-Healing Agent
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.25} color="#ffffff">
              {agent.agent_id}
            </Text>
            <Text position={[0, 3.2, 0]} fontSize={0.2} color={
              agent.health_status === 'healthy' ? '#44ff44' : '#ffaa00'
            }>
              Status: {agent.health_status.toUpperCase()}
            </Text>

            <HealthCore status={agent.health_status} />
            <AnomalyMarkers anomalies={agent.detected_anomalies} />
            <RecoveryStrategies strategies={agent.recovery_strategies} />
            <MetricsDisplay metrics={agent.monitoring_metrics} />

            <group position={[0, -4, 0]}>
              <Text fontSize={0.12} color="#ffffff">
                MTTR: {agent.mttr_seconds?.toFixed(0)}s | MTBF: {agent.mtbf_hours?.toFixed(1)}h
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}