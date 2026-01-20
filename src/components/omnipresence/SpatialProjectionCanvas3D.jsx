import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sphere, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

function ProjectedAgentModel({ presence }) {
  const agentRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (agentRef.current) {
      agentRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      agentRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const statusColors = {
    active: '#00ff88',
    idle: '#fbbf24',
    transitioning: '#60a5fa',
    offline: '#ef4444'
  };

  const color = statusColors[presence.projection_status] || '#6366f1';
  const position = [
    presence.current_location?.x || 0,
    presence.current_location?.y || 0.5,
    presence.current_location?.z || 0
  ];

  return (
    <group position={position}>
      <Sphere
        ref={agentRef}
        args={[0.3, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Interaction Zone */}
      <mesh>
        <ringGeometry args={[presence.interaction_zone_radius - 0.1, presence.interaction_zone_radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-cyan-500 rounded-lg p-3 min-w-[200px]">
            <p className="text-white font-bold text-sm mb-1">Agent: {presence.agent_id?.substring(0, 8)}</p>
            <p className="text-cyan-400 text-xs mb-1">Status: {presence.projection_status}</p>
            <p className="text-slate-400 text-xs mb-1">Activity: {presence.current_activity}</p>
            <p className="text-green-400 text-xs">Battery: {presence.battery_level}%</p>
          </div>
        </Html>
      )}

      {/* Movement Path */}
      {presence.movement_path?.length > 0 && (
        <Line
          points={presence.movement_path.map(p => [
            p.waypoint?.x || 0,
            p.waypoint?.y || 0.5,
            p.waypoint?.z || 0
          ])}
          color="#60a5fa"
          lineWidth={2}
          transparent
          opacity={0.5}
        />
      )}
    </group>
  );
}

function OmniDeviceModel({ device }) {
  const position = [
    device.physical_location?.x || 0,
    device.physical_location?.y || 2,
    device.physical_location?.z || 0
  ];

  return (
    <group position={position}>
      <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05}>
        <meshStandardMaterial
          color={device.online_status ? '#22d3ee' : '#64748b'}
          emissive={device.online_status ? '#22d3ee' : '#1e293b'}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
        />
      </RoundedBox>

      <Text position={[0, -0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {device.device_name?.substring(0, 15)}
      </Text>

      {/* Coverage Area */}
      {device.coverage_area && (
        <mesh>
          <sphereGeometry args={[device.coverage_area.radius_meters || 3, 16, 16]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.05}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

function EnvironmentGrid({ spatialMap }) {
  return (
    <group>
      <gridHelper args={[20, 20, '#334155', '#1e293b']} />
      
      {spatialMap?.designated_zones?.map((zone, idx) => (
        <mesh key={idx} position={[
          zone.boundaries?.[0]?.x || 0,
          0.01,
          zone.boundaries?.[0]?.z || 0
        ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color={zone.zone_type === 'safe' ? '#10b981' : zone.zone_type === 'no_go' ? '#ef4444' : '#6366f1'}
            transparent
            opacity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SpatialProjectionCanvas3D({ presences, devices, spatialMaps }) {
  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#22d3ee" />
      <spotLight position={[0, 10, 0]} angle={0.5} intensity={0.8} />

      <Text position={[0, 5, 0]} fontSize={0.4} color="white" anchorX="center">
        Physical Projection Space
      </Text>

      <EnvironmentGrid spatialMap={spatialMaps[0]} />

      {presences.map(presence => (
        <ProjectedAgentModel key={presence.id} presence={presence} />
      ))}

      {devices.map(device => (
        <OmniDeviceModel key={device.id} device={device} />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}