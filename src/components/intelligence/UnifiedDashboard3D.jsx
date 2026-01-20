import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function HubNode({ position, hub, activity, alerts, onClick }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      
      if (alerts > 0) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
        if (glowRef.current) {
          glowRef.current.scale.setScalar(1 + pulse * 0.2);
        }
      }
    }
  });

  const hubColors = {
    security: '#ef4444',
    defi: '#10b981',
    simulation: '#3b82f6',
    marketplace: '#f59e0b',
    governance: '#8b5cf6',
    collaboration: '#ec4899'
  };

  const color = hubColors[hub.type] || '#6b7280';
  const scale = 1 + (activity / 100) * 0.5;

  return (
    <group position={position} onClick={onClick}>
      {alerts > 0 && (
        <Sphere ref={glowRef} args={[scale * 1.3, 32, 32]}>
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </Sphere>
      )}
      <Sphere ref={meshRef} args={[scale, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, scale + 0.8, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {hub.name}
      </Text>
      {alerts > 0 && (
        <Text
          position={[0, scale + 1.3, 0]}
          fontSize={0.3}
          color="#ff6b6b"
          anchorX="center"
        >
          {alerts} alerts
        </Text>
      )}
      <Text
        position={[0, scale + 1.7, 0]}
        fontSize={0.25}
        color="#a0a0a0"
        anchorX="center"
      >
        {activity.toFixed(0)}% active
      </Text>
    </group>
  );
}

function DataFlowLine({ start, end, strength, active }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && active) {
      const material = lineRef.current.material;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={active ? '#60a5fa' : '#4b5563'}
      lineWidth={strength * 3}
      transparent
      opacity={active ? 0.5 : 0.2}
    />
  );
}

export default function UnifiedDashboard3D({ hubs, dataFlows, insights, onHubClick }) {
  const hubPositions = useMemo(() => {
    const positions = [];
    hubs?.forEach((hub, i) => {
      const angle = (i / (hubs.length || 1)) * Math.PI * 2;
      const radius = 8;
      positions.push({
        hub,
        position: [Math.cos(angle) * radius, Math.sin(angle * 0.5) * 2, Math.sin(angle) * radius]
      });
    });
    return positions;
  }, [hubs]);

  const connections = useMemo(() => {
    const lines = [];
    dataFlows?.forEach(flow => {
      const sourceHub = hubPositions.find(h => h.hub.type === flow.source_hub);
      const targetHub = hubPositions.find(h => h.hub.type === flow.target_hub);
      if (sourceHub && targetHub) {
        lines.push({
          start: sourceHub.position,
          end: targetHub.position,
          strength: flow.flow_metrics?.success_rate / 100 || 0.5,
          active: flow.is_active
        });
      }
    });
    return lines;
  }, [hubPositions, dataFlows]);

  return (
    <Canvas camera={{ position: [0, 8, 25], fov: 60 }} style={{ height: '800px' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#6366f1" />

      {/* Central intelligence core */}
      <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text position={[0, 3, 0]} fontSize={0.7} color="white">
        Cross-Hub Intelligence
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#a78bfa">
        {insights?.length || 0} Active Insights
      </Text>

      {/* Hub nodes */}
      {hubPositions.map(({ hub, position }, i) => (
        <HubNode
          key={hub.id || i}
          position={position}
          hub={hub}
          activity={hub.activity || Math.random() * 100}
          alerts={hub.alerts || 0}
          onClick={() => onHubClick?.(hub)}
        />
      ))}

      {/* Data flow connections */}
      {connections.map((conn, i) => (
        <DataFlowLine
          key={i}
          start={conn.start}
          end={conn.end}
          strength={conn.strength}
          active={conn.active}
        />
      ))}

      {/* Connection lines from hubs to center */}
      {hubPositions.map(({ position }, i) => (
        <Line
          key={`center-${i}`}
          points={[position, [0, 0, 0]]}
          color="#8b5cf6"
          lineWidth={1}
          transparent
          opacity={0.15}
        />
      ))}

      <OrbitControls 
        enableZoom={true} 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={15}
        maxDistance={50}
      />
    </Canvas>
  );
}