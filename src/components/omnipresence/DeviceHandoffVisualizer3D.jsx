import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function HandoffDevice({ device, position, role }) {
  const deviceRef = useRef();

  useFrame(() => {
    if (deviceRef.current) {
      deviceRef.current.rotation.y += 0.015;
    }
  });

  const roleColors = {
    source: '#ef4444',
    target: '#10b981',
    relay: '#f59e0b'
  };

  return (
    <group position={position}>
      <RoundedBox ref={deviceRef} args={[0.5, 0.5, 0.5]} radius={0.05}>
        <meshStandardMaterial
          color={roleColors[role]}
          emissive={roleColors[role]}
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      <Text position={[0, -0.8, 0]} fontSize={0.12} color="white" anchorX="center">
        {device.device_name?.substring(0, 10)}
      </Text>
      <Text position={[0, -1, 0]} fontSize={0.1} color={roleColors[role]} anchorX="center">
        {role.toUpperCase()}
      </Text>
    </group>
  );
}

function TransferringAgent({ position, progress }) {
  const agentRef = useRef();

  useFrame((state) => {
    if (agentRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      agentRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  return (
    <Sphere ref={agentRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={1}
        metalness={0.9}
        roughness={0.1}
      />
    </Sphere>
  );
}

export default function DeviceHandoffVisualizer3D({ communications, devices }) {
  const activeHandoff = communications.find(c => c.handoff_status === 'in_progress') || communications[0];

  const sourceDevice = devices.find(d => d.id === activeHandoff?.source_device_id);
  const targetDevice = devices.find(d => d.id === activeHandoff?.target_device_id);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />

      <Text position={[0, 4, 0]} fontSize={0.35} color="white" anchorX="center">
        Device-to-Device Handoff
      </Text>

      {sourceDevice && (
        <HandoffDevice
          device={sourceDevice}
          position={[-3, 1, 0]}
          role="source"
        />
      )}

      {targetDevice && (
        <HandoffDevice
          device={targetDevice}
          position={[3, 1, 0]}
          role="target"
        />
      )}

      {activeHandoff && (
        <TransferringAgent
          position={[0, 1, 0]}
          progress={0.5}
        />
      )}

      {/* Transfer beam */}
      {activeHandoff && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-3, 1, 0, 3, 1, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00f5ff" transparent opacity={0.5} linewidth={3} />
        </line>
      )}

      <OrbitControls enableZoom={true} minDistance={5} maxDistance={15} />
    </Canvas>
  );
}