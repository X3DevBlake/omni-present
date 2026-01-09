import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Play, Pause, Save, Upload } from 'lucide-react';

function MarketVisualization({ marketData }) {
  return (
    <group>
      {/* Market Grid */}
      <mesh position={[0, -3, 0]}>
        <planeGeometry args={[40, 40, 20, 20]} />
        <meshStandardMaterial color="#1a3a3a" wireframe />
      </mesh>

      {/* Price Nodes */}
      {marketData.assets.map((asset, i) => {
        const angle = (i / marketData.assets.length) * Math.PI * 2;
        const radius = 10;
        const height = asset.price / 50;

        return (
          <Float key={i} speed={2} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}>
              <boxGeometry args={[0.8, height * 2, 0.8]} />
              <meshStandardMaterial
                color={asset.trend === 'up' ? '#10b981' : '#ef4444'}
                emissive={asset.trend === 'up' ? '#10b981' : '#ef4444'}
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export default function AdvancedMarketSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState({
    volatility: 50,
    riskAversion: 60,
    greed: 40,
    eventFrequency: 30
  });

  const [marketData, setMarketData] = useState({
    assets: [
      { name: 'Omni Token', price: 85.5, trend: 'up' },
      { name: 'ETH', price: 72.3, trend: 'down' },
      { name: 'USDT', price: 45.2, trend: 'up' },
      { name: 'Agent Tokens', price: 62.8, trend: 'up' }
    ],
    events: [],
    time: 0
  });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        assets: prev.assets.map(asset => ({
          ...asset,
          price: Math.max(10, asset.price + (Math.random() - 0.5) * (config.volatility / 10)),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        })),
        time: prev.time + 1
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, config]);

  const handleSaveScenario = () => {
    const scenario = {
      timestamp: new Date().toISOString(),
      config,
      marketData,
      duration: marketData.time
    };
    console.log('Scenario saved:', scenario);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden"
    >
      {/* Controls */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10 p-4 space-y-4">
        <div className="flex gap-3 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              isRunning
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-green-500/20 border border-green-500/50 text-green-400'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'} Simulation
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleSaveScenario}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Scenario
          </motion.button>

          <div className="flex-1" />
          <span className="text-white/70 text-sm">Time: {marketData.time}s</span>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="text-white/60 text-xs mb-1 block capitalize">{key}: {value}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setConfig({ ...config, [key]: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="grid lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 h-[500px] bg-black/20 rounded-xl overflow-hidden">
          <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 5, 50]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[20, 20, 20]} intensity={2} color="#00f5ff" />
            <pointLight position={[-20, -20, -20]} intensity={1} color="#a855f7" />
            <Stars radius={100} depth={50} count={1000} factor={4} fade />
            <MarketVisualization marketData={marketData} />
            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        </div>

        {/* Asset Prices */}
        <div className="space-y-3">
          <h4 className="text-white font-bold">Asset Prices</h4>
          {marketData.assets.map((asset, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-white text-sm font-semibold">{asset.name}</p>
                <span className={`text-xs font-bold ${asset.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.trend === 'up' ? '↑' : '↓'}
                </span>
              </div>
              <p className="text-cyan-400 font-bold">${asset.price.toFixed(2)}</p>
              <div className="w-full bg-black/40 rounded-full h-1 mt-2">
                <motion.div
                  className={`h-full rounded-full ${asset.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
                  animate={{ width: `${(asset.price / 100) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}