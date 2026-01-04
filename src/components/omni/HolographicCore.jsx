import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CoreGeometry() {
  const groupRef = useRef();
  const innerRef = useRef();
  const middleRef = useRef();
  const outerRef = useRef();
  const particlesRef = useRef();

  // Create particle positions
  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 1.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
    
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.5;
      innerRef.current.rotation.z = t * 0.3;
    }
    
    if (middleRef.current) {
      middleRef.current.rotation.x = -t * 0.3;
      middleRef.current.rotation.y = t * 0.2;
    }
    
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.15;
      outerRef.current.rotation.x = t * 0.1;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.8} />
      </mesh>
      
      {/* Inner core glow */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.2} />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRef}>
        <torusGeometry args={[0.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.9} />
      </mesh>

      {/* Middle ring */}
      <mesh ref={middleRef}>
        <torusGeometry args={[1.2, 0.015, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRef}>
        <torusGeometry args={[1.6, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.6} />
      </mesh>

      {/* Vertical rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.01, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>

      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[1.4, 0.008, 16, 100]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.4} />
      </mesh>

      {/* Floating particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#00f5ff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Data streams */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <DataStream key={i} index={i} />
      ))}
    </group>
  );
}

function DataStream({ index }) {
  const ref = useRef();
  const angle = (index / 6) * Math.PI * 2;
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const scale = 0.5 + Math.sin(t * 2 + index) * 0.3;
      ref.current.scale.y = scale;
      ref.current.position.y = Math.sin(t * 3 + index * 0.5) * 0.2;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]}
      rotation={[0, -angle, 0]}
    >
      <boxGeometry args={[0.02, 0.4, 0.02]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
    </mesh>
  );
}

export default function HolographicCore({ className = "" }) {
  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <CoreGeometry />
      </Canvas>
    </div>
  );
}