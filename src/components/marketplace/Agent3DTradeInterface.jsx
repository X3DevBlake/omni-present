import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

function TradeVisualization({ agentColor, trend }) {
  const rotation = trend === 'up' ? 0.5 : -0.5;
  
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.3}>
      <mesh rotation={[rotation, 0, 0]}>
        <pyramidGeometry args={[1, 2, 4]} />
        <meshStandardMaterial
          color={agentColor}
          emissive={agentColor}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      {/* Trading particles */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 1.5, i * 0.3 - 0.5, Math.sin(i * Math.PI / 2) * 1.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={agentColor} />
        </mesh>
      ))}
    </Float>
  );
}

export default function Agent3DTradeInterface() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Explorer-01', price: 45.99, trend: 'up', change: 12.5, volume: 2845, color: '#00f5ff' },
    { id: 2, name: 'Trader-05', price: 78.50, trend: 'down', change: -3.2, volume: 1956, color: '#10b981' },
    { id: 3, name: 'Analyst-12', price: 62.25, trend: 'up', change: 8.7, volume: 1423, color: '#a855f7' },
    { id: 4, name: 'Coordinator-08', price: 91.75, trend: 'up', change: 15.3, volume: 2134, color: '#ec4899' }
  ]);

  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      time: i,
      price: selectedAgent.price + Math.random() * 10 - 5
    }));
    setChartData(data);
  }, [selectedAgent]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Agent List */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Trading Agents</h3>
        <div className="space-y-3">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                selectedAgent.id === agent.id
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
                <span className={`text-xs font-bold ${agent.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {agent.trend === 'up' ? '+' : ''}{agent.change}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">${agent.price}</span>
                {agent.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-white/50 text-xs mt-2">Vol: {agent.volume}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Center: 3D Trading Visualization */}
      <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color={selectedAgent.color} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          <TradeVisualization agentColor={selectedAgent.color} trend={selectedAgent.trend} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>

      {/* Right: Stats & Chart */}
      <div className="space-y-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">{selectedAgent.name}</h4>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white/60 text-xs mb-1">Current Price</p>
              <p className="text-3xl font-bold text-cyan-400">${selectedAgent.price}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">24h Change</p>
                <p className={`font-bold ${selectedAgent.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedAgent.change}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-1">Volume</p>
                <p className="font-bold text-white">{selectedAgent.volume}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <p className="text-white/70 text-sm">Price Chart</p>
          </div>
          <svg className="w-full h-24">
            <polyline
              points={chartData.map((d, i) => `${(i / chartData.length) * 100},${100 - ((d.price / 100) * 80)}`).join(' ')}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Trade Now
        </motion.button>
      </div>
    </div>
  );
}