import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

function HolographicAgent({ agent, position, onSelect }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.01;
    }
  });

  const statusColors = {
    active: '#00f5ff',
    idle: '#a855f7',
    transitioning: '#f59e0b',
    offline: '#666666'
  };

  const color = statusColors[agent.projection_status] || statusColors.idle;

  return (
    <group ref={groupRef} position={position}>
      {/* Holographic body */}
      <group ref={bodyRef}>
        {/* Core */}
        <Sphere args={[0.25, 32, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Head */}
        <Sphere args={[0.15, 32, 32]} position={[0, 0.35, 0]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </Sphere>

        {/* Body glow */}
        <Sphere args={[0.35, 16, 16]}>
          <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
        </Sphere>

        {/* Holographic rings */}
        {[0.4, 0.5, 0.6].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1 + i * 0.1, 0]}>
            <torusGeometry args={[radius, 0.01, 8, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3 - i * 0.08} />
          </mesh>
        ))}

        {/* Energy particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <Float key={i} speed={3} rotationIntensity={0}>
              <Sphere
                args={[0.03, 8, 8]}
                position={[Math.cos(angle) * 0.5, Math.sin(angle) * 0.3, Math.sin(angle) * 0.5]}
              >
                <meshBasicMaterial color={color} />
              </Sphere>
            </Float>
          );
        })}
      </group>

      {/* Interaction zone indicator */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <ringGeometry args={[agent.interaction_zone_radius || 1.5, (agent.interaction_zone_radius || 1.5) + 0.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Agent label */}
      <Html position={[0, 0.7, 0]} center>
        <div
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelect && onSelect(agent)}
          className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all ${
            hovered ? 'bg-white/90 text-slate-900' : 'bg-black/70 text-white'
          }`}
        >
          {agent.agent_id?.slice(0, 8) || 'Agent'}
          <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
            agent.projection_status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
        </div>
      </Html>

      {/* Activity indicator */}
      {agent.current_activity && (
        <Html position={[0, -0.6, 0]} center>
          <div className="bg-purple-500/80 text-white px-2 py-0.5 rounded text-xs">
            {agent.current_activity}
          </div>
        </Html>
      )}
    </group>
  );
}

function RoomEnvironment({ dimensions = { width: 12, height: 3, depth: 10 } }) {
  return (
    <group>
      {/* Floor with grid */}
      <Box args={[dimensions.width, 0.05, dimensions.depth]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#0a0a1a" />
      </Box>
      
      {/* Grid lines */}
      <gridHelper args={[dimensions.width, 12, '#334155', '#1e293b']} position={[0, -0.47, 0]} />

      {/* Walls */}
      <Box args={[dimensions.width, dimensions.height, 0.1]} position={[0, dimensions.height/2 - 0.5, -dimensions.depth/2]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      <Box args={[0.1, dimensions.height, dimensions.depth]} position={[-dimensions.width/2, dimensions.height/2 - 0.5, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
    </group>
  );
}

function DeviceMarker({ device, position }) {
  const [hovered, setHovered] = useState(false);

  const categoryColors = {
    lighting: '#f59e0b',
    climate: '#ef4444',
    security: '#10b981',
    entertainment: '#8b5cf6',
    appliance: '#06b6d4'
  };

  return (
    <group position={position}>
      <Box
        args={[0.3, 0.3, 0.3]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={categoryColors[device.device_category] || '#ffffff'}
          emissive={categoryColors[device.device_category] || '#ffffff'}
          emissiveIntensity={device.connection_status === 'online' ? 0.5 : 0.1}
        />
      </Box>
      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {device.device_name}
            <br />
            <span className="text-slate-400">{device.protocol}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function LiveAgentProjection3D({ agents = [], devices = [], onAgentSelect }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 8, 5]} intensity={1} />
        <pointLight position={[-5, 8, -5]} intensity={0.6} color="#a855f7" />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.6} />

        <RoomEnvironment />

        {agents.map((agent, idx) => (
          <HolographicAgent
            key={agent.id || idx}
            agent={agent}
            position={[
              (agent.current_location?.x || idx * 2 - 3),
              0,
              (agent.current_location?.z || idx * 1.5 - 2)
            ]}
            onSelect={onAgentSelect}
          />
        ))}

        {devices.map((device, idx) => (
          <DeviceMarker
            key={device.id || idx}
            device={device}
            position={[
              device.spatial_location?.x || (idx % 4) * 2 - 3,
              0.5,
              device.spatial_location?.z || Math.floor(idx / 4) * 2 - 2
            ]}
          />
        ))}

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </div>
  );
}