import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

function BrainGeometry() {
  const groupRef = useRef(null);
  const linesRef = useRef(null);

  useEffect(() => {
    const rotation = setInterval(() => {
      if (groupRef.current) {
        groupRef.current.rotation.x += 0.003;
        groupRef.current.rotation.y += 0.005;
      }
      if (linesRef.current) {
        linesRef.current.rotation.z += 0.001;
      }
    }, 50);
    return () => clearInterval(rotation);
  }, []);

  return (
    <>
      <group ref={groupRef}>
        {/* Main brain hemispheres */}
        <group position={[-0.5, 0, 0]}>
          <Sphere args={[0.6, 32, 32]} scale={[1, 1.2, 0.9]}>
            <meshPhongMaterial
              color="#a855f7"
              emissive="#7c3aed"
              emissiveIntensity={0.8}
              shininess={100}
            />
          </Sphere>
          <Sphere args={[0.55, 32, 32]} scale={[1, 1.15, 0.85]} position={[0, -0.1, 0]}>
            <meshBasicMaterial color="#c084fc" wireframe />
          </Sphere>
        </group>

        <group position={[0.5, 0, 0]}>
          <Sphere args={[0.6, 32, 32]} scale={[1, 1.2, 0.9]}>
            <meshPhongMaterial
              color="#a855f7"
              emissive="#7c3aed"
              emissiveIntensity={0.8}
              shininess={100}
            />
          </Sphere>
          <Sphere args={[0.55, 32, 32]} scale={[1, 1.15, 0.85]} position={[0, -0.1, 0]}>
            <meshBasicMaterial color="#c084fc" wireframe />
          </Sphere>
        </group>

        {/* Connecting neural networks */}
        <group>
          {[...Array(6)].map((_, i) => (
            <Torus
              key={i}
              args={[0.8, 0.08, 32, 16]}
              rotation={[i * Math.PI / 6, 0, i * Math.PI / 4]}
              scale={0.5}
            >
              <meshBasicMaterial color="#ec4899" wireframe />
            </Torus>
          ))}
        </group>

        {/* Neural nodes */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <Sphere key={i} args={[0.12, 16, 16]} position={[x, Math.sin(i) * 0.3, z]}>
              <meshPhongMaterial color="#06b6d4" emissive="#00f5ff" emissiveIntensity={1} />
            </Sphere>
          );
        })}
      </group>

      {/* Rotating data streams */}
      <group ref={linesRef}>
        {[...Array(8)].map((_, i) => {
          const geometry = new THREE.BufferGeometry();
          const points = [];
          for (let j = 0; j < 20; j++) {
            const angle = (j / 20) * Math.PI * 2 + (i / 8) * Math.PI * 2;
            points.push(
              new THREE.Vector3(
                Math.cos(angle) * 2,
                Math.sin(angle * 2) * 0.5,
                Math.sin(angle) * 2
              )
            );
          }
          geometry.setFromPoints(points);
          return (
            <line key={i}>
              <bufferGeometry {...geometry} />
              <lineBasicMaterial color="#00f5ff" linewidth={2} transparent opacity={0.6} />
            </line>
          );
        })}
      </group>
    </>
  );
}

export default function AI3DBrain() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={1} color="#ffffff" />
        <pointLight position={[5, 5, 5]} intensity={2} color="#a855f7" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#06b6d4" />
        <BrainGeometry />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}