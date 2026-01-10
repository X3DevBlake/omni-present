import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

function ReputationTree({ growth = 0.7 }) {
  const trunkRef = useRef();
  const leavesRef = useRef();
  
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y += 0.005;
    }
  });

  // Generate branch positions based on growth
  const branches = useMemo(() => {
    const count = Math.floor(growth * 12);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const height = 0.5 + (i / count) * 2;
      const radius = 0.3 + Math.sin(i) * 0.2;
      return {
        start: [0, height, 0],
        end: [
          Math.cos(angle) * radius,
          height + 0.5,
          Math.sin(angle) * radius
        ]
      };
    });
  }, [growth]);

  return (
    <group>
      {/* Tree Trunk */}
      <mesh ref={trunkRef} position={[0, 1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 16]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.8}
        />
      </mesh>

      {/* Branches */}
      {branches.map((branch, i) => (
        <Line
          key={i}
          points={branch}
          color="#654321"
          lineWidth={2}
        />
      ))}

      {/* Leaves/Reputation Points */}
      <group ref={leavesRef}>
        {branches.map((branch, i) => (
          <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5}>
            <mesh position={branch.end}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial
          color="#2d5016"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

export default function DIDReputationTree3D() {
  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🌳 Reputation Growth Tree</h3>
        <p className="text-white/60 text-sm">Watch your on-chain reputation flourish</p>
      </div>
      <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#00ff88" />
        
        <ReputationTree growth={0.8} />
        
        <OrbitControls enableZoom autoRotate autoRotateSpeed={1} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-white/60 text-xs">Growth</div>
            <div className="text-green-400 font-bold">80%</div>
          </div>
          <div>
            <div className="text-white/60 text-xs">Actions</div>
            <div className="text-cyan-400 font-bold">247</div>
          </div>
          <div>
            <div className="text-white/60 text-xs">Trust Score</div>
            <div className="text-purple-400 font-bold">A+</div>
          </div>
        </div>
      </div>
    </div>
  );
}