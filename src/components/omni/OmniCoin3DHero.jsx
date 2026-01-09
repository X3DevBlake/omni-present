import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Torus } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedOmniCoin() {
  const groupRef = useRef();
  const innerSphereRef = useRef();
  const outerRingRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.006;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.x += 0.003;
      innerSphereRef.current.rotation.z += 0.005;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= 0.004;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Main Coin Sphere */}
        <Sphere args={[2, 64, 64]} ref={innerSphereRef}>
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFA500"
            emissiveIntensity={0.8}
            metalness={0.95}
            roughness={0.05}
          />
        </Sphere>

        {/* Golden Glow */}
        <Sphere args={[2.1, 32, 32]}>
          <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
        </Sphere>

        {/* Rotating Ring 1 */}
        <Torus args={[2.5, 0.15, 32, 128]} ref={outerRingRef}>
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.7}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>

        {/* Rotating Ring 2 */}
        <Torus args={[3, 0.1, 32, 128]} rotation={[Math.PI / 4, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>

        {/* Rotating Ring 3 */}
        <Torus args={[3.5, 0.08, 32, 128]} rotation={[0, Math.PI / 3, 0]}>
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Torus>

        {/* Orbiting particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <Float key={i} speed={1} rotationIntensity={0}>
              <mesh position={[Math.cos(angle) * 4.5, Math.sin(angle * 0.5) * 1, Math.sin(angle) * 4.5]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color="#00f5ff"
                  emissive="#00f5ff"
                  emissiveIntensity={0.8}
                />
              </mesh>
            </Float>
          );
        })}
      </group>
    </Float>
  );
}

export default function OmniCoin3DHero() {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-black/40 to-black/20 rounded-2xl overflow-hidden border border-yellow-500/30 mb-12">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00f5ff" />
        <pointLight position={[0, 10, 0]} intensity={1.2} color="#a855f7" />

        <AnimatedOmniCoin />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} enablePan={false} />
      </Canvas>

      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <h3 className="text-white font-bold text-2xl mb-2">Omni Token</h3>
        <p className="text-yellow-400/80 text-sm">The future of decentralized banking</p>
      </div>
    </div>
  );
}