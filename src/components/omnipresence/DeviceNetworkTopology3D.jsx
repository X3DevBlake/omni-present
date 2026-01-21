import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function DeviceNode({ device, position, connections }) {
  const ref = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  const typeColors = {
    holographic_projector: '#00f5ff',
    robotic_arm: '#a855f7',
    smart_light: '#f59e0b',
    smart_thermostat: '#ef4444',
    smart_lock: '#10b981'
  };

  return (
    <group position={position}>
      <Sphere
        ref={ref}
        args={[0.3, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={typeColors[device.device_type] || '#ffffff'}
          emissive={typeColors[device.device_type] || '#ffffff'}
          emissiveIntensity={device.connection_status === 'connected' ? 0.7 : 0.2}
        />
      </Sphere>

      {device.connection_status === 'connected' && (
        <Sphere args={[0.45, 16, 16]}>
          <meshBasicMaterial
            color={typeColors[device.device_type] || '#ffffff'}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {device.device_name?.slice(0, 12)}
      </Text>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded text-xs min-w-40">
            <p className="font-bold text-cyan-400">{device.device_name}</p>
            <p className="text-white/70">Type: {device.device_type}</p>
            <p className="text-white/70">API: {device.api_provider}</p>
            <Badge className={device.connection_status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {device.connection_status}
            </Badge>
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectionLine({ from, to, active }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  return (
    <Line
      points={points}
      color={active ? '#00ff88' : '#666666'}
      lineWidth={2}
      transparent
      opacity={active ? 0.6 : 0.2}
    />
  );
}

export default function DeviceNetworkTopology3D({ devices = [] }) {
  const positions = devices.map((_, idx) => {
    const angle = (idx / devices.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      Math.sin(idx * 0.5) * 2,
      Math.sin(angle) * radius
    ];
  });

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />

        <Text
          position={[0, 4, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
        >
          Device Network
        </Text>

        {/* Central Hub */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.8}
          />
        </Sphere>

        {devices.map((device, idx) => (
          <React.Fragment key={device.id}>
            <DeviceNode
              device={device}
              position={positions[idx]}
              connections={devices.length}
            />
            <ConnectionLine
              from={[0, 0, 0]}
              to={positions[idx]}
              active={device.connection_status === 'connected'}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}