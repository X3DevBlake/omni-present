import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function ImpactBar({ position, height, color, label, value }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = [0.4, Math.abs(height) * 2, 0.4];
      meshRef.current.scale.lerp(new THREE.Vector3(...targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height, 0]}>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        rotation={[0, Math.PI / 4, 0]}
      >
        {label}
      </Text>
      <Text
        position={[0, height * 2 + 0.5, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {value > 0 ? '+' : ''}{value}%
      </Text>
    </group>
  );
}

function TimeSeriesPath({ data, color }) {
  const points = useMemo(() => {
    return data.map((point, i) => {
      return new THREE.Vector3(
        (i - data.length / 2) * 0.5,
        point.value * 0.05,
        0
      );
    });
  }, [data]);

  return <Line points={points} color={color} lineWidth={2} />;
}

export default function GovernanceImpact3D({ impactMetrics = [] }) {
  const latestMetric = impactMetrics[0];
  
  const impacts = latestMetric ? [
    { 
      label: 'Agent Perf', 
      value: latestMetric.impact_metrics?.agent_performance_change || 0,
      color: latestMetric.impact_metrics?.agent_performance_change >= 0 ? '#10b981' : '#ef4444'
    },
    { 
      label: 'Sim Efficiency', 
      value: latestMetric.impact_metrics?.simulation_efficiency_change || 0,
      color: latestMetric.impact_metrics?.simulation_efficiency_change >= 0 ? '#10b981' : '#ef4444'
    },
    { 
      label: 'DeFi Returns', 
      value: latestMetric.impact_metrics?.defi_returns_change || 0,
      color: latestMetric.impact_metrics?.defi_returns_change >= 0 ? '#10b981' : '#ef4444'
    },
    { 
      label: 'Security', 
      value: -(latestMetric.impact_metrics?.security_incidents_change || 0),
      color: latestMetric.impact_metrics?.security_incidents_change <= 0 ? '#10b981' : '#ef4444'
    },
    { 
      label: 'User Sat', 
      value: latestMetric.impact_metrics?.user_satisfaction_change || 0,
      color: latestMetric.impact_metrics?.user_satisfaction_change >= 0 ? '#10b981' : '#ef4444'
    },
    { 
      label: 'Treasury', 
      value: (latestMetric.impact_metrics?.treasury_balance_change || 0) / 100,
      color: latestMetric.impact_metrics?.treasury_balance_change >= 0 ? '#10b981' : '#ef4444'
    }
  ] : [];

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {/* Impact bars */}
        {impacts.map((impact, i) => (
          <ImpactBar
            key={i}
            position={[(i - impacts.length / 2) * 1.2, 0, 0]}
            height={impact.value * 0.05}
            color={impact.color}
            label={impact.label}
            value={impact.value.toFixed(1)}
          />
        ))}

        {/* Base grid */}
        <gridHelper args={[10, 10, '#444444', '#222222']} position={[0, -0.5, 0]} />

        <OrbitControls enableZoom={true} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm max-w-xs">
        <div className="text-white text-sm font-bold mb-2">
          {latestMetric?.decision_summary || 'Governance Impact'}
        </div>
        <div className="text-xs text-white/60 mb-3">
          {latestMetric?.decision_date ? new Date(latestMetric.decision_date).toLocaleDateString() : ''}
        </div>
        {latestMetric?.blockchain_verification?.verified_on_chain && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-400">Verified On-Chain</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-black/60 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-white text-xs">
          {latestMetric?.ai_impact_assessment || 'No assessment available'}
        </div>
      </div>
    </div>
  );
}