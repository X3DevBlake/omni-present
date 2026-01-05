import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DynamicEnvironmentSystem({ children, weatherType = 'clear', timeOfDay = 0.5, onEnvironmentChange }) {
  const fogRef = useRef();
  const rainParticlesRef = useRef();
  const snowParticlesRef = useRef();

  useFrame((state, delta) => {
    // Day/night cycle lighting
    const sunIntensity = Math.max(0.2, Math.sin(timeOfDay * Math.PI * 2));
    const sunColor = new THREE.Color().setHSL(0.1, 0.5, 0.3 + sunIntensity * 0.4);
    
    if (state.scene.getObjectByName('mainLight')) {
      const light = state.scene.getObjectByName('mainLight');
      light.intensity = sunIntensity;
      light.color = sunColor;
    }

    // Weather effects
    if (weatherType === 'rain' && rainParticlesRef.current) {
      const positions = rainParticlesRef.current.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 10;
        if (positions[i] < 0) {
          positions[i] = 20;
        }
      }
      rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (weatherType === 'snow' && snowParticlesRef.current) {
      const positions = snowParticlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * 2;
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 20;
        }
      }
      snowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Generate weather particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  return (
    <group>
      {/* Dynamic fog based on weather */}
      {weatherType === 'fog' && <fog attach="fog" args={['#cccccc', 5, 50]} ref={fogRef} />}
      
      {/* Rain particles */}
      {weatherType === 'rain' && (
        <points ref={rainParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#4a90e2" transparent opacity={0.6} />
        </points>
      )}

      {/* Snow particles */}
      {weatherType === 'snow' && (
        <points ref={snowParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.8} />
        </points>
      )}

      {/* Main directional light with day/night cycle */}
      <directionalLight
        name="mainLight"
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {children}
    </group>
  );
}

export function InteractiveEnvironmentElement({ type, position, onInteract }) {
  const meshRef = useRef();
  const [activated, setActivated] = useState(false);

  const handleClick = () => {
    setActivated(!activated);
    onInteract?.(type, !activated);
  };

  return (
    <group position={position}>
      {type === 'lever' && (
        <mesh
          ref={meshRef}
          onClick={handleClick}
          rotation={activated ? [0, 0, -Math.PI / 4] : [0, 0, Math.PI / 4]}
          castShadow
        >
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={activated ? '#10b981' : '#ef4444'} />
        </mesh>
      )}

      {type === 'button' && (
        <mesh
          ref={meshRef}
          onClick={handleClick}
          position={[0, activated ? -0.05 : 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, activated ? 0.1 : 0.2, 16]} />
          <meshStandardMaterial color={activated ? '#fbbf24' : '#dc2626'} />
        </mesh>
      )}

      {type === 'door' && (
        <mesh
          ref={meshRef}
          onClick={handleClick}
          position={activated ? [1.5, 1, 0] : [0, 1, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 2, 1]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
      )}
    </group>
  );
}