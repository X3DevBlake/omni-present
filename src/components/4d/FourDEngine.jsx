import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Text, MeshDistortMaterial, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// 4D → 3D projection utility
export function project4Dto3D(x, y, z, w, viewAngle = 0) {
  const cosA = Math.cos(viewAngle);
  const sinA = Math.sin(viewAngle);
  const rw = cosA * w - sinA * z;
  const rz = sinA * w + cosA * z;
  const perspective = 2 / (2 + rw);
  return [x * perspective, y * perspective, rz * perspective];
}

// Generate 4D hypercube (tesseract) vertices
export function generateTesseract(size = 1) {
  const vertices4D = [];
  for (let i = 0; i < 16; i++) {
    vertices4D.push([
      ((i & 1) ? 1 : -1) * size,
      ((i & 2) ? 1 : -1) * size,
      ((i & 4) ? 1 : -1) * size,
      ((i & 8) ? 1 : -1) * size,
    ]);
  }
  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) {
        if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
      }
      if (diff === 1) edges.push([i, j]);
    }
  }
  return { vertices4D, edges };
}

// Rotating Tesseract Component
export function Tesseract({ size = 1, color = '#a855f7', wireColor = '#22d3ee', speed = 0.3 }) {
  const groupRef = useRef();
  const { vertices4D, edges } = useMemo(() => generateTesseract(size), [size]);
  const [angle, setAngle] = useState(0);

  useFrame((_, delta) => {
    setAngle(prev => prev + delta * speed);
  });

  const projected = useMemo(() => {
    return vertices4D.map(([x, y, z, w]) => project4Dto3D(x, y, z, w, angle));
  }, [vertices4D, angle]);

  const lineSegments = useMemo(() => {
    return edges.map(([i, j]) => [
      new THREE.Vector3(...projected[i]),
      new THREE.Vector3(...projected[j]),
    ]);
  }, [edges, projected]);

  return (
    <group ref={groupRef}>
      {/* Vertices */}
      {projected.map((pos, i) => (
        <mesh key={`v-${i}`} position={pos}>
          <sphereGeometry args={[0.04 * size, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Edges */}
      {lineSegments.map((points, i) => (
        <line key={`e-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...points[0].toArray(), ...points[1].toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={wireColor} transparent opacity={0.6} />
        </line>
      ))}
    </group>
  );
}

// 4D Data Point visualization
export function FourDDataPoint({ position4D, color = '#22d3ee', label, value, viewAngle = 0 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const pos3D = useMemo(() => project4Dto3D(...position4D, viewAngle), [position4D, viewAngle]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      const targetScale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={pos3D}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3 : 1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {hovered && label && (
        <Text position={[0, 0.2, 0]} fontSize={0.08} color="white" anchorX="center">
          {label}: {value}
        </Text>
      )}
    </group>
  );
}

// 4D Graph Axis
export function FourDAxes({ size = 2, viewAngle = 0 }) {
  const axes = [
    { dir: [1, 0, 0, 0], color: '#ef4444', label: 'X' },
    { dir: [0, 1, 0, 0], color: '#22c55e', label: 'Y' },
    { dir: [0, 0, 1, 0], color: '#3b82f6', label: 'Z' },
    { dir: [0, 0, 0, 1], color: '#a855f7', label: 'W' },
  ];

  return (
    <group>
      {axes.map(({ dir, color, label }) => {
        const end = project4Dto3D(dir[0] * size, dir[1] * size, dir[2] * size, dir[3] * size, viewAngle);
        const origin = [0, 0, 0];
        return (
          <group key={label}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([...origin, ...end])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={color} />
            </line>
            <Text position={end} fontSize={0.12} color={color} anchorX="center">
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// Particle Field with 4D projection
export function FourDParticleField({ count = 500, radius = 3, speed = 0.2 }) {
  const particles = useRef();
  const [angle, setAngle] = useState(0);

  const positions4D = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push([
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * radius * 2,
      ]);
    }
    return arr;
  }, [count, radius]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      arr[i * 3] = 0.4 + t * 0.6;
      arr[i * 3 + 1] = 0.2 + Math.sin(t * Math.PI) * 0.6;
      arr[i * 3 + 2] = 0.9 - t * 0.4;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    setAngle(prev => prev + delta * speed);
    if (particles.current) {
      const posArray = particles.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const [x, y, z, w] = positions4D[i];
        const [px, py, pz] = project4Dto3D(x, y, z, w, angle);
        posArray[i * 3] = px;
        posArray[i * 3 + 1] = py;
        posArray[i * 3 + 2] = pz;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y, z, w] = positions4D[i];
      const [px, py, pz] = project4Dto3D(x, y, z, w, 0);
      arr[i * 3] = px;
      arr[i * 3 + 1] = py;
      arr[i * 3 + 2] = pz;
    }
    return arr;
  }, [positions4D, count]);

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={initialPositions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Main 4D Canvas wrapper
export function FourDCanvas({ children, className = '', showStars = true, cameraPosition = [0, 0, 5] }) {
  return (
    <Canvas
      className={className}
      camera={{ position: cameraPosition, fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#22d3ee" />
      <pointLight position={[0, 10, -10]} intensity={0.3} color="#ec4899" />
      {showStars && <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />}
      <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.5} />
      {children}
    </Canvas>
  );
}

export default { FourDCanvas, Tesseract, FourDDataPoint, FourDAxes, FourDParticleField, project4Dto3D, generateTesseract };
