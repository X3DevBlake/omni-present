import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function EventParticle({ position, label, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += 0.02;
      if (meshRef.current.position.y > 5) {
        meshRef.current.position.y = -5;
      }
    }
  });

  return (
    <group position={position} ref={meshRef}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.15} color="white">
        {label}
      </Text>
    </group>
  );
}

export default function SimulationEventStream3D() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes = ['Task', 'Decision', 'Interaction', 'Learning'];
      const colors = ['#00f5ff', '#a855f7', '#10b981', '#f59e0b'];
      const idx = Math.floor(Math.random() * eventTypes.length);
      
      setEvents(prev => [...prev.slice(-10), {
        id: Date.now(),
        label: eventTypes[idx],
        color: colors[idx],
        x: (Math.random() - 0.5) * 4
      }]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {events.map((event, i) => (
          <EventParticle
            key={event.id}
            position={[event.x, -5 + i * 0.5, 0]}
            label={event.label}
            color={event.color}
          />
        ))}

        <OrbitControls enableZoom />
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  );
}