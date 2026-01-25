import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const LeaderboardNode = ({ player, position, rank, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      meshRef.current.rotation.y = state.clock.elapsedTime * (rank <= 3 ? 2 : 0.5);
    }
  });

  const rankColors = {
    1: '#fbbf24',
    2: '#9ca3af',
    3: '#f59e0b'
  };
  
  const color = rankColors[rank] || '#3b82f6';
  
  return (
    <group position={position}>
      <Float speed={rank <= 3 ? 3 : 1.5} rotationIntensity={rank <= 3 ? 1 : 0.3}>
        <Sphere 
          ref={meshRef}
          args={[rank <= 3 ? 0.4 : 0.25, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(player);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={rank <= 3 ? 2 : 1}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {(hovered || rank <= 3) && (
          <Html distanceFactor={8}>
            <div className={`bg-black/95 border-2 rounded-xl p-3 min-w-[180px] backdrop-blur-xl ${
              rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-gray-400' : rank === 3 ? 'border-orange-400' : 'border-blue-400'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {rank === 1 && <Crown className="w-4 h-4 text-amber-400" />}
                {rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                {rank === 3 && <Medal className="w-4 h-4 text-orange-400" />}
                <div className="text-white font-bold text-sm">#{rank} {player.name}</div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="text-white font-bold">{player.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">XP:</span>
                  <span className="text-amber-400 font-bold">{player.xp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        #{rank}
      </Text>
    </group>
  );
};

export default function Leaderboard3D() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users
        .map(u => ({
          id: u.id,
          name: u.full_name,
          level: Math.floor(Math.random() * 30 + 1),
          xp: Math.floor(Math.random() * 10000 + 500)
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
    }
  });

  const topPlayers = leaderboard.length > 0 ? leaderboard : [
    { id: 1, name: 'Sarah Chen', level: 28, xp: 8450 },
    { id: 2, name: 'Marcus Rodriguez', level: 25, xp: 7200 },
    { id: 3, name: 'Aisha Patel', level: 23, xp: 6800 },
    { id: 4, name: 'James Wilson', level: 21, xp: 5900 },
    { id: 5, name: 'Elena Volkov', level: 19, xp: 5200 }
  ];

  const playerPositions = topPlayers.slice(0, 8).map((player, idx) => {
    const angle = (idx / 8) * Math.PI * 2;
    const radius = 3.5;
    return {
      player,
      rank: idx + 1,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 2, Math.sin(angle) * radius]
    };
  });

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          Global Leaderboard
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">Top performers across all hubs</p>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
            
            <Float speed={1.5} rotationIntensity={0.4}>
              <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={1.8}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
            </Float>

            {playerPositions.map(({ player, rank, position }) => (
              <LeaderboardNode
                key={player.id}
                player={player}
                rank={rank}
                position={position}
                onClick={setSelectedPlayer}
              />
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.6} />
          </Canvas>
        </div>

        <div className="space-y-2">
          {topPlayers.slice(0, 5).map((player, idx) => {
            const Icon = idx === 0 ? Crown : idx <= 2 ? Medal : Trophy;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  idx <= 2 ? 'bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/40' : 'bg-black/40 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-blue-400'}`} />
                  <div>
                    <div className="text-white font-bold">{player.name}</div>
                    <div className="text-gray-400 text-xs">Level {player.level}</div>
                  </div>
                </div>
                <div className="text-amber-400 font-bold">{player.xp.toLocaleString()} XP</div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}