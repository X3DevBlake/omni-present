import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text } from '@react-three/drei';
import * as THREE from 'three';

function EcosystemNode({ position, data, type }) {
  const nodeRef = useRef();
  const [pulse, setPulse] = useState(0);

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.01;
      setPulse(Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const typeColors = {
    event: '#ef4444',
    device: '#22d3ee',
    weather: '#60a5fa',
    agent: '#8b5cf6'
  };

  return (
    <group position={position}>
      <Sphere args={[0.3 + pulse, 16, 16]} ref={nodeRef}>
        <meshStandardMaterial
          color={typeColors[type] || '#6366f1'}
          emissive={typeColors[type] || '#6366f1'}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text position={[0, -0.6, 0]} fontSize={0.15} color="white" anchorX="center">
        {type.toUpperCase()}
      </Text>
    </group>
  );
}

function DataStream({ from, to }) {
  const particleRef = useRef();

  useFrame((state) => {
    if (particleRef.current) {
      const t = (Math.sin(state.clock.elapsedTime) + 1) / 2;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...from),
        new THREE.Vector3(0, 3, 0),
        new THREE.Vector3(...to)
      );
      const point = curve.getPoint(t);
      particleRef.current.position.set(point.x, point.y, point.z);
    }
  });

  return (
    <Sphere ref={particleRef} args={[0.08, 8, 8]}>
      <meshBasicMaterial color="#fbbf24" />
    </Sphere>
  );
}

export default function PersistentWorldEngine3D({ events, devices, weatherData, agents }) {
  const nodes = [
    { type: 'event', count: events?.length || 0, position: [-3, 1, 0] },
    { type: 'device', count: devices?.length || 0, position: [3, 1, 0] },
    { type: 'weather', count: weatherData?.length || 0, position: [0, 1, 3] },
    { type: 'agent', count: agents?.length || 0, position: [0, 1, -3] }
  ];

  return (
    <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      {/* Central Core */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          emissive="#6366f1"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Data Nodes */}
      {nodes.map((node, idx) => (
        <EcosystemNode
          key={idx}
          position={node.position}
          data={node}
          type={node.type}
        />
      ))}

      {/* Data Streams */}
      {nodes.map((node, idx) => (
        <DataStream key={`stream-${idx}`} from={node.position} to={[0, 0, 0]} />
      ))}

      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe
          opacity={0.2}
          transparent
        />
      </mesh>

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}