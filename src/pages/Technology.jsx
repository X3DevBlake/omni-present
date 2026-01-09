import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, Center, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Cpu, Zap, Brain, Network, Lock, Rocket } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import TechShowcase from '../components/omni/TechShowcase';

function TechSphere({ position, color }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[0.5, 32, 32]} position={position}>
        <MeshDistortMaterial color={color} attach="material" distort={0.3} speed={2} roughness={0.2} />
      </Sphere>
    </Float>
  );
}

function Tech3DScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <TechSphere position={[-2, 0, 0]} color="#00f5ff" />
      <TechSphere position={[2, 0, 0]} color="#a855f7" />
      <TechSphere position={[0, 2, 0]} color="#ec4899" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function Technology() {
  const techStack = [
    { icon: Brain, title: 'Advanced AI', description: 'Neural networks with 247 zeptosecond processing', color: 'from-purple-500 to-pink-500' },
    { icon: Zap, title: 'Quantum Speed', description: 'Real-time agent learning and adaptation', color: 'from-cyan-500 to-blue-500' },
    { icon: Network, title: 'Decentralized', description: 'Distributed blockchain infrastructure', color: 'from-green-500 to-emerald-500' },
    { icon: Lock, title: 'Secure', description: 'Military-grade encryption and privacy', color: 'from-orange-500 to-red-500' },
    { icon: Cpu, title: 'Scalable', description: 'Handles millions of concurrent agents', color: 'from-yellow-500 to-amber-500' },
    { icon: Rocket, title: 'Future-Ready', description: 'Built for tomorrow\'s challenges', color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Technology</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Powered by cutting-edge AI, quantum computing, and blockchain technology
          </p>
        </motion.div>

        {/* 3D Interactive Display */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="h-[400px]">
              <Canvas camera={{ position: [0, 0, 8] }}>
                <Tech3DScene />
              </Canvas>
            </div>
            <div className="p-6 text-center">
              <p className="text-cyan-400 font-semibold">Interactive 3D Technology Visualization</p>
              <p className="text-white/60 text-sm">Drag to rotate • Scroll to zoom</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tech.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{tech.title}</h3>
                <p className="text-white/60">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <TechShowcase />
      </div>
    </AuroraBackground>
  );
}