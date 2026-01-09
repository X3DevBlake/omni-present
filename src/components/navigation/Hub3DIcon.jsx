import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Torus, Float } from '@react-three/drei';

function Icon3D({ icon, color }) {
  const iconShapes = {
    '🏠': (
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </Box>
    ),
    '💰': (
      <Sphere args={[0.7, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.8} />
      </Sphere>
    ),
    '📈': (
      <Torus args={[0.6, 0.2, 16, 100]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Torus>
    ),
    '🎮': (
      <Box args={[0.8, 1, 0.3]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </Box>
    ),
    '🔬': (
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
    ),
    '⚡': (
      <Box args={[0.5, 1, 0.2]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </Box>
    ),
    '🛍️': (
      <Sphere args={[0.6, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
    ),
    '💬': (
      <Box args={[0.9, 0.7, 0.3]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </Box>
    ),
    '👤': (
      <Sphere args={[0.6, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
    )
  };

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      {iconShapes[icon] || (
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </Sphere>
      )}
    </Float>
  );
}

export default function Hub3DIcon({ icon, color }) {
  return (
    <div className="w-12 h-12">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color={color} />
        <Icon3D icon={icon} color={color} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
      </Canvas>
    </div>
  );
}