import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

function HolographicBody({ agent, position, isCollaborating, collaborationTarget }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.08;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.015;
    }
  });

  const statusColors = {
    active: '#00f5ff',
    idle: '#a855f7',
    collaborating: '#ec4899',
    executing_task: '#10b981',
    transitioning: '#f59e0b'
  };

  const color = isCollaborating ? statusColors.collaborating : (statusColors[agent.projection_status] || statusColors.idle);

  return (
    <group ref={groupRef} position={position}>
      <Trail width={0.5} length={6} color={color} attenuation={(t) => t * t}>
        <group ref={bodyRef}>
          {/* Humanoid core */}
          <Sphere args={[0.18, 32, 32]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.95} />
          </Sphere>

          {/* Head */}
          <Sphere args={[0.12, 32, 32]} position={[0, 0.28, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
          </Sphere>

          {/* Eye indicators */}
          <Sphere args={[0.02, 8, 8]} position={[-0.04, 0.3, 0.1]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          <Sphere args={[0.02, 8, 8]} position={[0.04, 0.3, 0.1]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>

          {/* Arms */}
          <Box args={[0.04, 0.25, 0.04]} position={[-0.2, 0, 0]} rotation={[0, 0, 0.3]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </Box>
          <Box args={[0.04, 0.25, 0.04]} position={[0.2, 0, 0]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </Box>

          {/* Energy field */}
          <Sphere args={[0.35, 16, 16]}>
            <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
          </Sphere>

          {/* Holographic rings */}
          {[0.4, 0.5, 0.6].map((r, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, state => (state?.clock?.elapsedTime || 0) * (i + 1) * 0.5]} position={[0, -0.15 + i * 0.08, 0]}>
              <torusGeometry args={[r, 0.015, 8, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.4 - i * 0.1} />
            </mesh>
          ))}

          {/* Task indicator particles */}
          {agent.current_activity && (
            <Float speed={5} rotationIntensity={0}>
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                  <Sphere key={i} args={[0.025, 8, 8]} position={[Math.cos(angle) * 0.5, 0.4, Math.sin(angle) * 0.5]}>
                    <meshBasicMaterial color="#10b981" />
                  </Sphere>
                );
              })}
            </Float>
          )}
        </group>
      </Trail>

      {/* Interaction zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <ringGeometry args={[agent.interaction_zone_radius || 1.5, (agent.interaction_zone_radius || 1.5) + 0.08, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Agent info */}
      <Html position={[0, 0.6, 0]} center>
        <div
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all backdrop-blur-sm ${
            hovered ? 'bg-white/95 text-slate-900 scale-110' : 'bg-black/80 text-white'
          }`}
        >
          <span className="font-medium">{agent.agent_id?.slice(0, 8) || 'Agent'}</span>
          <span className={`ml-2 inline-block w-2.5 h-2.5 rounded-full animate-pulse ${
            agent.projection_status === 'active' ? 'bg-green-400' : 'bg-cyan-400'
          }`} />
        </div>
      </Html>

      {agent.current_activity && (
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white px-2 py-0.5 rounded text-xs font-medium">
            🎯 {agent.current_activity}
          </div>
        </Html>
      )}
    </group>
  );
}

function CollaborationBeam({ from, to, intensity = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.dashOffset = state.clock.elapsedTime * 2;
    }
  });

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from),
    new THREE.Vector3((from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 1.5, (from[2] + to[2]) / 2),
    new THREE.Vector3(...to)
  );

  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 32, 0.03 * intensity, 8, false]} />
      <meshBasicMaterial color="#ec4899" transparent opacity={0.6 * intensity} />
    </mesh>
  );
}

function SmartEnvironment({ dimensions = { width: 14, depth: 12, height: 3 } }) {
  return (
    <group>
      {/* Floor with enhanced grid */}
      <Box args={[dimensions.width, 0.05, dimensions.depth]} position={[dimensions.width/2 - 1, -0.5, dimensions.depth/2 - 1]}>
        <meshStandardMaterial color="#080812" />
      </Box>

      {/* Grid */}
      <gridHelper
        args={[dimensions.width, 14, '#1e3a5f', '#0f172a']}
        position={[dimensions.width/2 - 1, -0.47, dimensions.depth/2 - 1]}
      />

      {/* Walls with glow effect */}
      <Box args={[dimensions.width, dimensions.height, 0.1]} position={[dimensions.width/2 - 1, dimensions.height/2 - 0.5, -1]}>
        <meshStandardMaterial color="#0a0a1f" transparent opacity={0.4} />
      </Box>
      <Box args={[0.1, dimensions.height, dimensions.depth]} position={[-1, dimensions.height/2 - 0.5, dimensions.depth/2 - 1]}>
        <meshStandardMaterial color="#0a0a1f" transparent opacity={0.4} />
      </Box>

      {/* Ambient particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0}>
          <Sphere
            args={[0.02, 8, 8]}
            position={[
              Math.random() * dimensions.width - 1,
              Math.random() * dimensions.height,
              Math.random() * dimensions.depth - 1
            ]}
          >
            <meshBasicMaterial color={['#00f5ff', '#a855f7', '#ec4899'][i % 3]} transparent opacity={0.4} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function DeviceMarker3D({ device, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = device.spatial_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  const categoryColors = {
    lighting: '#f59e0b',
    climate: '#3b82f6',
    security: '#10b981',
    sensor: '#8b5cf6',
    appliance: '#06b6d4',
    robotic_arm: '#ec4899'
  };

  const color = categoryColors[device.device_category || device.device_type] || '#ffffff';
  const isOnline = device.connection_status === 'online' || device.connection_status === 'connected';

  return (
    <group
      position={[pos.x || 0, 0.4, pos.z || 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick && onClick(device)}
    >
      <group ref={ref}>
        <Box args={[0.25, 0.25, 0.25]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isOnline ? 0.7 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
      </group>

      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial color={isOnline ? '#10b981' : '#ef4444'} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-44 shadow-xl">
            <p className="font-bold" style={{ color }}>{device.device_name}</p>
            <p className="text-slate-400">{device.protocol || device.api_provider} • {device.device_category || device.device_type}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function AdvancedAgentSpaceVisualizer3D({ agents = [], devices = [], collaborations = [], onAgentSelect, onDeviceClick }) {
  // Build collaboration map
  const collaboratingAgents = new Set();
  const collaborationLines = [];

  collaborations.forEach(collab => {
    if (collab.participating_agents?.length > 1) {
      collab.participating_agents.forEach(pa => collaboratingAgents.add(pa.agent_id));
      for (let i = 0; i < collab.participating_agents.length - 1; i++) {
        const a1 = agents.find(a => a.agent_id === collab.participating_agents[i].agent_id);
        const a2 = agents.find(a => a.agent_id === collab.participating_agents[i + 1].agent_id);
        if (a1 && a2) {
          collaborationLines.push({
            from: [a1.current_location?.x || i * 2, 0.5, a1.current_location?.z || i],
            to: [a2.current_location?.x || (i + 1) * 2, 0.5, a2.current_location?.z || i + 1]
          });
        }
      }
    }
  });

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 8, 10], fov: 55 }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 12, 10]} intensity={1.2} />
        <pointLight position={[-5, 10, -5]} intensity={0.6} color="#a855f7" />
        <spotLight position={[6, 15, 6]} intensity={0.5} angle={0.6} />

        <SmartEnvironment />

        {/* Collaboration beams */}
        {collaborationLines.map((line, idx) => (
          <CollaborationBeam key={idx} from={line.from} to={line.to} intensity={0.8} />
        ))}

        {/* Agents */}
        {agents.map((agent, idx) => (
          <HolographicBody
            key={agent.id || idx}
            agent={agent}
            position={[
              agent.current_location?.x || idx * 2.5 - 3,
              0,
              agent.current_location?.z || idx * 1.8 - 2
            ]}
            isCollaborating={collaboratingAgents.has(agent.agent_id)}
            onSelect={onAgentSelect}
          />
        ))}

        {/* Devices */}
        {devices.map((device, idx) => (
          <DeviceMarker3D
            key={device.id || idx}
            device={device}
            onClick={onDeviceClick}
          />
        ))}

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}