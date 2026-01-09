import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, Torus, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function SpaceIcon({ color }) {
  const groupRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    
    const rotation = setInterval(() => {
      if (groupRef.current) {
        groupRef.current.rotation.x += 0.005;
        groupRef.current.rotation.y += 0.008;
      }
      if (particlesRef.current) {
        particlesRef.current.rotation.z += 0.001;
      }
    }, 30);
    return () => clearInterval(rotation);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Core sphere with glow */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.3}>
        <Sphere args={[0.8, 64, 64]} scale={1}>
          <meshPhongMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            shininess={100}
            wireframe={false}
          />
        </Sphere>
        
        {/* Inner pulsing core */}
        <Sphere args={[0.5, 32, 32]} scale={0.6}>
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </Sphere>
      </Float>

      {/* Orbital rings */}
      <group>
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
          <Torus
            key={i}
            args={[1.2, 0.06, 32, 16]}
            rotation={[angle, i * Math.PI / 3, angle]}
            scale={0.8}
          >
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </Torus>
        ))}
      </group>

      {/* Data stream particles */}
      <group ref={particlesRef}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.cos(i / 6) * 0.5;
          
          return (
            <Sphere key={i} args={[0.08, 16, 16]} position={[x, y, z]}>
              <meshPhongMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
              />
            </Sphere>
          );
        })}
      </group>

      {/* Connecting energy lines */}
      {[...Array(6)].map((_, i) => {
        const points = [];
        for (let j = 0; j <= 20; j++) {
          const t = j / 20;
          const angle = (i / 6) * Math.PI * 2 + t * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(angle) * 1.5,
              Math.sin(t * Math.PI) * 0.8 - 0.2,
              Math.sin(angle) * 1.5
            )
          );
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(points);
        
        return (
          <line key={`line-${i}`}>
            <bufferGeometry {...geometry} />
            <lineBasicMaterial color={color} linewidth={1.5} transparent opacity={0.5} />
          </line>
        );
      })}
    </group>
  );
}

export default function Rotating3DIcon({ icon, color = '#00f5ff', size = 120 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', background: 'radial-gradient(circle at 30% 30%, rgba(0,245,255,0.1), transparent)' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ borderRadius: '8px' }}>
        <ambientLight intensity={0.8} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={2} color={color} />
        <pointLight position={[-10, -10, -10]} intensity={1} color={color} distance={50} />
        <SpaceIcon color={color} />
      </Canvas>
      
      {/* Icon overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.35,
          zIndex: 10,
          pointerEvents: 'none',
          textShadow: `0 0 ${size * 0.2}px ${color}80`
        }}
      >
        {icon}
      </div>
    </div>
  );
}