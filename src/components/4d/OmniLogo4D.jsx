import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Trail, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { project4Dto3D } from './FourDEngine';

// 4D Infinity Knot - the Omni-Present logo in 4D
function InfinityKnot4D({ color = '#a855f7', speed = 0.4 }) {
  const knotRef = useRef();
  const trailRef = useRef();
  const [angle, setAngle] = React.useState(0);

  // Generate 4D knot points
  const knotPoints4D = useMemo(() => {
    const pts = [];
    for (let t = 0; t < Math.PI * 2; t += 0.05) {
      pts.push([
        Math.sin(t) * 1.2,
        Math.sin(2 * t) * 0.6,
        Math.cos(t) * 0.8,
        Math.sin(3 * t) * 0.5, // 4th dimension modulation
      ]);
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    setAngle(prev => prev + delta * speed);
    if (knotRef.current) {
      knotRef.current.rotation.z = Math.sin(angle * 0.5) * 0.1;
    }
  });

  const projected = useMemo(() => {
    return knotPoints4D.map(([x, y, z, w]) => {
      const [px, py, pz] = project4Dto3D(x, y, z, w, angle);
      return new THREE.Vector3(px, py, pz);
    });
  }, [knotPoints4D, angle]);

  const linePositions = useMemo(() => {
    return new Float32Array(projected.flatMap(v => [v.x, v.y, v.z]));
  }, [projected]);

  return (
    <group ref={knotRef}>
      {/* Main infinity curve */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={projected.length}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.8} linewidth={2} />
      </line>

      {/* Glow trail points */}
      {projected.filter((_, i) => i % 5 === 0).map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Core distorted sphere */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.25, 32, 32]} />
          <MeshDistortMaterial
            color="#0a0a1a"
            emissive={color}
            emissiveIntensity={0.5}
            distort={0.3}
            speed={3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      <Sparkles count={40} scale={3} size={2} speed={0.4} color={color} />
    </group>
  );
}

// Orbiting ring in 4D
function OrbitalRing4D({ radius = 1, color = '#22d3ee', speed = 1, tilt = 0 }) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * speed;
      ringRef.current.rotation.x += delta * speed * 0.3;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.5} />
    </mesh>
  );
}

// Main 4D Logo component
export default function OmniLogo4D({ scale = 1 }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <InfinityKnot4D color="#a855f7" speed={0.4} />
      <OrbitalRing4D radius={1.6} color="#22d3ee" speed={0.6} tilt={Math.PI * 0.15} />
      <OrbitalRing4D radius={1.9} color="#ec4899" speed={-0.4} tilt={Math.PI * 0.35} />
      <OrbitalRing4D radius={2.2} color="#a855f7" speed={0.3} tilt={Math.PI * 0.55} />

      {/* Brand text */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        OMNI-PRESENT
      </Text>
      <Text
        position={[0, -2.1, 0]}
        fontSize={0.08}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        4D INTELLIGENCE ECOSYSTEM
      </Text>

      {/* Point lights for glow */}
      <pointLight position={[2, 0, 0]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-2, 0, 0]} intensity={0.5} color="#22d3ee" />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#ec4899" />
    </group>
  );
}
