import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function ProtocolHub() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
    </mesh>
  );
}

function MessageStream({ from, to, color }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const points = [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3((from[0] + to[0]) / 2, from[1] + 0.5, from[2]),
    new THREE.Vector3(to[0], to[1], to[2])
  ];

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      transparent
    />
  );
}

function ParticipantNode({ participant, position }) {
  const getColor = () => {
    switch (participant.role) {
      case 'broadcaster': return '#ff8800';
      case 'subscriber': return '#00f5ff';
      case 'sender': return '#44ff44';
      default: return '#a855f7';
    }
  };

  return (
    <group position={position}>
      <Sphere args={[0.25, 16, 16]}>
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {participant.role}
      </Text>
      {participant.message_count > 0 && (
        <Text position={[0, 0.4, 0]} fontSize={0.07} color="#ffaa00">
          {participant.message_count}
        </Text>
      )}
    </group>
  );
}

export default function CommunicationProtocol3D({ protocol }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {protocol && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {protocol.protocol_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {protocol.protocol_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={protocol.is_active ? '#44ff44' : '#ff4444'}>
              {protocol.is_active ? 'Active' : 'Inactive'}
            </Text>

            <ProtocolHub />

            {protocol.participants?.map((participant, i) => {
              const angle = (i / protocol.participants.length) * Math.PI * 2;
              const radius = 3;
              
              return (
                <ParticipantNode
                  key={i}
                  participant={participant}
                  position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                />
              );
            })}

            {protocol.participants?.map((participant, i) => {
              const angle = (i / protocol.participants.length) * Math.PI * 2;
              const radius = 3;
              
              return (
                <MessageStream
                  key={i}
                  from={[0, 0, 0]}
                  to={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                  color="#00f5ff"
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {protocol.message_stats?.total_messages} Messages
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#00f5ff">
                {protocol.message_stats?.messages_per_second?.toFixed(1)} msg/s
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.12} color="#ffffff">
                Success: {(protocol.message_stats?.delivery_success_rate * 100).toFixed(2)}%
              </Text>
            </group>

            {protocol.security?.encryption_enabled && (
              <group position={[0, -4.5, 0]}>
                <Text fontSize={0.12} color="#a855f7">
                  🔒 Encrypted | {protocol.quality_of_service?.delivery_guarantee}
                </Text>
              </group>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}