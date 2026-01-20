import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, RoundedBox, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

function DeviceNode({ device, position }) {
  const nodeRef = useRef();

  useFrame(() => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.02;
    }
  });

  const deviceColors = {
    holographic_projector: '#00f5ff',
    ar_glasses: '#a855f7',
    smart_speaker: '#10b981',
    smart_tv: '#3b82f6',
    smart_mirror: '#ec4899',
    projection_drone: '#f59e0b'
  };

  const color = deviceColors[device.device_type] || '#6366f1';

  return (
    <group position={position}>
      <RoundedBox ref={nodeRef} args={[0.4, 0.4, 0.4]} radius={0.05}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      <mesh>
        <sphereGeometry args={[device.coverage_area?.radius_meters || 3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>

      <Text position={[0, -0.7, 0]} fontSize={0.12} color="white" anchorX="center">
        {device.device_name?.substring(0, 12)}
      </Text>
    </group>
  );
}

function ProjectionBeam({ from, to, projection }) {
  const color = projection.projection_portion === 'full' ? '#00ff88' : '#60a5fa';

  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  );
}

function CoverageOverlapZone({ zone }) {
  return (
    <mesh position={[zone.coordinates?.x || 0, 0.1, zone.coordinates?.z || 0]}>
      <cylinderGeometry args={[1, 1, 0.2, 32]} />
      <meshStandardMaterial
        color="#a855f7"
        transparent
        opacity={0.2}
        emissive="#a855f7"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function MultiDeviceProjectionVisualizer3D({ projections, devices }) {
  const projection = projections[0];
  
  const devicePositions = React.useMemo(() => {
    return devices.slice(0, 8).map((device, idx) => {
      const angle = (idx / Math.min(devices.length, 8)) * Math.PI * 2;
      const radius = 4;
      return [
        Math.cos(angle) * radius,
        device.physical_location?.y || 1,
        Math.sin(angle) * radius
      ];
    });
  }, [devices]);

  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />

      <Text position={[0, 5, 0]} fontSize={0.4} color="white" anchorX="center">
        Multi-Device Projection Network
      </Text>

      <gridHelper args={[20, 20, '#334155', '#1e293b']} />

      {devices.slice(0, 8).map((device, idx) => (
        <DeviceNode
          key={device.id}
          device={device}
          position={devicePositions[idx]}
        />
      ))}

      {projection?.active_devices?.map((activeDevice, idx) => {
        const deviceIdx = devices.findIndex(d => d.id === activeDevice.device_id);
        if (deviceIdx >= 0 && devicePositions[deviceIdx]) {
          return (
            <ProjectionBeam
              key={idx}
              from={[0, 1, 0]}
              to={devicePositions[deviceIdx]}
              projection={activeDevice}
            />
          );
        }
        return null;
      })}

      {projection?.coverage_map?.overlap_zones?.map((zone, idx) => (
        <CoverageOverlapZone key={idx} zone={zone} />
      ))}

      {/* Central Agent */}
      <Sphere args={[0.5, 32, 32]} position={[0, 1, 0]}>
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
}