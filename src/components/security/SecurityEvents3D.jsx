import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function ThreatNode({ event, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 3 + index) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const severityColors = {
    critical: '#ff0000',
    high: '#ff4400',
    medium: '#ffaa00',
    low: '#00ff88'
  };

  const size = (event.ai_threat_score || 50) / 40;
  const color = severityColors[event.severity] || '#ffaa00';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>
      <Text
        position={[0, size + 1.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {event.event_type?.replace('_', ' ')}
      </Text>
      <Text
        position={[0, -size - 1.5, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {event.severity?.toUpperCase()}
      </Text>
    </group>
  );
}

export default function SecurityEvents3D({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-white/60">
        No security events detected
      </div>
    );
  }

  const radius = 8;
  const angleStep = (Math.PI * 2) / events.length;

  return (
    <div className="h-96 w-full">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff4400" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Central security hub */}
        <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#6366f1" 
            emissiveIntensity={0.6}
          />
        </Sphere>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Security Monitor
        </Text>

        {/* Threat nodes */}
        {events.map((event, index) => {
          const angle = angleStep * index;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <React.Fragment key={event.id || index}>
              <ThreatNode event={event} position={[x, 0, z]} index={index} />
              <Line
                points={[[0, 0, 0], [x, 0, z]]}
                color={event.severity === 'critical' ? '#ff0000' : '#ffaa00'}
                lineWidth={2}
                opacity={0.4}
              />
            </React.Fragment>
          );
        })}

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}