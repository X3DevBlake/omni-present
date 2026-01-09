import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';

function Heart() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh>
        <tetrahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} distort={0.3} speed={2} />
      </mesh>
    </Float>
  );
}

function Shield() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh>
        <boxGeometry args={[1.5, 2, 0.3]} />
        <MeshDistortMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} distort={0.2} speed={2} />
      </mesh>
    </Float>
  );
}

function Humans() {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[-1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.5]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-1, 0.9, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.5]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[1, 0.9, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>
      </Float>
    </group>
  );
}

export function GuidelineIcon3D({ type = 'heart' }) {
  const getComponent = () => {
    switch (type) {
      case 'heart':
        return <Heart />;
      case 'shield':
        return <Shield />;
      case 'humans':
        return <Humans />;
      default:
        return <Heart />;
    }
  };

  return (
    <div className="h-48 w-48 mx-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        {getComponent()}
        <OrbitControls autoRotate autoRotateSpeed={6} enableZoom={false} />
      </Canvas>
    </div>
  );
}