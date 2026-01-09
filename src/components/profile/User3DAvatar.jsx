import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';

function Avatar({ color }) {
  const headRef = useRef();

  useFrame(() => {
    if (headRef.current) {
      headRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 1.4, 0.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 1.4, 0.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Arms */}
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Achievement crown */}
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.5, 0.6, 32]} />
        <meshPhongMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>

      {/* Aura */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>
    </group>
  );
}

export default function User3DAvatar({ user, achievements = 0 }) {
  const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
  const userColor = colors[user?.email?.charCodeAt(0) % colors.length] || colors[0];

  return (
    <div className="space-y-4">
      <div className="bg-black/40 border border-cyan-500/30 rounded-2xl overflow-hidden h-96">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color={userColor} />
          <pointLight position={[-5, -5, 5]} intensity={0.8} />

          <Avatar color={userColor} />

          <OrbitControls enableZoom />
        </Canvas>
      </div>

      {/* Avatar customization info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3">
          <p className="text-white/60 text-xs">Profile Color</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full" style={{ background: userColor }} />
            <p className="text-white font-semibold text-sm">{userColor}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-white/60 text-xs">Achievements</p>
          <p className="text-2xl font-bold text-purple-400">{achievements}</p>
        </div>
      </div>

      <button className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all">
        🎨 Customize Avatar
      </button>
    </div>
  );
}