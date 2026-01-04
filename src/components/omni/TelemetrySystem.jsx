import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simulated WebSocket telemetry (replace with actual ws connection when backend available)
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState({
    cpuLoad: 45,
    gpuLoad: 78,
    memoryUsage: 62,
    networkTraffic: 340,
    activeWorkflows: 12,
    dataFlowRate: 2.4,
  });

  useEffect(() => {
    // Simulate WebSocket connection
    const interval = setInterval(() => {
      setTelemetry({
        cpuLoad: 30 + Math.random() * 50,
        gpuLoad: 60 + Math.random() * 35,
        memoryUsage: 50 + Math.random() * 30,
        networkTraffic: 200 + Math.random() * 300,
        activeWorkflows: Math.floor(8 + Math.random() * 10),
        dataFlowRate: 1.5 + Math.random() * 2,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return telemetry;
}

// Volumetric pulse effect for telemetry
export function TelemetryPulse({ position, intensity, color }) {
  const meshRef = React.useRef();
  const [scale, setScale] = React.useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      const pulseScale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.3 * intensity;
      meshRef.current.scale.setScalar(pulseScale);
      meshRef.current.material.opacity = 0.1 + (intensity * 0.15);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

// Animated network traffic lines with multiple packets
export function NetworkTrafficLine({ start, end, speed, color, packetCount = 3 }) {
  const particlesRef = React.useRef([]);

  useFrame((state) => {
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const offset = i / packetCount;
        const t = ((state.clock.getElapsedTime() * speed) + offset) % 1;
        particle.position.lerpVectors(
          new THREE.Vector3(...start),
          new THREE.Vector3(...end),
          t
        );
        // Fade in/out at edges
        particle.material.opacity = Math.sin(t * Math.PI) * 0.8;
      }
    });
  });

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...start, ...end])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </line>
      {Array.from({ length: packetCount }).map((_, i) => (
        <mesh key={i} ref={(el) => (particlesRef.current[i] = el)}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Heatmap visualization for component load
export function ComponentHeatmap({ position, size, intensity, color }) {
  const meshRef = React.useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.2 + intensity * 0.8;
      meshRef.current.material.opacity = 0.3 + intensity * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size.map(s => s * 1.05)} />
      <meshStandardMaterial
        color={intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : color}
        transparent
        opacity={0.3}
        emissive={intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Data flow visualization
export function DataFlowStream({ componentIndex, intensity }) {
  const positions = [
    [0, 0, 0], [1.2, 0, 0], [-1.2, 0, 0], 
    [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
  ];

  const connections = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 3], [2, 3], [1, 5], [2, 6]
  ];

  return (
    <group>
      {connections.map((conn, i) => (
        <NetworkTrafficLine
          key={i}
          start={positions[conn[0]]}
          end={positions[conn[1]]}
          speed={0.3 + Math.random() * 0.5}
          color={intensity > 0.7 ? "#ec4899" : intensity > 0.5 ? "#a855f7" : "#00f5ff"}
        />
      ))}
    </group>
  );
}