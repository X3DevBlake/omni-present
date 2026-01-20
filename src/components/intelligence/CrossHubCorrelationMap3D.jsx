import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function HubNode({ hub, position }) {
  const nodeRef = useRef();

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.01;
    }
  });

  const hubColors = {
    'agents': '#10b981',
    'simulations': '#3b82f6',
    'finance': '#f59e0b',
    'devices': '#22d3ee',
    'analytics': '#8b5cf6',
    'world': '#ec4899'
  };

  const color = hubColors[hub.toLowerCase()] || '#6366f1';

  return (
    <group position={position}>
      <RoundedBox ref={nodeRef} args={[0.8, 0.8, 0.8]} radius={0.1}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {hub}
      </Text>
    </group>
  );
}

function CorrelationBeam({ from, to, strength }) {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2 * strength;
    }
  });

  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={beamRef} geometry={lineGeometry}>
      <lineBasicMaterial
        color={new THREE.Color().setHSL(strength * 0.3, 1, 0.5)}
        linewidth={strength * 5}
        transparent
        opacity={0.5}
      />
    </line>
  );
}

export default function CrossHubCorrelationMap3D({ insights }) {
  const uniqueHubs = React.useMemo(() => {
    const hubsSet = new Set();
    insights.forEach(insight => {
      insight.connected_hubs?.forEach(hub => hubsSet.add(hub));
    });
    return Array.from(hubsSet);
  }, [insights]);

  const hubPositions = React.useMemo(() => {
    const positions = {};
    uniqueHubs.forEach((hub, idx) => {
      const angle = (idx / uniqueHubs.length) * Math.PI * 2;
      const radius = 4;
      positions[hub] = [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    });
    return positions;
  }, [uniqueHubs]);

  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      {/* Hub Nodes */}
      {uniqueHubs.map(hub => (
        <HubNode
          key={hub}
          hub={hub}
          position={hubPositions[hub]}
        />
      ))}

      {/* Correlation Beams */}
      {insights.map((insight, idx) => {
        if (insight.connected_hubs?.length >= 2) {
          const fromHub = insight.connected_hubs[0];
          const toHub = insight.connected_hubs[1];
          if (hubPositions[fromHub] && hubPositions[toHub]) {
            return (
              <CorrelationBeam
                key={idx}
                from={hubPositions[fromHub]}
                to={hubPositions[toHub]}
                strength={insight.correlation_strength || 0.5}
              />
            );
          }
        }
        return null;
      })}

      {/* Central Network Core */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center">
        Cross-Hub Intelligence
      </Text>

      <OrbitControls
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
      />
    </Canvas>
  );
}