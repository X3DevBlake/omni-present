import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function HubNode({ position, label, color, onClick, metrics, isActive }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.scale.set(
        hovered ? 1.3 : isActive ? 1.15 : 1,
        hovered ? 1.3 : isActive ? 1.15 : 1,
        hovered ? 1.3 : isActive ? 1.15 : 1
      );
      meshRef.current.material.emissiveIntensity = hovered || isActive ? 0.8 : 0.4;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Orbit rings */}
      <mesh>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          transparent={true}
          opacity={hovered || isActive ? 0.6 : 0.2}
        />
      </mesh>

      {/* Floating metrics */}
      {metrics && (hovered || isActive) && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {label}: {metrics}
        </Text>
      )}
    </group>
  );
}

function DataStream({ from, to }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ];
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#a855f7"
        transparent={true}
        opacity={0.3}
        linewidth={2}
      />
    </line>
  );
}

export default function EcosystemMap3D({ activeHubs = [] }) {
  const navigate = useNavigate();
  const [hoveredHub, setHoveredHub] = useState(null);

  const hubs = [
    { id: 'agents', label: 'Agent Hub', position: [-6, 0, -4], color: '#00f5ff', metrics: '24' },
    { id: 'simulation', label: 'Simulation Labs', position: [6, 0, -4], color: '#a855f7', metrics: '5' },
    { id: 'knowledge', label: 'Knowledge Graph', position: [0, 6, 0], color: '#ec4899', metrics: '1.2K' },
    { id: 'analytics', label: 'Analytics', position: [-6, 0, 4], color: '#3b82f6', metrics: '847' },
    { id: 'sandbox', label: 'Sandbox', position: [6, 0, 4], color: '#10b981', metrics: '12' },
  ];

  const handleHubClick = (hubId) => {
    const navigationMap = {
      agents: 'AgentManagementHub',
      simulation: 'SimulationLabs',
      knowledge: 'KnowledgeBase',
      analytics: 'Analytics',
      sandbox: 'SandboxHub',
    };
    navigate(createPageUrl(navigationMap[hubId] || 'Home'));
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#a855f7" />

        {/* Central reference */}
        <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.1}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.2}
            />
          </mesh>
        </Float>

        {/* Hub nodes */}
        {hubs.map((hub) => (
          <HubNode
            key={hub.id}
            position={hub.position}
            label={hub.label}
            color={hub.color}
            metrics={hub.metrics}
            onClick={() => handleHubClick(hub.id)}
            isActive={activeHubs.includes(hub.id)}
          />
        ))}

        {/* Data streams between hubs */}
        <DataStream from={hubs[0].position} to={hubs[1].position} />
        <DataStream from={hubs[0].position} to={hubs[2].position} />
        <DataStream from={hubs[1].position} to={hubs[2].position} />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-bold text-sm mb-3">AI Ecosystem</h3>
        <div className="space-y-2">
          {hubs.map((hub) => (
            <div key={hub.id} className="flex items-center gap-3 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hub.color }}
              />
              <span className="text-white/70">{hub.label}</span>
              <span className="ml-auto text-cyan-400 font-semibold">{hub.metrics}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}