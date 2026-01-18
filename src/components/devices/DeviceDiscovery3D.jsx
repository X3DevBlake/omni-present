import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function DiscoveryScene() {
  const devicesRef = useRef([]);

  useEffect(() => {
    const devices = [
      { x: -8, y: 5, z: 0, type: 'phone', color: '#3b82f6' },
      { x: 8, y: 5, z: 0, type: 'laptop', color: '#8b5cf6' },
      { x: 0, y: 8, z: 5, type: 'tablet', color: '#06b6d4' },
      { x: -5, y: -3, z: -5, type: 'watch', color: '#ec4899' },
      { x: 5, y: -3, z: -5, type: 'speaker', color: '#f59e0b' },
      { x: 0, y: -6, z: 0, type: 'hub', color: '#10b981' },
    ];

    devices.forEach((dev, idx) => {
      const geometry = new THREE.IcosahedronGeometry(0.8, 4);
      const material = new THREE.MeshPhongMaterial({
        color: dev.color,
        emissive: dev.color,
        emissiveIntensity: 0.4,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(dev.x, dev.y, dev.z);
      mesh.userData = { type: dev.type, color: dev.color, pulseOffset: idx };
      devicesRef.current.push(mesh);
    });
  }, []);

  useFrame(() => {
    devicesRef.current.forEach((device) => {
      device.scale.set(
        1 + Math.sin(Date.now() * 0.003 + device.userData.pulseOffset * 0.5) * 0.15,
        1 + Math.sin(Date.now() * 0.003 + device.userData.pulseOffset * 0.5) * 0.15,
        1 + Math.sin(Date.now() * 0.003 + device.userData.pulseOffset * 0.5) * 0.15
      );
      device.rotation.x += 0.005;
      device.rotation.y += 0.008;
    });
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1.5} />
      <ambientLight intensity={0.6} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, 20]} intensity={0.8} color="#ff6b6b" />

      {devicesRef.current.map((device, idx) => (
        <primitive key={idx} object={device} />
      ))}

      {/* Central hub glow */}
      <mesh position={[0, -6, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial transparent opacity={0.1} color="#10b981" />
      </mesh>
    </>
  );
}

export default function DeviceDiscovery3D() {
  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
      <DiscoveryScene />
    </Canvas>
  );
}