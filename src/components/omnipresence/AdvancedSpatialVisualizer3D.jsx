import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line, Grid } from '@react-three/drei';
import * as THREE from 'three';

function PhysicalAgent({ agent, position, color, isActive }) {
  const ref = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Agent body */}
      <Sphere args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.4}
        />
      </Sphere>
      
      {/* Holographic aura */}
      <Sphere ref={auraRef} args={[0.4, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>

      {/* Interaction radius */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {agent.name || 'Agent'}
      </Text>
    </group>
  );
}

function SmartDevice({ device, position }) {
  const typeColors = {
    light: '#f59e0b',
    thermostat: '#ef4444',
    lock: '#10b981',
    robotic_arm: '#8b5cf6',
    camera: '#06b6d4'
  };

  return (
    <group position={position}>
      <Box args={[0.3, 0.3, 0.3]}>
        <meshStandardMaterial
          color={typeColors[device.device_type] || '#ffffff'}
          emissive={typeColors[device.device_type] || '#ffffff'}
          emissiveIntensity={device.current_state?.power_on ? 0.6 : 0.2}
        />
      </Box>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
      >
        {device.device_name?.slice(0, 10)}
      </Text>
    </group>
  );
}

function Zone({ zone, index }) {
  const zoneColors = {
    safe: '#10b981',
    no_go: '#ef4444',
    interaction: '#06b6d4',
    charging: '#f59e0b'
  };

  const color = zoneColors[zone.zone_type] || '#ffffff';

  return (
    <group position={[index * 3 - 4, 0.01, index * 2 - 3]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
      >
        {zone.zone_name}
      </Text>
    </group>
  );
}

function CollaborationLink({ from, to, active }) {
  const points = useMemo(() => [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ], [from, to]);

  return (
    <Line
      points={points}
      color={active ? '#00ff88' : '#666666'}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
      dashed={!active}
    />
  );
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <Box args={[14, 0.1, 10]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      
      {/* Grid overlay */}
      <Grid
        args={[14, 10]}
        position={[0, 0.02, 0]}
        cellColor="#334155"
        sectionColor="#475569"
        fadeDistance={20}
      />

      {/* Walls */}
      <Box args={[14, 3, 0.15]} position={[0, 1.5, -5]}>
        <meshStandardMaterial color="#16213e" transparent opacity={0.5} />
      </Box>
      <Box args={[0.15, 3, 10]} position={[-7, 1.5, 0]}>
        <meshStandardMaterial color="#16213e" transparent opacity={0.5} />
      </Box>
      <Box args={[0.15, 3, 10]} position={[7, 1.5, 0]}>
        <meshStandardMaterial color="#16213e" transparent opacity={0.5} />
      </Box>
    </group>
  );
}

export default function AdvancedSpatialVisualizer3D({ 
  agents = [], 
  devices = [], 
  zones = [], 
  collaborations = [],
  onAgentClick 
}) {
  const agentColors = ['#00f5ff', '#a855f7', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 8, 5]} intensity={1} />
        <pointLight position={[-5, 8, -5]} intensity={0.6} color="#a855f7" />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#00ff88" />

        {/* Title */}
        <Text
          position={[0, 4, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
        >
          Advanced Spatial Map
        </Text>

        {/* Room Environment */}
        <Room />

        {/* Zones */}
        {zones.map((zone, idx) => (
          <Zone key={idx} zone={zone} index={idx} />
        ))}

        {/* Smart Devices */}
        {devices.map((device, idx) => (
          <SmartDevice
            key={device.id}
            device={device}
            position={[
              Math.cos((idx / devices.length) * Math.PI * 2) * 5,
              0.5,
              Math.sin((idx / devices.length) * Math.PI * 2) * 3
            ]}
          />
        ))}

        {/* Physical Agents */}
        {agents.map((agent, idx) => (
          <PhysicalAgent
            key={agent.id}
            agent={agent}
            position={[
              (idx - agents.length / 2) * 2.5,
              1,
              Math.sin(idx) * 2
            ]}
            color={agentColors[idx % agentColors.length]}
            isActive={agent.projection_status === 'active'}
          />
        ))}

        {/* Collaboration Links */}
        {agents.length > 1 && agents.slice(0, -1).map((agent, idx) => (
          <CollaborationLink
            key={idx}
            from={[(idx - agents.length / 2) * 2.5, 1, Math.sin(idx) * 2]}
            to={[(idx + 1 - agents.length / 2) * 2.5, 1, Math.sin(idx + 1) * 2]}
            active={collaborations.length > 0}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}