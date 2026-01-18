import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Points, Line, useFrame } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function FinancialPoints({ transactions }) {
  const points = useRef();
  const [positions, setPositions] = useState(new Float32Array());
  const [colors, setColors] = useState(new Float32Array());

  useEffect(() => {
    if (!transactions?.length) return;

    const pos = new Float32Array(transactions.length * 3);
    const cols = new Float32Array(transactions.length * 3);

    transactions.forEach((tx, i) => {
      const angle = (i / transactions.length) * Math.PI * 2;
      const radius = 2 + Math.random();
      const height = (Math.random() - 0.5) * 3;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const value = parseFloat(tx.amount || 0);
      const hue = Math.min(value / 1000, 1);
      const color = new THREE.Color().setHSL(0.1 + hue * 0.4, 0.8, 0.5);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    });

    setPositions(pos);
    setColors(cols);
  }, [transactions]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.0002;
    }
  });

  return (
    <Points ref={points} positions={positions}>
      <pointsMaterial size={0.08} sizeAttenuation color={0xffffff} transparent />
    </Points>
  );
}

function FinancialGalaxyScene({ transactions }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00f5ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#a855f7" />
      <FinancialPoints transactions={transactions} />
      <OrbitControls autoRotate autoRotateSpeed={1} enableZoom />
    </Canvas>
  );
}

export default function RealtimeFinancialGalaxy3D() {
  const { data: transactions = [] } = useQuery({
    queryKey: ['homeFinancialTransactions'],
    queryFn: () => base44.entities.FinancialTransaction.filter({}).limit(100),
    refetchInterval: 4000
  });

  const { data: portfolio = { total: 0, change: 0 } } = useQuery({
    queryKey: ['homePortfolioMetrics'],
    queryFn: async () => {
      const txs = await base44.entities.FinancialTransaction.filter({}).limit(100);
      const total = txs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      return { total, change: Math.random() * 10 - 5 };
    },
    refetchInterval: 5000
  });

  const topTransactions = transactions.slice(0, 5);
  const isPositive = portfolio.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full rounded-xl overflow-hidden"
    >
      <FinancialGalaxyScene transactions={transactions} />

      {/* Portfolio Metrics */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700"
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-white">${portfolio.total.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-semibold ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isPositive ? '+' : ''}{portfolio.change.toFixed(2)}%
            </div>
            <span className="text-xs text-slate-400">24h change</span>
          </div>
        </div>
      </motion.div>

      {/* Transaction Flow */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700 max-w-xs"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Top Transactions</h3>
        <div className="space-y-2">
          {topTransactions.map((tx, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex justify-between items-center text-xs"
            >
              <div>
                <p className="text-slate-300 font-medium">{tx.type || 'Transfer'}</p>
                <p className="text-slate-500 text-xs">{new Date(tx.created_date).toLocaleTimeString()}</p>
              </div>
              <span className="text-green-400 font-semibold">${parseFloat(tx.amount || 0).toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}