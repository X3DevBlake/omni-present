import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Wireframe } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Settings } from 'lucide-react';

function HologramMesh() {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.3;
      if (hovered) {
        meshRef.current.scale.lerp({ x: 1.1, y: 1.1, z: 1.1 }, 0.1);
      } else {
        meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <dodecahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={hovered ? 0.8 : 0.4}
          wireframe={false}
          transparent={true}
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh scale={1.15}>
        <dodecahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#a855f7"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* Glowing aura */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.1}
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </Float>
  );
}

export default function HolographicAgentProjection({ agentName = "Atlas-01" }) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'agent', text: 'Ready to assist with your tasks.' },
    { id: 2, from: 'user', text: 'Analyze market trends please' },
    { id: 3, from: 'agent', text: 'Processing 12M data points... 94% complete' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: prev.length + 1, from: 'user', text: inputText }
    ]);
    setInputText('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: prev.length + 1, from: 'agent', text: 'Task acknowledged. Executing...' }
      ]);
    }, 500);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Hologram Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden h-96"
      >
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-5, -5, -5]} intensity={1} color="#a855f7" />

          <HologramMesh />

          <Environment preset="night" />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>

        {/* Agent Status */}
        <div className="absolute top-4 left-4 text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {agentName}
        </div>
      </motion.div>

      {/* Interaction Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
      >
        <h3 className="text-white font-bold mb-4">Agent Communication</h3>

        {/* Chat Messages */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-64">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs p-3 rounded-lg ${
                  msg.from === 'agent'
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 mr-8'
                    : 'bg-purple-500/20 border border-purple-500/30 text-purple-300 ml-8'
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Give agent a command..."
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Agent Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsListening(!isListening)}
              className={`flex-1 px-3 py-2 rounded border transition-all text-sm font-semibold flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30'
              }`}
            >
              <Mic className="w-4 h-4" />
              {isListening ? 'Stop' : 'Voice'}
            </button>
            <button className="px-3 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white/60">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agent Stats */}
        <div className="mt-4 pt-4 border-t border-white/10 text-xs space-y-2">
          <div className="flex justify-between text-white/60">
            <span>Processing Speed:</span>
            <span className="text-cyan-400">94%</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Memory Usage:</span>
            <span className="text-cyan-400">67%</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Learning Rate:</span>
            <span className="text-cyan-400">+2.3%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}