import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Float, OrbitControls, Sphere, Box, MeshDistortMaterial, MeshWobbleMaterial, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Quantum particle system
function QuantumParticles({ count = 500, color = '#00f5ff' }) {
  const particlesRef = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Neural connection web
function NeuralWeb({ nodes = 20 }) {
  const webRef = useRef();
  const [connections, setConnections] = useState([]);

  const nodePositions = useMemo(() => {
    return Array.from({ length: nodes }, () => ({
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 6,
      pulse: Math.random()
    }));
  }, [nodes]);

  useEffect(() => {
    const conns = [];
    nodePositions.forEach((node, i) => {
      nodePositions.slice(i + 1).forEach((other, j) => {
        const dist = Math.sqrt(
          Math.pow(node.x - other.x, 2) +
          Math.pow(node.y - other.y, 2) +
          Math.pow(node.z - other.z, 2)
        );
        if (dist < 2.5) {
          conns.push({ from: i, to: i + j + 1, dist });
        }
      });
    });
    setConnections(conns);
  }, [nodePositions]);

  useFrame((state) => {
    if (webRef.current) {
      webRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={webRef}>
      {nodePositions.map((pos, idx) => (
        <Sphere key={idx} args={[0.04, 16, 16]} position={[pos.x, pos.y, pos.z]}>
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.4 + Math.sin(pos.pulse * Math.PI * 2) * 0.3} />
        </Sphere>
      ))}
      {connections.map((conn, idx) => {
        const from = nodePositions[conn.from];
        const to = nodePositions[conn.to];
        const points = [
          new THREE.Vector3(from.x, from.y, from.z),
          new THREE.Vector3(to.x, to.y, to.z)
        ];
        return (
          <line key={idx}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.15} />
          </line>
        );
      })}
    </group>
  );
}

// Holographic ring
function HolographicRing({ radius = 2, segments = 64, color = '#00f5ff', speed = 1 }) {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.3;
      ringRef.current.rotation.z = Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.2;
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.05);
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, segments]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

// Ultra animated letter
function UltraLetter({ char, position, index, systemData }) {
  const letterRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  const letterColors = {
    'O': '#00f5ff',
    'M': '#a855f7',
    'N': '#10b981',
    'I': '#f59e0b'
  };

  const color = letterColors[char] || '#00f5ff';
  const intensity = systemData?.activity || 0.5;

  useFrame((state) => {
    if (letterRef.current) {
      // Complex animation
      const t = state.clock.elapsedTime;
      const wave = Math.sin(t * 2 + index * 0.8) * 0.15;
      const pulse = 1 + Math.sin(t * 3 + index) * 0.08 * intensity;
      
      letterRef.current.position.y = position[1] + wave;
      letterRef.current.scale.setScalar(pulse * (hovered ? 1.2 : 1));
      letterRef.current.rotation.y = Math.sin(t * 0.5 + index) * 0.1;
      
      if (letterRef.current.material) {
        letterRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 4 + index) * 0.3 * intensity;
      }
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3);
      glowRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Glow sphere */}
      <Sphere ref={glowRef} args={[0.6, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </Sphere>

      {/* Main letter */}
      <Trail width={0.3} length={8} color={color} attenuation={(t) => t * t}>
        <mesh
          ref={letterRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[0.8, 1, 0.3]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
            distort={hovered ? 0.3 : 0.1}
            speed={2}
          />
        </mesh>
      </Trail>

      {/* Orbiting particles */}
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={3 + i} rotationIntensity={0.5}>
          <Sphere args={[0.03, 8, 8]} position={[
            Math.cos((i / 3) * Math.PI * 2) * 0.5,
            Math.sin((i / 3) * Math.PI * 2) * 0.5,
            0.3
          ]}>
            <meshBasicMaterial color={color} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// Energy core
function EnergyCore({ activity = 0.5 }) {
  const coreRef = useRef();
  const shellRef = useRef();

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.7;
      const scale = 0.3 + activity * 0.2 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      coreRef.current.scale.setScalar(scale);
    }
    if (shellRef.current) {
      shellRef.current.rotation.x = -state.clock.elapsedTime * 0.3;
      shellRef.current.rotation.z = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inner core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshWobbleMaterial
          color="#ffffff"
          emissive="#00f5ff"
          emissiveIntensity={1}
          factor={0.3}
          speed={2}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Outer shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Data streams
function DataStreams({ count = 8, radius = 2.5 }) {
  const streamsRef = useRef();

  useFrame((state) => {
    if (streamsRef.current) {
      streamsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={streamsRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const colors = ['#00f5ff', '#a855f7', '#10b981', '#f59e0b'];
        
        return (
          <group key={i} position={[x, 0, z]}>
            <Trail width={0.1} length={20} color={colors[i % colors.length]} attenuation={(t) => t}>
              <Float speed={2 + i * 0.3} rotationIntensity={0.3} floatIntensity={1}>
                <Sphere args={[0.05, 16, 16]}>
                  <meshBasicMaterial color={colors[i % colors.length]} />
                </Sphere>
              </Float>
            </Trail>
          </group>
        );
      })}
    </group>
  );
}

// Main scene
function UltraScene({ systemData }) {
  const activity = systemData?.activity || 0.5;

  return (
    <group>
      {/* Background effects */}
      <QuantumParticles count={400} color="#00f5ff" />
      <NeuralWeb nodes={25} />
      <Sparkles count={100} scale={8} size={2} speed={0.3} color="#00f5ff" />

      {/* Holographic rings */}
      <HolographicRing radius={3} speed={0.5} color="#00f5ff" />
      <HolographicRing radius={2.5} speed={0.7} color="#a855f7" />
      <HolographicRing radius={2} speed={0.9} color="#10b981" />

      {/* Energy core */}
      <EnergyCore activity={activity} />

      {/* Data streams */}
      <DataStreams count={8} radius={2.8} />

      {/* OMNI Letters */}
      <Center>
        <group>
          <UltraLetter char="O" position={[-2.4, 0, 0]} index={0} systemData={systemData} />
          <UltraLetter char="M" position={[-0.8, 0, 0]} index={1} systemData={systemData} />
          <UltraLetter char="N" position={[0.8, 0, 0]} index={2} systemData={systemData} />
          <UltraLetter char="I" position={[2.4, 0, 0]} index={3} systemData={systemData} />
        </group>
      </Center>
    </group>
  );
}

export default function UltraOmniText3D() {
  const { data: systemMetrics = [] } = useQuery({
    queryKey: ['ultra-metrics'],
    queryFn: () => base44.entities.SystemMetric?.list?.('-created_date', 1) || [],
    initialData: [],
    refetchInterval: 3000
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['ultra-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: []
  });

  const systemData = {
    activity: Math.min(1, (agents.length / 10) + 0.3),
    agentCount: agents.length
  };

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#a855f7" />
        <pointLight position={[0, -5, 0]} intensity={0.2} color="#10b981" />

        <UltraScene systemData={systemData} />

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Overlay stats */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-cyan-400 text-xs">ACTIVE AGENTS</p>
          <p className="text-white text-xl font-bold">{agents.length}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-purple-400 text-xs">SYSTEM ACTIVITY</p>
          <p className="text-white text-xl font-bold">{(systemData.activity * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}