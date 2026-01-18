import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';

function DeviceModel() {
  const deviceRef = useRef();

  useFrame(() => {
    if (deviceRef.current) {
      deviceRef.current.rotation.y += 0.005;
      deviceRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={2} />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#ff00ff" />

      <group ref={deviceRef}>
        {/* Phone body */}
        <Box args={[2, 4, 0.2]} position={[0, 0, 0]}>
          <meshPhongMaterial color="#1a1a2e" />
        </Box>

        {/* Screen */}
        <Box args={[1.8, 3.8, 0.05]} position={[0, 0, 0.12]}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            metalness={0.8}
          />
        </Box>

        {/* Camera */}
        <Cylinder args={[0.25, 0.25, 0.1]} rotation={[0, 0, 0]} position={[0.7, 1.5, 0.15]}>
          <meshPhongMaterial color="#333333" />
        </Cylinder>

        {/* Status indicator */}
        <Sphere args={[0.15, 16, 16]} position={[-0.8, 1.8, 0.2]}>
          <meshPhongMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.8}
          />
        </Sphere>
      </group>
    </>
  );
}

export default function DigitalTwin3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <DeviceModel />
    </Canvas>
  );
}