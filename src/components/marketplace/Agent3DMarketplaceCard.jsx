import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Star, Download, ShoppingCart, Zap } from 'lucide-react';

function Agent3DModel({ color, type = 'explorer' }) {
  const geometries = {
    explorer: <octahedronGeometry args={[1, 0]} />,
    trader: <torusKnotGeometry args={[1, 0.3, 128, 16]} />,
    analyst: <icosahedronGeometry args={[1, 2]} />,
    coordinator: <dodecahedronGeometry args={[1, 0]} />
  };

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={0.4}>
      <mesh>
        {geometries[type]}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Orbiting particles */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 2, Math.sin((i * Math.PI * 2) / 3) * 2, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </Float>
  );
}

export default function Agent3DMarketplaceCard({ agent, onAddToCart, onPurchase }) {
  const [expanded, setExpanded] = useState(false);

  const agentColors = {
    explorer: '#00f5ff',
    trader: '#10b981',
    analyst: '#a855f7',
    coordinator: '#ec4899'
  };

  const agentType = agent.category?.toLowerCase() || 'explorer';
  const color = agentColors[agentType] || '#00f5ff';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all cursor-pointer group"
    >
      {/* 3D Preview */}
      <div className="h-48 bg-black/20 relative overflow-hidden">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color={color} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
          <Agent3DModel color={color} type={agentType} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
        </Canvas>
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-yellow-400 text-xs">
          <Star className="w-3 h-3 fill-current" />
          {agent.rating || 4.8}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-cyan-400 text-xs">
          <Zap className="w-3 h-3" />
          {agent.performance || 'High-Performance'}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
          {agent.name}
        </h3>
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{agent.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-white/70">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/50">Efficiency</div>
            <div className="text-cyan-400 font-semibold">{agent.efficiency || '95%'}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-white/50">Downloads</div>
            <div className="text-green-400 font-semibold">{agent.downloads || 1247}</div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {agent.skills?.slice(0, 2).map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-white/5 rounded text-white/60 text-xs">
              {skill}
            </span>
          ))}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 font-bold text-lg">{agent.price || 'Free'}</span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onAddToCart?.(agent)}
              className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onPurchase?.(agent)}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:opacity-90"
            >
              Get
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}