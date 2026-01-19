import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function ReputationOrb({ agent, position, reputation }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 0.5 + (reputation.overall_score / 100) * 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const trustColors = {
    novice: '#888888',
    trusted: '#4488ff',
    expert: '#a855f7',
    elite: '#ffcc00',
  };

  const color = trustColors[reputation.trust_level] || '#888888';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Reputation ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={reputation.overall_score / 200} 
        />
      </mesh>

      <Text
        position={[0, -1.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {agent?.name || 'Agent'}
      </Text>

      <Text
        position={[0, -2.3, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {reputation.overall_score.toFixed(0)} pts
      </Text>

      {/* Badges */}
      {reputation.badges?.length > 0 && (
        <Sphere args={[0.15, 16, 16]} position={[1.5, 1, 0]}>
          <meshBasicMaterial color="#ffcc00" />
        </Sphere>
      )}
    </group>
  );
}

function TransactionBeam({ from, to, amount }) {
  const lineRef = useRef();
  const particleRef = useRef();

  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.elapsedTime * 0.5) % 1;
      const pos = new THREE.Vector3(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t
      );
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <>
      <Line
        points={[from, to]}
        color="#00ff88"
        lineWidth={2}
        transparent
        opacity={0.4}
      />
      <Sphere ref={particleRef} args={[0.1, 16, 16]}>
        <meshBasicMaterial color="#00ff88" />
      </Sphere>
    </>
  );
}

export default function MarketplaceActivity3D() {
  const { data: reputations = [] } = useQuery({
    queryKey: ['agent-reputations'],
    queryFn: () => base44.entities.AgentReputation.list('-overall_score', 10),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => base44.entities.AgentTransaction.filter({ status: 'completed' }),
  });

  const positions = React.useMemo(() => {
    return reputations.map((_, index) => {
      const angle = (index / reputations.length) * Math.PI * 2;
      const radius = 5;
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius,
      ];
    });
  }, [reputations]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {reputations.map((rep, index) => {
          const agent = agents.find(a => a.id === rep.agent_id);
          return (
            <ReputationOrb
              key={rep.id}
              agent={agent}
              position={positions[index]}
              reputation={rep}
            />
          );
        })}

        {/* Show recent transaction flows */}
        {recentTransactions.slice(0, 5).map((tx, i) => {
          const buyerIndex = reputations.findIndex(r => r.agent_id === tx.buyer_agent_id);
          const sellerIndex = reputations.findIndex(r => r.agent_id === tx.seller_agent_id);
          
          if (buyerIndex >= 0 && sellerIndex >= 0) {
            return (
              <TransactionBeam
                key={tx.id}
                from={positions[sellerIndex]}
                to={positions[buyerIndex]}
                amount={tx.amount}
              />
            );
          }
          return null;
        })}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {reputations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No reputation data available</p>
        </div>
      )}
    </div>
  );
}