import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function DeviceNode({ position, device }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  const statusColor = device.metadata?.status === 'online' ? '#10b981' :
                      device.metadata?.status === 'offline' ? '#ef4444' : '#f59e0b';

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.15, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-cyan-500 rounded-lg p-2 min-w-[150px]">
            <p className="text-white font-bold text-xs mb-1">
              {device.metadata?.device_name || 'Device'}
            </p>
            <p className="text-slate-400 text-xs">
              Type: {device.metadata?.device_type || 'Unknown'}
            </p>
            <p className="text-cyan-400 text-xs">
              Health: {Math.round(device.reading_value || 0)}%
            </p>
          </div>
        </Html>
      )}

      {/* Connection Line to Center */}
      <Line
        points={[position, [0, 0, 0]]}
        color={statusColor}
        lineWidth={1}
        transparent
        opacity={0.3}
      />
    </group>
  );
}

function NetworkHub() {
  const hubRef = useRef();

  useFrame((state) => {
    if (hubRef.current) {
      hubRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={hubRef}>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      <Text position={[0, -0.8, 0]} fontSize={0.2} color="white">
        Network Hub
      </Text>
    </group>
  );
}

export default function DeviceLocationMap3D({ devices }) {
  // Arrange devices in a circular pattern
  const devicePositions = devices.slice(0, 20).map((_, idx) => {
    const angle = (idx / 20) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      <NetworkHub />

      {devices.slice(0, 20).map((device, idx) => (
        <DeviceNode
          key={device.id}
          position={devicePositions[idx]}
          device={device}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}