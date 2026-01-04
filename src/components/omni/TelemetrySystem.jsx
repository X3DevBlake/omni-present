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

// Animated network traffic lines
export function NetworkTrafficLine({ start, end, speed, color }) {
  const lineRef = React.useRef();
  const particleRef = React.useRef();

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.getElapsedTime() * speed) % 1;
      particleRef.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        t
      );
    }
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
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
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