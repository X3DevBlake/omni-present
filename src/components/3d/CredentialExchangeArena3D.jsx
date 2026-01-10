import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Line } from '@react-three/drei';
import { Button } from '@/components/ui/button';

function CredentialKey({ position, label, color, isActive }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.8 : 0.3}
            metalness={1}
          />
        </mesh>
        <Text position={[0, -1, 0]} fontSize={0.2} color="white" anchorX="center">
          {label}
        </Text>
      </group>
    </Float>
  );
}

function ExchangePath({ start, end, active }) {
  return (
    <Line
      points={[start, end]}
      color={active ? "#00ff88" : "#ffffff"}
      lineWidth={active ? 4 : 2}
      opacity={active ? 1 : 0.3}
      transparent
    />
  );
}

export default function CredentialExchangeArena3D() {
  const [activeExchange, setActiveExchange] = useState(null);
  const [exchanges, setExchanges] = useState([
    { from: 'ID Proof', to: 'DeFi Protocol', status: 'pending' },
    { from: 'License', to: 'DAO Platform', status: 'completed' }
  ]);

  const credentials = [
    { label: 'ID Proof', pos: [-3, 0, 0], color: '#00f5ff' },
    { label: 'License', pos: [0, 2, 0], color: '#a855f7' },
    { label: 'Degree', pos: [3, 0, 0], color: '#ec4899' }
  ];

  const dapps = [
    { label: 'DeFi Protocol', pos: [-2, -2, 2], color: '#10b981' },
    { label: 'DAO Platform', pos: [2, -2, 2], color: '#f59e0b' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🔑 Credential Exchange Arena</h3>
        <p className="text-white/60 text-sm">Visually negotiate and exchange verifiable credentials</p>
      </div>

      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

        {/* Credentials */}
        {credentials.map((cred, i) => (
          <CredentialKey
            key={i}
            position={cred.pos}
            label={cred.label}
            color={cred.color}
            isActive={activeExchange === i}
          />
        ))}

        {/* DApps */}
        {dapps.map((dapp, i) => (
          <CredentialKey
            key={i + 100}
            position={dapp.pos}
            label={dapp.label}
            color={dapp.color}
            isActive={false}
          />
        ))}

        {/* Exchange Paths */}
        <ExchangePath start={[-3, 0, 0]} end={[-2, -2, 2]} active={true} />
        <ExchangePath start={[0, 2, 0]} end={[2, -2, 2]} active={false} />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-white font-bold mb-3">Active Exchanges</h4>
        <div className="space-y-2">
          {exchanges.map((ex, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
              <div className="text-white text-sm">{ex.from} → {ex.to}</div>
              <div className={`px-2 py-1 rounded text-xs ${
                ex.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {ex.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}