import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Center, Float, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Individual animated letter
function AnimatedLetter({ char, index, totalChars, emotionalState, dataStreams, onClick }) {
  const letterRef = useRef();
  const glowRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const basePosition = useMemo(() => {
    const spacing = 0.9;
    const totalWidth = (totalChars - 1) * spacing;
    return [(index * spacing) - totalWidth / 2, 0, 0];
  }, [index, totalChars]);

  const emotionColors = {
    happy: '#10b981',
    excited: '#f59e0b',
    calm: '#3b82f6',
    focused: '#8b5cf6',
    stressed: '#ef4444',
    neutral: '#00f5ff'
  };

  const letterColor = emotionColors[emotionalState] || '#00f5ff';

  // Data stream particles for each letter
  const particlePositions = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (letterRef.current) {
      // Breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 1.5 + index * 0.5) * 0.03;
      letterRef.current.position.y = basePosition[1] + breathe;
      
      // Hover effect
      if (hovered) {
        letterRef.current.scale.setScalar(1.15);
        letterRef.current.position.z = 0.2;
      } else {
        letterRef.current.scale.setScalar(1);
        letterRef.current.position.z = 0;
      }

      // Wave animation based on data activity
      const waveOffset = Math.sin(state.clock.elapsedTime * 2 + index * 0.8) * 0.05 * dataStreams;
      letterRef.current.position.y += waveOffset;
      
      // Subtle rotation
      letterRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.05;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = hovered ? 0.4 : 0.15 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
    }

    // Animate data stream particles
    if (particlesRef.current && dataStreams > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += 0.02 * dataStreams;
        if (positions[i * 3 + 1] > 1) {
          positions[i * 3 + 1] = -1;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    onClick && onClick(char, index);
  };

  return (
    <group position={basePosition}>
      <Center>
        <Text3D
          ref={letterRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.8}
          height={0.15}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.01}
          bevelSegments={5}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
        >
          {char}
          <meshStandardMaterial
            color={letterColor}
            emissive={letterColor}
            emissiveIntensity={hovered ? 1 : 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[1, 1.2]} />
        <meshBasicMaterial color={letterColor} transparent opacity={0.15} />
      </mesh>

      {/* Data stream particles */}
      {dataStreams > 0 && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={30} array={particlePositions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.02} color={letterColor} transparent opacity={0.6} />
        </points>
      )}

      {/* Click burst effect */}
      {clicked && (
        <Sphere args={[0.5, 16, 16]}>
          <meshBasicMaterial color={letterColor} transparent opacity={0.3} />
        </Sphere>
      )}

      {/* Info tooltip on hover */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/90 px-3 py-2 rounded-lg text-xs text-white min-w-32">
            <p className="font-bold text-cyan-400">{getLetterMeaning(char)}</p>
            <p className="text-slate-400">Click to explore</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function getLetterMeaning(char) {
  const meanings = {
    'O': 'Omniscient Overview',
    'M': 'Multi-Agent Management',
    'N': 'Neural Networks',
    'I': 'Intelligent Integration'
  };
  return meanings[char] || 'Omni Feature';
}

// Background energy field
function EnergyField({ intensity = 0.5 }) {
  const fieldRef = useRef();
  const particleCount = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (fieldRef.current) {
      const positions = fieldRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.002 * intensity;
        positions[i * 3 + 1] += Math.cos(state.clock.elapsedTime + i * 0.01) * 0.002 * intensity;
      }
      fieldRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={fieldRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#00f5ff" transparent opacity={0.3 + intensity * 0.3} />
    </points>
  );
}

// Connecting neural lines
function NeuralConnections({ emotionalState }) {
  const linesRef = useRef();
  const lineCount = 20;

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.1;
        if (line.material) {
          line.material.opacity = opacity;
        }
      });
    }
  });

  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < lineCount; i++) {
      const startX = (Math.random() - 0.5) * 6;
      const startY = (Math.random() - 0.5) * 2;
      const endX = (Math.random() - 0.5) * 6;
      const endY = (Math.random() - 0.5) * 2;
      
      result.push({
        start: [startX, startY, -1.5],
        end: [endX, endY, -1.5],
        color: Math.random() > 0.5 ? '#00f5ff' : '#a855f7'
      });
    }
    return result;
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line.start, ...line.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={line.color} transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
}

// Text scene
function TextScene({ emotionalState, dataStreams, onLetterClick }) {
  const text = "OMNI";
  
  return (
    <group>
      <EnergyField intensity={dataStreams / 5} />
      <NeuralConnections emotionalState={emotionalState} />
      
      {text.split('').map((char, index) => (
        <AnimatedLetter
          key={index}
          char={char}
          index={index}
          totalChars={text.length}
          emotionalState={emotionalState}
          dataStreams={dataStreams}
          onClick={onLetterClick}
        />
      ))}
    </group>
  );
}

export default function EnhancedOmniText3D({ onLetterClick }) {
  const { data: emotions = [] } = useQuery({
    queryKey: ['text-emotions'],
    queryFn: () => base44.entities.AgentEmotion.list('-created_date', 5),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: dataStreams = [] } = useQuery({
    queryKey: ['text-streams'],
    queryFn: () => base44.entities.KnowledgeTransfer.filter({ transfer_status: 'in_progress' }),
    initialData: [],
    refetchInterval: 3000
  });

  const dominantEmotion = useMemo(() => {
    if (emotions.length === 0) return 'neutral';
    const emotionCounts = {};
    emotions.forEach(e => {
      emotionCounts[e.primary_emotion] = (emotionCounts[e.primary_emotion] || 0) + 1;
    });
    return Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  }, [emotions]);

  return (
    <div className="h-[300px] w-full relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, -3, 5]} intensity={0.5} color="#a855f7" />

        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <TextScene 
            emotionalState={dominantEmotion} 
            dataStreams={dataStreams.length}
            onLetterClick={onLetterClick}
          />
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
      </Canvas>

      <div className="absolute bottom-2 left-2 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">
          Mood: <span className="text-cyan-400 capitalize">{dominantEmotion}</span>
        </span>
        <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300">
          Data Flow: <span className="text-purple-400">{dataStreams.length}</span>
        </span>
      </div>
    </div>
  );
}