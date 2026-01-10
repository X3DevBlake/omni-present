import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { TrendingUp } from 'lucide-react';

function AssetNode({ asset, position, isPositive }) {
  const ref = useRef();
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.002;
      ref.current.rotation.y += 0.003;
      const pulse = Math.sin(state.clock.elapsedTime) * 0.1;
      setScale(1 + pulse);
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[0.3, 32, 32]} scale={scale}>
        <meshPhongMaterial
          color={isPositive ? '#10b981' : '#ef4444'}
          emissive={isPositive ? '#10b981' : '#ef4444'}
          emissiveIntensity={0.6}
        />
      </Sphere>
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color={isPositive ? '#10b981' : '#ef4444'}
        distance={5}
      />
    </group>
  );
}

function GalaxyScene({ assets = [] }) {
  return (
    <>
      <PerspectiveCamera position={[0, 0, 25]} fov={60} makeDefault />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {assets.map((asset, idx) => {
        const angle = (idx / assets.length) * Math.PI * 2;
        const radius = 10 + Math.random() * 5;
        const position = [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 10,
          Math.sin(angle) * radius
        ];

        return (
          <AssetNode
            key={asset.id || idx}
            asset={asset}
            position={position}
            isPositive={(asset.change_percent || 0) > 0}
          />
        );
      })}

      <OrbitControls autoRotate autoRotateSpeed={1} enableZoom />
    </>
  );
}

export default function RealtimeFinancialGalaxy3D({ assets = [], loading = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-bold">Real-Time Financial Galaxy</h3>
      </div>

      <div className="relative h-[600px] bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60">Loading market data...</div>
          </div>
        ) : (
          <Canvas>
            <GalaxyScene assets={assets} />
          </Canvas>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-white/70">Positive Change</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-white/70">Negative Change</span>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <h4 className="text-sm font-bold text-white mb-2">Assets</h4>
        <div className="space-y-1">
          {assets.slice(0, 5).map((asset, idx) => (
            <div key={idx} className="flex justify-between text-xs text-white/70">
              <span>{asset.asset_symbol}</span>
              <span className={asset.change_percent > 0 ? 'text-green-400' : 'text-red-400'}>
                {asset.change_percent?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}