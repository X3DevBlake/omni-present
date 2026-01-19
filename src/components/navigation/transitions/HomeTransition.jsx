import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

export default function HomeTransition() {
  const coreRef = useRef();
  const ringsRef = useRef();

  const orbitingElements = useMemo(() => {
    const elements = [];
    for (let i = 0; i < 5; i++) {
      elements.push({
        radius: 3 + i * 1.5,
        speed: 0.5 + i * 0.2,
        color: new THREE.Color().setHSL(i / 5, 0.8, 0.6),
        size: 0.3 - i * 0.04
      });
    }
    return elements;
  }, []);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.01;
      ringsRef.current.rotation.x += 0.005;
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00f5ff" />

      {/* Central Core */}
      <Sphere ref={coreRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Expanding Rings */}
      <group ref={ringsRef}>
        {orbitingElements.map((element, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.5]}>
            <torusGeometry args={[element.radius, 0.05, 16, 100]} />
            <meshBasicMaterial color={element.color} opacity={0.6} transparent />
          </mesh>
        ))}
      </group>

      {/* Orbiting Particles */}
      {orbitingElements.map((element, i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            Math.cos(Date.now() * 0.001 * element.speed) * element.radius,
            0,
            Math.sin(Date.now() * 0.001 * element.speed) * element.radius
          ]}
        >
          <sphereGeometry args={[element.size, 16, 16]} />
          <meshBasicMaterial color={element.color} />
        </mesh>
      ))}
    </>
  );
}