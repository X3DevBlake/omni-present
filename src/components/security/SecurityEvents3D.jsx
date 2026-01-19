import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ThreatNode({ event, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation based on severity
      const pulseSpeed = event.severity === 'critical' ? 3 : event.severity === 'high' ? 2 : 1;
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed + index) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // Rotate
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  // Color and size based on severity
  const severityConfig = {
    low: { color: '#3b82f6', size: 0.3, glow: 0.2 },
    medium: { color: '#fbbf24', size: 0.4, glow: 0.4 },
    high: { color: '#f97316', size: 0.5, glow: 0.6 },
    critical: { color: '#ef4444', size: 0.7, glow: 0.8 }
  };
  
  const config = severityConfig[event.severity] || severityConfig.medium;
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[config.size, 32, 32]}
      >
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={config.glow}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      {/* Event type label */}
      <Text
        position={[0, config.size + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {event.event_type.replace(/_/g, ' ').toUpperCase()}
      </Text>
      
      {/* Threat score */}
      <Text
        position={[0, -config.size - 0.3, 0]}
        fontSize={0.15}
        color={config.color}
        anchorX="center"
      >
        Threat: {event.ai_threat_score?.toFixed(0) || 0}%
      </Text>
      
      {/* Status indicator */}
      {event.status === 'mitigated' && (
        <Sphere args={[0.1, 16, 16]} position={[config.size, 0, 0]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </Sphere>
      )}
      
      {/* Attack vectors */}
      {event.event_details?.threat_indicators && (
        <>
          {[...Array(Math.min(event.event_details.threat_indicators.length, 5))].map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const radius = config.size + 0.5;
            return (
              <Line
                key={i}
                points={[
                  [0, 0, 0],
                  [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
                ]}
                color={config.color}
                lineWidth={2}
                transparent
                opacity={0.5}
              />
            );
          })}
        </>
      )}
    </group>
  );
}

export default function SecurityEvents3D({ events }) {
  const positions = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.map((_, idx) => {
      const angle = (idx / events.length) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 4;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [events]);
  
  if (!events || events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No security events detected</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ef4444" />
      
      {/* Central security core */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          wireframe
        />
      </Sphere>
      
      {/* Security events */}
      {events.map((event, idx) => (
        <ThreatNode
          key={event.id || idx}
          event={event}
          position={positions[idx]}
          index={idx}
        />
      ))}
      
      {/* Info display */}
      <Text
        position={[0, 6, -5]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        Security Landscape
      </Text>
      
      <Text
        position={[0, 5.3, -5]}
        fontSize={0.2}
        color="#ef4444"
        anchorX="center"
      >
        {events.filter(e => e.severity === 'critical').length} Critical Threats
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}