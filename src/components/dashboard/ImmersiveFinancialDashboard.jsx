import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Target, Shield } from 'lucide-react';

function PortfolioOrb({ value, position, color }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[1, 32, 32]}>
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </Sphere>
      <Text position={[0, -2, 0]} fontSize={0.5} color="white">
        ${(value / 1000).toFixed(1)}K
      </Text>
      <pointLight intensity={3} color={color} distance={8} />
    </group>
  );
}

export default function ImmersiveFinancialDashboard({ userEmail }) {
  const { data: healthScore } = useQuery({
    queryKey: ['healthScore', userEmail],
    queryFn: () => userEmail ? base44.entities.FinancialHealthScore.filter({ user_email: userEmail }).catch(() => []) : [],
    select: (data) => data[0]
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', userEmail],
    queryFn: () => userEmail ? base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []) : []
  });

  const portfolioData = accounts.map((acc, idx) => ({
    value: acc.balance || 0,
    position: [
      Math.cos((idx / accounts.length) * Math.PI * 2) * 5,
      (Math.random() - 0.5) * 3,
      Math.sin((idx / accounts.length) * Math.PI * 2) * 5
    ],
    color: ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'][idx % 4]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Financial Health Score */}
      {healthScore && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-white font-bold text-xl">Financial Health Score</h3>
                <p className="text-green-400 text-sm">{healthScore.trend || 'stable'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">{healthScore.overall_score}</p>
              <p className="text-white/60 text-sm">out of 100</p>
            </div>
          </div>

          {/* Components */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {Object.entries(healthScore.components || {}).map(([key, value]) => (
              <div key={key} className="bg-white/5 rounded-lg p-2">
                <p className="text-white/60 text-xs capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-white font-bold">{value.toFixed(0)}%</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          {healthScore.insights && healthScore.insights.length > 0 && (
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-green-400 font-bold text-sm mb-2">Key Insights</p>
              <div className="space-y-1">
                {healthScore.insights.slice(0, 3).map((insight, idx) => (
                  <p key={idx} className="text-white/70 text-xs">• {insight}</p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 3D Portfolio Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">Portfolio Performance</h3>
          </div>
        </div>
        <div className="h-[400px]">
          <Canvas>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            {portfolioData.map((portfolio, idx) => (
              <PortfolioOrb
                key={idx}
                value={portfolio.value}
                position={portfolio.position}
                color={portfolio.color}
              />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-white/60 text-xs">Total Balance</p>
          <p className="text-2xl font-bold text-white">
            ${accounts.reduce((sum, a) => sum + (a.balance || 0), 0).toFixed(2)}
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-white/60 text-xs">Accounts</p>
          <p className="text-2xl font-bold text-cyan-400">{accounts.length}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-white/60 text-xs">Health Score</p>
          <p className="text-2xl font-bold text-green-400">{healthScore?.overall_score || 0}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-white/60 text-xs">Trend</p>
          <p className="text-2xl font-bold text-yellow-400">{healthScore?.trend || 'N/A'}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}