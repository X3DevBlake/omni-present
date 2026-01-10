import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function VotingOrb({ position, vote, count }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const color = vote === 'for' ? '#00ff88' : vote === 'against' ? '#ff4444' : '#ffaa00';

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <group position={position}>
        <mesh ref={meshRef}>
          <Sphere args={[0.8, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center">
          {count}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.2} color="white" anchorX="center">
          {vote.toUpperCase()}
        </Text>
      </group>
    </Float>
  );
}

function ProposalPillar({ position, height, color, label }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.25} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export default function DAOGovernanceArena3D() {
  const [selectedProposal, setSelectedProposal] = useState(null);

  const proposals = [
    { id: 1, title: 'Upgrade Protocol', for: 1250, against: 340, abstain: 120 },
    { id: 2, title: 'Adjust Fees', for: 890, against: 670, abstain: 200 }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🏛️ DAO Governance Arena</h3>
        <p className="text-white/60 text-sm">Visualize and participate in protocol governance</p>
      </div>
      
      <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
        
        {/* Central Arena Platform */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <cylinderGeometry args={[5, 5, 0.2, 32]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.2} />
        </mesh>

        {/* Voting Orbs */}
        <VotingOrb position={[-3, 2, 0]} vote="for" count={1250} />
        <VotingOrb position={[0, 2, 0]} vote="against" count={340} />
        <VotingOrb position={[3, 2, 0]} vote="abstain" count={120} />

        {/* Proposal Pillars */}
        <ProposalPillar position={[0, 0, -3]} height={3} color="#00f5ff" label="Active Proposals: 2" />
        
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-green-400 font-bold text-xl">1,250</div>
            <div className="text-white/60 text-xs">For</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-xl">340</div>
            <div className="text-white/60 text-xs">Against</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-xl">120</div>
            <div className="text-white/60 text-xs">Abstain</div>
          </div>
        </div>
      </div>
    </div>
  );
}