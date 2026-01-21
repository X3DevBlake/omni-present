import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Center, Float, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

// Individual animated letter with unique behaviors
function AnimatedLetter({ char, index, position, emotionalState = 'neutral', onClick }) {
  const letterRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  const emotionColors = {
    neutral: '#00f5ff',
    happy: '#10b981',
    focused: '#3b82f6',
    alert: '#ef4444',
    excited: '#f59e0b',
    calm: '#a855f7'
  };

  const baseColor = emotionColors[emotionalState] || emotionColors.neutral;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (letterRef.current) {
      // Unique floating animation per letter
      letterRef.current.position.y = position[1] + Math.sin(time * 2 + index * 0.8) * 0.1;
      letterRef.current.rotation.y = Math.sin(time * 0.5 + index) * 0.1;
      letterRef.current.rotation.x = Math.cos(time * 0.3 + index) * 0.05;
      
      // Scale pulse on hover
      const targetScale = hovered ? 1.15 : 1;
      letterRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.2 + Math.sin(time * 3 + index) * 0.1 + (hovered ? 0.2 : 0);
    }
  });

  // Create letter shape based on character
  const getLetterGeometry = () => {
    switch(char) {
      case 'O':
        return (
          <group>
            <mesh>
              <torusGeometry args={[0.4, 0.12, 16, 32]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Inner energy ring */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.25, 0.03, 8, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          </group>
        );
      case 'M':
        return (
          <group>
            {/* Left pillar */}
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.12, 0.8, 0.12]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Right pillar */}
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.12, 0.8, 0.12]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Left diagonal */}
            <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Right diagonal */}
            <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      case 'N':
        return (
          <group>
            {/* Left pillar */}
            <mesh position={[-0.25, 0, 0]}>
              <boxGeometry args={[0.12, 0.8, 0.12]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Right pillar */}
            <mesh position={[0.25, 0, 0]}>
              <boxGeometry args={[0.12, 0.8, 0.12]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Diagonal */}
            <mesh rotation={[0, 0, -0.7]}>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      case 'I':
        return (
          <group>
            {/* Main pillar */}
            <mesh>
              <boxGeometry args={[0.12, 0.8, 0.12]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Top bar */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.35, 0.1, 0.1]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Bottom bar */}
            <mesh position={[0, -0.35, 0]}>
              <boxGeometry args={[0.35, 0.1, 0.1]} />
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group
      ref={letterRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {getLetterGeometry()}
      
      {/* Glow sphere */}
      <Sphere ref={glowRef} args={[0.6, 16, 16]}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.15} />
      </Sphere>

      {/* Hover info */}
      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            {char === 'O' && 'Omniscient AI Core'}
            {char === 'M' && 'Multi-Agent Network'}
            {char === 'N' && 'Neural Intelligence'}
            {char === 'I' && 'Infinite Possibilities'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Data streams flowing through text
function DataStreams({ intensity = 0.5 }) {
  const streamsRef = useRef();
  const particleCount = 100;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (streamsRef.current) {
      const positions = streamsRef.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += (0.02 + intensity * 0.03);
        if (positions[i * 3] > 3) positions[i * 3] = -3;
        positions[i * 3 + 1] = Math.sin(time * 2 + i * 0.5) * 0.5;
      }
      streamsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={streamsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00f5ff" transparent opacity={0.6 + intensity * 0.3} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Knowledge field particles around text
function KnowledgeField({ dataProcessing = 0 }) {
  const fieldRef = useRef();
  const particleCount = 500;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 2;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      const hue = Math.random() * 0.3 + 0.5;
      colors[i * 3] = hue;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.9;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      fieldRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={fieldRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particles.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.015 + dataProcessing * 0.01} 
        color={new THREE.Color().setHSL(0.55, 0.8, 0.6)} 
        transparent 
        opacity={0.4 + dataProcessing * 0.3} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
}

// Holographic rings around text
function HolographicRings({ emotionalState = 'neutral' }) {
  const ringsRef = useRef([]);

  const emotionColors = {
    neutral: '#00f5ff',
    happy: '#10b981',
    focused: '#3b82f6',
    alert: '#ef4444',
    excited: '#f59e0b',
    calm: '#a855f7'
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = Math.sin(time * 0.5 + i) * 0.3;
        ring.rotation.y = time * (0.2 + i * 0.1);
        ring.scale.setScalar(1 + Math.sin(time * 2 + i * 2) * 0.05);
      }
    });
  });

  return (
    <group>
      {[1.8, 2.2, 2.6].map((radius, i) => (
        <mesh key={i} ref={el => ringsRef.current[i] = el}>
          <torusGeometry args={[radius, 0.015, 8, 64]} />
          <meshBasicMaterial 
            color={emotionColors[emotionalState]} 
            transparent 
            opacity={0.3 - i * 0.08} 
          />
        </mesh>
      ))}
    </group>
  );
}

// Central energy core
function CentralEnergyCore({ systemActivity = 0.5 }) {
  const coreRef = useRef();

  useFrame((state) => {
    if (coreRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 0.3 + Math.sin(time * 3) * 0.05 + systemActivity * 0.1;
      coreRef.current.scale.setScalar(scale);
      coreRef.current.rotation.y = time;
      coreRef.current.rotation.x = time * 0.5;
    }
  });

  return (
    <Sphere ref={coreRef} args={[1, 32, 32]} position={[0, 0, -0.5]}>
      <MeshDistortMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={1 + systemActivity}
        distort={0.4}
        speed={5}
        metalness={0.3}
        roughness={0}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

// Main Text Scene
function UltraTextScene({ 
  emotionalState = 'neutral', 
  systemActivity = 0.5, 
  dataProcessing = 0,
  onLetterClick 
}) {
  const letters = ['O', 'M', 'N', 'I'];
  const positions = [[-2.2, 0, 0], [-0.75, 0, 0], [0.75, 0, 0], [2.2, 0, 0]];

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#00f5ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#a855f7" />
      <pointLight position={[0, -3, 5]} intensity={0.6} color="#ec4899" />
      <spotLight position={[0, 8, 0]} intensity={0.5} angle={0.5} />

      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
          {letters.map((char, i) => (
            <AnimatedLetter
              key={i}
              char={char}
              index={i}
              position={positions[i]}
              emotionalState={emotionalState}
              onClick={() => onLetterClick && onLetterClick(char)}
            />
          ))}
        </group>
      </Float>

      <DataStreams intensity={systemActivity} />
      <KnowledgeField dataProcessing={dataProcessing} />
      <HolographicRings emotionalState={emotionalState} />
      <CentralEnergyCore systemActivity={systemActivity} />

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
    </>
  );
}

export default function UltraOmniText3D({ 
  emotionalState = 'neutral', 
  systemActivity = 0.5, 
  dataProcessing = 0,
  onLetterClick,
  className = ""
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <UltraTextScene
          emotionalState={emotionalState}
          systemActivity={systemActivity}
          dataProcessing={dataProcessing}
          onLetterClick={onLetterClick}
        />
      </Canvas>
    </div>
  );
}