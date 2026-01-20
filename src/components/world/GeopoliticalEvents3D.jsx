import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function EventPulse({ position, event }) {
  const pulseRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  const severityColor = event.severity === 'critical' ? '#dc2626' :
                        event.severity === 'high' ? '#ea580c' :
                        event.severity === 'medium' ? '#ca8a04' : '#2563eb';

  const severitySize = event.severity === 'critical' ? 0.6 :
                       event.severity === 'high' ? 0.5 :
                       event.severity === 'medium' ? 0.4 : 0.3;

  return (
    <group position={position}>
      {/* Event Core */}
      <Sphere
        args={[severitySize, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Pulse Ring */}
      <mesh ref={pulseRef}>
        <torusGeometry args={[severitySize + 0.2, 0.05, 16, 100]} />
        <meshBasicMaterial color={severityColor} transparent opacity={0.5} />
      </mesh>

      {/* Event Label */}
      <Text
        position={[0, severitySize + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {event.event_name?.substring(0, 20)}
      </Text>

      {/* Region Label */}
      <Text
        position={[0, -severitySize - 0.3, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
      >
        {event.region}
      </Text>

      {/* Impact Type Indicator */}
      {hovered && (
        <Text
          position={[0, -severitySize - 0.6, 0]}
          fontSize={0.12}
          color="#22d3ee"
          anchorX="center"
        >
          {event.impact_type}
        </Text>
      )}
    </group>
  );
}

function ImpactWave({ from, to, severity }) {
  const points = React.useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3((from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 1, (from[2] + to[2]) / 2),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(30);
  }, [from, to]);

  const color = severity === 'critical' ? '#dc2626' :
                severity === 'high' ? '#ea580c' : '#94a3b8';

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} opacity={0.3} transparent />
    </line>
  );
}

export default function GeopoliticalEvents3D({ events }) {
  // Arrange events in a circular pattern
  const eventPositions = events.slice(0, 12).map((_, idx) => {
    const angle = (idx / 12) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#dc2626" />

      {/* Central Globe */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.5}
          roughness={0.5}
          wireframe
        />
      </Sphere>

      {/* Event Nodes */}
      {events.slice(0, 12).map((event, idx) => (
        <EventPulse
          key={event.id}
          position={eventPositions[idx]}
          event={event}
        />
      ))}

      {/* Impact Connections */}
      {events.slice(0, 12).map((event, idx) => {
        if (idx < events.length - 1) {
          return (
            <ImpactWave
              key={`wave-${idx}`}
              from={eventPositions[idx]}
              to={eventPositions[idx + 1] || [0, 0, 0]}
              severity={event.severity}
            />
          );
        }
        return null;
      })}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}