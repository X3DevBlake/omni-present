import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Line, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveZone({ zone, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  
  const bounds = zone.boundaries || { min_x: 0, max_x: 2, min_y: 0, max_y: 0.1, min_z: 0, max_z: 2 };
  const width = bounds.max_x - bounds.min_x;
  const height = 0.15;
  const depth = bounds.max_z - bounds.min_z;
  const centerX = (bounds.min_x + bounds.max_x) / 2;
  const centerZ = (bounds.min_z + bounds.max_z) / 2;

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1 + (hovered ? 0.2 : 0);
    }
  });

  const zoneTypeColors = {
    interaction: '#00f5ff',
    projection: '#a855f7',
    navigation: '#10b981',
    restricted: '#ef4444',
    charging: '#f59e0b',
    collaboration: '#ec4899',
    sensor_coverage: '#84cc16'
  };

  const color = zone.color_code || zoneTypeColors[zone.zone_type] || '#ffffff';

  return (
    <group position={[centerX, 0.1, centerZ]}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick && onClick(zone)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Zone border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {/* Heat indicator */}
      {zone.activity_heat_score > 0 && (
        <mesh position={[0, height + 0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, zone.activity_heat_score / 100 * 0.5, 16]} />
          <meshStandardMaterial
            color={zone.activity_heat_score > 70 ? '#ef4444' : zone.activity_heat_score > 40 ? '#f59e0b' : '#10b981'}
            emissive={zone.activity_heat_score > 70 ? '#ef4444' : zone.activity_heat_score > 40 ? '#f59e0b' : '#10b981'}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-40 shadow-xl">
            <p className="font-bold" style={{ color }}>{zone.zone_name}</p>
            <p className="text-slate-400">Type: {zone.zone_type}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-orange-400">Heat: {zone.activity_heat_score || 0}%</span>
              <span className="text-cyan-400">Occ: {zone.real_time_occupancy || 0}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function SmartDevice3D({ device, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = device.spatial_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current && device.connection_status === 'online') {
      ref.current.rotation.y += 0.02;
    }
  });

  const categoryShapes = {
    lighting: () => (
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={device.current_state?.power ? 1 : 0.2}
        />
      </Sphere>
    ),
    climate: () => (
      <Box args={[0.25, 0.15, 0.08]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </Box>
    ),
    security: () => (
      <group>
        <Box args={[0.12, 0.2, 0.12]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </Box>
        <Sphere args={[0.05, 8, 8]} position={[0, 0.15, 0.05]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
        </Sphere>
      </group>
    ),
    sensor: () => (
      <group>
        <Sphere args={[0.1, 16, 16]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.6} />
        </Sphere>
        <mesh>
          <coneGeometry args={[0.3, 0.5, 16, 1, true]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    )
  };

  const DeviceShape = categoryShapes[device.device_category] || categoryShapes.lighting;

  return (
    <group
      position={[pos.x || 0, 0.3, pos.z || 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick && onClick(device)}
    >
      <group ref={ref}>
        <DeviceShape />
      </group>

      {/* Connection status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial
          color={device.connection_status === 'online' ? '#10b981' : '#ef4444'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-44">
            <p className="font-bold text-cyan-400">{device.device_name}</p>
            <p className="text-slate-400">{device.protocol} | {device.device_category}</p>
            {device.current_state?.power !== undefined && (
              <p className={device.current_state.power ? 'text-green-400' : 'text-red-400'}>
                Power: {device.current_state.power ? 'ON' : 'OFF'}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function AgentProjection3D({ agent, onSelect }) {
  const ref = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[pos.x || 0, 0, pos.z || 0]}>
      <group ref={ref}>
        <Sphere args={[0.2, 32, 32]}>
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </Sphere>
        <Sphere args={[0.3, 16, 16]}>
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.2} wireframe />
        </Sphere>
      </group>

      {/* Movement path preview */}
      {agent.movement_path?.length > 0 && (
        <Line
          points={agent.movement_path.map(wp => [wp.waypoint?.x || 0, 0.3, wp.waypoint?.z || 0])}
          color="#00f5ff"
          lineWidth={2}
          dashed
          dashScale={5}
        />
      )}

      <Html position={[0, 1, 0]} center>
        <div
          onClick={() => onSelect && onSelect(agent)}
          className="bg-cyan-500/90 text-white px-2 py-1 rounded cursor-pointer text-xs"
        >
          {agent.agent_id?.slice(0, 8) || 'Agent'}
        </div>
      </Html>
    </group>
  );
}

export default function EnhancedSpatialProjectionMap3D({ 
  zones = [], 
  devices = [], 
  agents = [],
  onZoneClick,
  onDeviceClick,
  onAgentSelect
}) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />
        <spotLight position={[0, 15, 0]} intensity={0.4} angle={0.8} />

        {/* Floor */}
        <Box args={[14, 0.05, 12]} position={[6, 0, 5]}>
          <meshStandardMaterial color="#0a0a1a" />
        </Box>
        <Grid args={[14, 12]} position={[6, 0.03, 5]} cellColor="#334155" sectionColor="#475569" />

        {/* Zones */}
        {zones.map((zone, idx) => (
          <InteractiveZone key={zone.id || idx} zone={zone} onClick={onZoneClick} />
        ))}

        {/* Devices */}
        {devices.map((device, idx) => (
          <SmartDevice3D key={device.id || idx} device={device} onClick={onDeviceClick} />
        ))}

        {/* Agents */}
        {agents.map((agent, idx) => (
          <AgentProjection3D key={agent.id || idx} agent={agent} onSelect={onAgentSelect} />
        ))}

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}