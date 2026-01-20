import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

function WeatherCloud({ position, conditions, intensity }) {
  const cloudRef = useRef();

  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      cloudRef.current.rotation.y += 0.005;
    }
  });

  const cloudColor = conditions === 'stormy' ? '#475569' :
                     conditions === 'rainy' ? '#64748b' :
                     conditions === 'cloudy' ? '#94a3b8' : '#cbd5e1';

  return (
    <group ref={cloudRef} position={position}>
      {[...Array(5)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.3 + Math.random() * 0.2, 16, 16]}
          position={[
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.5
          ]}
        >
          <meshStandardMaterial
            color={cloudColor}
            transparent
            opacity={0.6}
            roughness={0.9}
          />
        </Sphere>
      ))}
    </group>
  );
}

function RainParticles({ position, intensity }) {
  const particles = useMemo(() => {
    const count = Math.floor(intensity * 50);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, [intensity]);

  const particlesRef = useRef();

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 3;
        }
      }
      particlesRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute
          ref={particlesRef}
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#60a5fa" transparent opacity={0.6} />
    </points>
  );
}

function WeatherRegion({ weatherState, position }) {
  const conditions = weatherState.environmental_data?.conditions || 'clear';
  const temp = weatherState.environmental_data?.temperature || 20;
  const humidity = weatherState.environmental_data?.humidity || 50;

  const isRaining = conditions === 'rainy' || conditions === 'stormy';
  const intensity = humidity / 100;

  return (
    <group position={position}>
      {/* Region Label */}
      <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center">
        {weatherState.region_name}
      </Text>

      {/* Temperature Indicator */}
      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#fbbf24" anchorX="center">
        {temp}°C
      </Text>

      {/* Weather Visualization */}
      {(conditions === 'cloudy' || conditions === 'rainy' || conditions === 'stormy') && (
        <WeatherCloud position={[0, 0.5, 0]} conditions={conditions} intensity={intensity} />
      )}

      {isRaining && <RainParticles position={[0, 0, 0]} intensity={intensity} />}

      {conditions === 'clear' && (
        <Sphere args={[0.4, 16, 16]} position={[0, 0.8, 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </Sphere>
      )}

      {conditions === 'snowy' && (
        <>
          {[...Array(30)].map((_, i) => (
            <Sphere
              key={i}
              args={[0.03, 8, 8]}
              position={[
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
              ]}
            >
              <meshStandardMaterial color="white" />
            </Sphere>
          ))}
        </>
      )}
    </group>
  );
}

export default function DynamicWeatherSystem3D({ weatherStates }) {
  const positions = [
    [-4, 0, 0],
    [-2, 0, 2],
    [0, 0, -2],
    [2, 0, 2],
    [4, 0, 0],
    [0, 0, 3]
  ];

  return (
    <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" opacity={0.8} transparent />
      </mesh>

      {/* Weather Regions */}
      {weatherStates.slice(0, 6).map((state, idx) => (
        <WeatherRegion
          key={state.id}
          weatherState={state}
          position={positions[idx] || [0, 0, 0]}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
      />
    </Canvas>
  );
}