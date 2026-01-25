import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

const InfinityRing = ({ color, offset, scale, speed }) => {
  const meshRef = useRef();
  const trailRef = useRef();
  
  const curve = useMemo(() => {
    const points = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
      const x = Math.sin(t) * 2;
      const y = Math.sin(t * 2) * 0.8;
      const z = Math.cos(t) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = ((state.clock.elapsedTime * speed + offset) % 1);
      const position = curve.getPointAt(t);
      meshRef.current.position.copy(position.multiplyScalar(scale));
    }
  });

  return (
    <Trail
      width={0.3}
      length={8}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
    </Trail>
  );
};

const InfinityPath = () => {
  const groupRef = useRef();
  
  const geometry = useMemo(() => {
    const points = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.02) {
      const x = Math.sin(t) * 2;
      const y = Math.sin(t * 2) * 0.8;
      const z = Math.cos(t) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main infinity path */}
      <line geometry={geometry}>
        <lineBasicMaterial color="#c084fc" transparent opacity={0.5} linewidth={2} />
      </line>
      
      {/* Glowing tube around infinity */}
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(
            Array.from({ length: 100 }, (_, i) => {
              const t = (i / 99) * Math.PI * 2;
              return new THREE.Vector3(
                Math.sin(t) * 2,
                Math.sin(t * 2) * 0.8,
                Math.cos(t) * 0.5
              );
            }),
            true
          ),
          100, 0.03, 8, true
        ]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Orbiting particles */}
      <InfinityRing color="#ec4899" offset={0} scale={1} speed={0.3} />
      <InfinityRing color="#22d3ee" offset={0.33} scale={1} speed={0.3} />
      <InfinityRing color="#c084fc" offset={0.66} scale={1} speed={0.3} />
      
      {/* Core sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <MeshDistortMaterial
            color="#8b5cf6"
            emissive="#ec4899"
            emissiveIntensity={0.8}
            distort={0.3}
            speed={3}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Outer glow rings */}
      {[1.5, 2, 2.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, 0, i * 0.5]}>
          <torusGeometry args={[radius, 0.01, 8, 64]} />
          <meshBasicMaterial 
            color={i === 0 ? '#c084fc' : i === 1 ? '#ec4899' : '#22d3ee'} 
            transparent 
            opacity={0.3 - i * 0.08} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default function OmniPresentInfinityLogo3D({ size = 200 }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl" />
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} color="#c084fc" intensity={2} />
        <pointLight position={[-5, -5, -5]} color="#ec4899" intensity={1.5} />
        <pointLight position={[0, 5, 0]} color="#22d3ee" intensity={1} />
        
        <InfinityPath />
      </Canvas>
    </div>
  );
}