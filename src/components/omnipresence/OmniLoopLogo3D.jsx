import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedLoop({ radius = 1.2, tubeRadius = 0.08, color = '#00f5ff', delay = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.3;
      ref.current.rotation.y = state.clock.elapsedTime * 0.8 + delay;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tubeRadius, 32, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function InfinityLoop() {
  const groupRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  // Create infinity shape points
  const infinityPoints = [];
  for (let t = 0; t <= Math.PI * 2; t += 0.05) {
    const scale = 2 / (3 - Math.cos(2 * t));
    infinityPoints.push(
      new THREE.Vector3(
        scale * Math.cos(t) * 1.5,
        scale * Math.sin(2 * t) / 2 * 0.8,
        0
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(infinityPoints, true);

  return (
    <group ref={groupRef}>
      {/* Main infinity loop */}
      <mesh>
        <tubeGeometry args={[curve, 200, 0.12, 32, true]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <tubeGeometry args={[curve, 200, 0.2, 16, true]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} />
      </mesh>

      {/* Inner energy core */}
      <mesh>
        <tubeGeometry args={[curve, 200, 0.06, 16, true]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Orbiting particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 30 }).map((_, i) => {
          const t = (i / 30) * Math.PI * 2;
          const scale = 2 / (3 - Math.cos(2 * t));
          return (
            <Float key={i} speed={3} rotationIntensity={0}>
              <Sphere
                args={[0.04, 8, 8]}
                position={[
                  scale * Math.cos(t) * 1.5 + (Math.random() - 0.5) * 0.3,
                  scale * Math.sin(2 * t) / 2 * 0.8 + (Math.random() - 0.5) * 0.3,
                  (Math.random() - 0.5) * 0.5
                ]}
              >
                <meshBasicMaterial color={i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#00f5ff'} />
              </Sphere>
            </Float>
          );
        })}
      </group>
    </group>
  );
}

function BackgroundRings() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {[2.5, 3, 3.5].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.02, 16, 64]} />
          <meshBasicMaterial color={['#00f5ff', '#a855f7', '#ec4899'][i]} transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function EnergyCore() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.15);
    }
  });

  return (
    <Sphere ref={ref} args={[0.2, 32, 32]}>
      <meshStandardMaterial
        color="#ffffff"
        emissive="#00f5ff"
        emissiveIntensity={2}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
}

export default function OmniLoopLogo3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={1} color="#a855f7" />
        <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} color="#ec4899" />

        <InfinityLoop />
        <EnergyCore />
        <BackgroundRings />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}