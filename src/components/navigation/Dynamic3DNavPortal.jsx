import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Trail, Float } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LiveMetricDisplay, DataFlowBeam } from './LiveDataProjection3D';
import * as THREE from 'three';

function PortalGate({ position, destination, isActive, onClick }) {
  const gateRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (gateRef.current) {
      gateRef.current.rotation.y += 0.01;
      if (isActive || hovered) {
        gateRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      } else {
        gateRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Portal ring */}
      <mesh ref={gateRef}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={isActive ? '#00ff88' : '#00f5ff'}
          emissive={isActive ? '#00ff88' : '#00f5ff'}
          emissiveIntensity={hovered ? 1 : 0.5}
        />
      </mesh>

      {/* Portal surface */}
      <mesh>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial
          color={isActive ? '#00ff88' : '#00f5ff'}
          transparent
          opacity={hovered ? 0.3 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        fontWeight="bold"
      >
        {destination.name}
      </Text>

      {/* Activity indicator */}
      {destination.activity > 0 && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[0.2, 16, 16]} position={[2, 0, 0]}>
            <meshBasicMaterial color="#ff0066" />
          </Sphere>
        </Float>
      )}
    </group>
  );
}

export default function Dynamic3DNavPortal({ destinations, onNavigate }) {
  const [activePortal, setActivePortal] = useState(null);

  const { data: liveMetrics } = useQuery({
    queryKey: ['nav-live-metrics'],
    queryFn: async () => {
      const [agents, alerts, simulations] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.ProactiveAlert.filter({ status: 'active' }),
        base44.entities.Simulation.filter({ status: 'running' }),
      ]);

      return {
        agents: agents.length,
        alerts: alerts.length,
        simulations: simulations.length,
      };
    },
    refetchInterval: 5000,
  });

  const portalPositions = destinations.map((_, index) => {
    const angle = (index / destinations.length) * Math.PI * 2;
    const radius = 8;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5) * 3,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

      {/* Center hub */}
      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Live metrics displays */}
      {liveMetrics && (
        <>
          <LiveMetricDisplay
            position={[-3, 4, 0]}
            label="Active Agents"
            value={liveMetrics.agents}
            trend={5}
            color="#00f5ff"
          />
          <LiveMetricDisplay
            position={[3, 4, 0]}
            label="Alerts"
            value={liveMetrics.alerts}
            trend={-2}
            color="#ff8800"
          />
          <LiveMetricDisplay
            position={[0, 6, 0]}
            label="Simulations"
            value={liveMetrics.simulations}
            trend={3}
            color="#a855f7"
          />
        </>
      )}

      {/* Portals */}
      {destinations.map((dest, index) => (
        <PortalGate
          key={index}
          position={portalPositions[index]}
          destination={dest}
          isActive={activePortal === index}
          onClick={() => {
            setActivePortal(index);
            onNavigate(dest);
          }}
        />
      ))}

      {/* Data beams between center and portals */}
      {portalPositions.map((pos, i) => (
        <DataFlowBeam
          key={i}
          start={[0, 0, 0]}
          end={pos}
          color="#00f5ff"
          speed={0.5 + i * 0.2}
        />
      ))}

      <OrbitControls enableZoom={true} enablePan={false} />
      
      {/* Starfield background */}
      {Array.from({ length: 1000 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02, 8, 8]}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
          ]}
        >
          <meshBasicMaterial color="white" />
        </Sphere>
      ))}
    </Canvas>
  );
}