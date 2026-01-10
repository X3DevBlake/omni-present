/**
 * Enhanced Financial Galaxy 3D with News Sentiment
 * Visualizes both crypto and traditional stock assets
 * Sentiment represented through color and glow intensity
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

function SentimentPlanet({ position, scale, asset, sentiment }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const sentimentColor = sentiment > 0.3 ? 0x00ff88 : sentiment < -0.3 ? 0xff0055 : 0x00d4ff;
  const glowIntensity = Math.abs(sentiment) * 2 + 0.5;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
      if (hovered) {
        meshRef.current.scale.setScalar(scale * 1.3);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={sentimentColor}
          emissive={sentimentColor}
          emissiveIntensity={glowIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sentiment Aura */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={sentimentColor}
          transparent
          opacity={0.1 * Math.abs(sentiment)}
        />
      </mesh>

      {/* Data Rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial color={sentimentColor} emissive={sentimentColor} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function DataComet({ from, to, color = 0x00d4ff }) {
  const lineRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress((p) => (p + 0.01) % 1);
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

function GalaxyScene({ marketAssets, cryptoAssets }) {
  const allAssets = [...marketAssets, ...cryptoAssets];
  const positions = allAssets.map((_, i) => {
    const angle = (i / allAssets.length) * Math.PI * 2;
    const radius = 15 + (i % 5) * 3;
    return {
      x: Math.cos(angle) * radius,
      y: (Math.random() - 0.5) * 10,
      z: Math.sin(angle) * radius
    };
  });

  return (
    <>
      <Stars radius={200} depth={100} count={5000} factor={4} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={0.8} />

      {allAssets.map((asset, i) => (
        <SentimentPlanet
          key={asset.id || i}
          position={[positions[i].x, positions[i].y, positions[i].z]}
          scale={Math.max(0.5, Math.min(3, asset.sentiment_score || asset.price_change_24h / 50))}
          asset={asset}
          sentiment={asset.sentiment_score || (asset.price_change_24h / 10)}
        />
      ))}

      <OrbitControls autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function EnhancedFinancialGalaxy3DWithNews({ marketAssets = [], cryptoAssets = [] }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const topGainers = [...marketAssets, ...cryptoAssets]
    .sort((a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0))
    .slice(0, 5);

  const sentimentLeaders = marketAssets
    .sort((a, b) => (b.sentiment_score || 0) - (a.sentiment_score || 0))
    .slice(0, 3);

  return (
    <div className="w-full space-y-6">
      {/* 3D Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[600px] rounded-lg overflow-hidden border border-cyan-500/30 bg-black/50"
      >
        <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
          <GalaxyScene marketAssets={marketAssets} cryptoAssets={cryptoAssets} />
        </Canvas>
      </motion.div>

      {/* Asset Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Top Gainers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topGainers.map((asset, idx) => (
              <div
                key={idx}
                className="p-3 bg-black/30 rounded-lg border border-white/10 hover:border-cyan-400/50 cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{asset.symbol}</p>
                    <p className="text-sm text-gray-400">${asset.current_price?.toFixed(2)}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    +{asset.price_change_24h?.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Market Sentiment Leaders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentimentLeaders.map((asset, idx) => {
              const sentimentText = asset.sentiment_score > 0.3 ? 'Bullish' : asset.sentiment_score < -0.3 ? 'Bearish' : 'Neutral';
              const sentimentColor = asset.sentiment_score > 0.3 ? 'text-green-400' : asset.sentiment_score < -0.3 ? 'text-red-400' : 'text-yellow-400';
              return (
                <div key={idx} className="p-3 bg-black/30 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{asset.name}</p>
                      <p className={`text-sm ${sentimentColor}`}>{sentimentText}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{asset.news_count} news</p>
                      <p className={`text-xs font-bold ${asset.sentiment_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(asset.sentiment_score * 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Selected Asset Detail */}
      {selectedAsset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4">{selectedAsset.name} ({selectedAsset.symbol})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-xl font-bold text-cyan-400">${selectedAsset.current_price?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Market Cap</p>
              <p className="text-xl font-bold text-white">${(selectedAsset.market_cap / 1e9)?.toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Sentiment</p>
              <p className={`text-xl font-bold ${selectedAsset.sentiment_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(selectedAsset.sentiment_score * 100)?.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Volume 24h</p>
              <p className="text-xl font-bold text-white">${(selectedAsset.volume_24h / 1e9)?.toFixed(1)}B</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}