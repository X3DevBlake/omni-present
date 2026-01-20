import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function KPIIndicator({ kpi, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = kpi.current_value / kpi.target_value;
      meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
    }
  });

  const getColor = () => {
    switch (kpi.status) {
      case 'on_track': return '#44ff44';
      case 'at_risk': return '#ffaa00';
      case 'critical': return '#ff4444';
      default: return '#00f5ff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.08} color="white">
        {kpi.kpi_name}
      </Text>
      <Text position={[0, 1.3, 0]} fontSize={0.09} color={getColor()}>
        {kpi.current_value}/{kpi.target_value}
      </Text>
    </group>
  );
}

function AlertSphere({ alert, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && !alert.acknowledged) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
      meshRef.current.scale.setScalar(pulse * 0.15);
    }
  });

  const severityColor = {
    info: '#00f5ff',
    warning: '#ffaa00',
    error: '#ff8800',
    critical: '#ff4444'
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial
            color={severityColor[alert.severity]}
            emissive={severityColor[alert.severity]}
            emissiveIntensity={alert.acknowledged ? 0.3 : 0.8}
          />
        </Sphere>
      </mesh>
    </group>
  );
}

export default function IntelligenceDashboard3D({ dashboard }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {dashboard && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {dashboard.dashboard_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {dashboard.dashboard_type.toUpperCase()} Dashboard
            </Text>

            {dashboard.kpis?.slice(0, 5).map((kpi, i) => (
              <KPIIndicator
                key={i}
                kpi={kpi}
                position={[i * 1.5 - 3, 0, 0]}
              />
            ))}

            {dashboard.alerts?.slice(0, 6).map((alert, i) => {
              const angle = (i / Math.min(dashboard.alerts.length, 6)) * Math.PI * 2;
              return (
                <AlertSphere
                  key={i}
                  alert={alert}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, -1]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {dashboard.widgets?.length || 0} Widgets
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ff8800">
                {dashboard.alerts?.filter(a => !a.acknowledged).length || 0} Active Alerts
              </Text>
              {dashboard.auto_insights && (
                <Text position={[0, -0.8, 0]} fontSize={0.12} color="#a855f7">
                  🧠 AI Insights Enabled
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