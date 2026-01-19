import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function BankingHubTransition() {
  const streamRef = useRef();
  const vaultRef = useRef();

  const dataParticles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          -20 - Math.random() * 20
        ],
        speed: 0.5 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? '#3b82f6' : '#00f5ff'
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (streamRef.current) {
      streamRef.current.children.forEach((particle, i) => {
        particle.position.z += dataParticles[i].speed;
        if (particle.position.z > 5) {
          particle.position.z = -40;
        }
      });
    }

    if (vaultRef.current) {
      vaultRef.current.rotation.y += 0.02;
      vaultRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={2} color="#3b82f6" />

      {/* Data Stream Particles */}
      <group ref={streamRef}>
        {dataParticles.map((particle, i) => (
          <mesh key={i} position={particle.position}>
            <boxGeometry args={[0.1, 0.1, 0.5]} />
            <meshBasicMaterial color={particle.color} />
          </mesh>
        ))}
      </group>

      {/* Vault Sphere */}
      <Sphere ref={vaultRef} args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.9}
          roughness={0.1}
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.1, 16, 100]} />
        <meshBasicMaterial color="#00f5ff" />
      </mesh>
    </>
  );
}