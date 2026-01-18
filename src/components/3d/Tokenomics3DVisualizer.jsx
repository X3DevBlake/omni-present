import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line, Torus, Box, Cone } from '@react-three/drei';
import * as THREE from 'three';

const TOTAL_SUPPLY = 300000000;

const tokenomicsData = {
  distribution: [
    { name: 'Community Rewards', amount: 90000000, percentage: 30, color: '#3b82f6', position: [0, 3, 0] },
    { name: 'Ecosystem Development', amount: 75000000, percentage: 25, color: '#10b981', position: [3, 1.5, 0] },
    { name: 'Staking Rewards', amount: 60000000, percentage: 20, color: '#8b5cf6', position: [2, -2, 2] },
    { name: 'Team & Advisors', amount: 30000000, percentage: 10, color: '#f59e0b', position: [-3, 1, 1] },
    { name: 'Liquidity Pool', amount: 24000000, percentage: 8, color: '#06b6d4', position: [-2, -1.5, -1] },
    { name: 'Treasury', amount: 21000000, percentage: 7, color: '#ec4899', position: [0, 0, -3] }
  ],
  utilities: [
    { name: 'Governance Voting', icon: '🗳️' },
    { name: 'Agent Deployment', icon: '🤖' },
    { name: 'Staking Rewards', icon: '💰' },
    { name: 'Transaction Fees', icon: '⚡' },
    { name: 'Premium Features', icon: '⭐' }
  ]
};

function CentralToken() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        OMNI
      </Text>
      <Text
        position={[0, -0.3, 1.2]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        300M Supply
      </Text>
      
      <Torus args={[1.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </Torus>
      <Torus args={[2, 0.03, 16, 100]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#10b981" transparent opacity={0.2} />
      </Torus>
    </group>
  );
}

function DistributionSegment({ data, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + index;
    }
  });

  const size = 0.3 + (data.percentage / 100) * 0.5;

  return (
    <group position={data.position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        maxWidth={2}
      >
        {data.name}
      </Text>
      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.15}
        color={data.color}
        anchorX="center"
      >
        {data.percentage}%
      </Text>
      <Text
        position={[0, size + 0.05, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
      >
        {(data.amount / 1000000).toFixed(0)}M
      </Text>
      
      <Line
        points={[[0, 0, 0], [0, -data.position[1], -data.position[2]]]}
        color={data.color}
        lineWidth={2}
        transparent
        opacity={0.4}
      />
    </group>
  );
}

function UtilityOrbit({ utilities }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {utilities.map((utility, i) => {
        const angle = (i / utilities.length) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0, z]}>
            <Box args={[0.6, 0.6, 0.6]}>
              <meshStandardMaterial
                color="#1e293b"
                emissive="#3b82f6"
                emissiveIntensity={0.2}
              />
            </Box>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.15}
              color="white"
              anchorX="center"
            >
              {utility.icon}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.1}
              color="#94a3b8"
              anchorX="center"
              maxWidth={1.5}
            >
              {utility.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function ParticleField() {
  const particlesRef = useRef();
  const particleCount = 200;
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a855f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Tokenomics3DVisualizer() {
  return (
    <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#3b82f6" />
      
      <ParticleField />
      <CentralToken />
      
      {tokenomicsData.distribution.map((segment, i) => (
        <DistributionSegment key={i} data={segment} index={i} />
      ))}
      
      <UtilityOrbit utilities={tokenomicsData.utilities} />
      
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      <gridHelper args={[30, 30, '#334155', '#1e293b']} position={[0, -5, 0]} />
    </Canvas>
  );
}