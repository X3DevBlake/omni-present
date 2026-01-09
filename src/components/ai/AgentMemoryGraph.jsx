import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';

function MemoryNode({ position, label, value, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        { x: hovered ? 1.2 : 1, y: hovered ? 1.2 : 1, z: hovered ? 1.2 : 1 },
        0.1
      );
      if (hovered) {
        meshRef.current.material.emissiveIntensity = 0.8;
      } else {
        meshRef.current.material.emissiveIntensity = 0.3;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.7}
        roughness={0.2}
        wireframe={false}
      />
    </mesh>
  );
}

export default function AgentMemoryGraph({ agentId = "Agent-01" }) {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    const mockMemories = [
      { id: 1, label: 'Trading Strategy', value: 87, color: '#00f5ff', category: 'financial' },
      { id: 2, label: 'Market Patterns', value: 92, color: '#a855f7', category: 'analysis' },
      { id: 3, label: 'Risk Assessment', value: 76, color: '#ec4899', category: 'safety' },
      { id: 4, label: 'Agent Network', value: 84, color: '#3b82f6', category: 'social' },
      { id: 5, label: 'Performance Data', value: 79, color: '#10b981', category: 'metrics' },
      { id: 6, label: 'User Preferences', value: 88, color: '#f59e0b', category: 'profile' }
    ];
    setMemories(mockMemories);
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 3D Memory Graph */}
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden h-96">
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

          <Float speed={0.3} rotationIntensity={0.2}>
            <group>
              {memories.map((mem, idx) => {
                const angle = (idx / memories.length) * Math.PI * 2;
                const radius = 4;
                return (
                  <MemoryNode
                    key={mem.id}
                    position={[
                      Math.cos(angle) * radius,
                      Math.sin(idx / memories.length * 2 - 1) * 3,
                      Math.sin(angle) * radius
                    ]}
                    label={mem.label}
                    value={mem.value}
                    color={mem.color}
                  />
                );
              })}

              {/* Central core */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={0.3}
                  transparent={true}
                  opacity={0.2}
                  wireframe={true}
                />
              </mesh>
            </group>
          </Float>

          <Environment preset="night" />
          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Memory Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 flex flex-col"
      >
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Memory Bank
        </h3>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {memories.map(mem => (
            <motion.div
              key={mem.id}
              whileHover={{ x: 5 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mem.color }}
                  />
                  <span className="text-sm font-semibold text-white">{mem.label}</span>
                </div>
                <span className="text-xs text-white/60">{mem.category}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mem.value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: mem.color }}
                />
              </div>
              <div className="text-xs text-white/50 mt-1">{mem.value}% confidence</div>
            </motion.div>
          ))}
        </div>

        {/* Memory Stats */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-white/60">
            <span>Total Memories:</span>
            <span className="text-purple-400">{memories.length}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Avg Confidence:</span>
            <span className="text-purple-400">
              {Math.round(memories.reduce((sum, m) => sum + m.value, 0) / memories.length)}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}