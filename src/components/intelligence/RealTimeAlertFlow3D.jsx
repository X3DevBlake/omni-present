import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function AlertNode({ alert, position, index }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + index) * 0.1;
      nodeRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      nodeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
    }
  });

  const severityColors = {
    'critical': '#dc2626',
    'high': '#ea580c',
    'medium': '#f59e0b',
    'low': '#3b82f6',
    'info': '#6b7280'
  };

  const color = severityColors[alert.severity] || '#6366f1';

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.3, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold text-xs">{alert.alert_type}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${
                alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {alert.severity}
              </span>
            </div>
            {alert.ai_analysis && (
              <>
                <p className="text-slate-400 text-xs mb-1">
                  Confidence: {Math.round(alert.ai_analysis.confidence_score * 100)}%
                </p>
                <p className="text-slate-300 text-xs line-clamp-2">
                  {alert.ai_analysis.root_cause}
                </p>
              </>
            )}
          </div>
        </Html>
      )}

      {/* Severity Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.03, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function AlertStream({ alerts }) {
  const streamRef = useRef();

  useFrame((state) => {
    if (streamRef.current) {
      streamRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={streamRef}>
      {alerts.slice(0, 15).map((alert, idx) => {
        const angle = (idx / 15) * Math.PI * 2;
        const radius = 3 + (idx % 3);
        const height = (idx % 5) - 2;
        return (
          <AlertNode
            key={alert.id}
            alert={alert}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
            index={idx}
          />
        );
      })}
    </group>
  );
}

export default function RealTimeAlertFlow3D({ alerts }) {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />

      {/* Central Monitoring Core */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center">
        Alert Monitoring
      </Text>

      <Text position={[0, 1.5, 0]} fontSize={0.15} color="#ef4444" anchorX="center">
        {alerts.length} Active Alerts
      </Text>

      <AlertStream alerts={alerts} />

      <OrbitControls
        enableZoom={true}
        minDistance={6}
        maxDistance={18}
      />
    </Canvas>
  );
}