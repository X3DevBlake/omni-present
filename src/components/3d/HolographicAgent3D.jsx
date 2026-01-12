import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

export default function HolographicAgent3D({ agent, position }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animated floating and glowing effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  const color = agent.hologram_color || '#00FFFF';

  return (
    <group position={position}>
      {/* Outer Glow */}
      <Sphere ref={glowRef} args={[1.5, 32, 32]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main Agent Body - Holographic Appearance */}
      <Sphere 
        ref={meshRef}
        args={[1, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhongMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          wireframe
        />
      </Sphere>

      {/* Status Indicator */}
      {agent.status === 'communicating' && (
        <Cone args={[0.3, 0.6, 8]} position={[0, 2, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#39FF14" 
            emissive="#39FF14"
            emissiveIntensity={1}
          />
        </Cone>
      )}

      {/* Info Label */}
      <Html
        position={[0, 2.5, 0]}
        center
        distanceFactor={10}
        style={{
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.2s',
          pointerEvents: 'none'
        }}
      >
        <div className="bg-black/80 backdrop-blur-sm border border-cyan-400/50 rounded px-3 py-2 text-center">
          <p className="text-cyan-400 font-bold text-sm whitespace-nowrap">{agent.name}</p>
          <p className="text-white/60 text-xs">{agent.status}</p>
        </div>
      </Html>

      {/* Ground Connection Line */}
      <mesh position={[0, -position[1] / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, position[1], 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}