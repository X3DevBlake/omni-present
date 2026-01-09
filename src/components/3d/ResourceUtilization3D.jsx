import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Leaf, Zap } from 'lucide-react';

function ResourceBar({ position, value, label, color }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.y = Math.max(0.1, value / 100);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={[1, 1, 1]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function ResourceUtilization3D() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const mockResources = [
      { label: 'CPU', value: 78, color: '#00f5ff', impact: 'High' },
      { label: 'Memory', value: 62, color: '#a855f7', impact: 'Medium' },
      { label: 'Storage', value: 45, color: '#ec4899', impact: 'Low' },
      { label: 'Network', value: 88, color: '#3b82f6', impact: 'High' },
      { label: 'GPU', value: 92, color: '#10b981', impact: 'Critical' },
      { label: 'Power', value: 67, color: '#f59e0b', impact: 'Medium' }
    ];
    setResources(mockResources);
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden">
      <div className="h-96 relative">
        <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

          <Float speed={0.2} rotationIntensity={0.1}>
            <group>
              {resources.map((res, idx) => {
                const angle = (idx / resources.length) * Math.PI * 2;
                const radius = 3;
                return (
                  <ResourceBar
                    key={idx}
                    position={[
                      Math.cos(angle) * radius,
                      0,
                      Math.sin(angle) * radius
                    ]}
                    value={res.value}
                    label={res.label}
                    color={res.color}
                  />
                );
              })}

              {/* Central reference */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={0.2}
                  transparent={true}
                  opacity={0.2}
                  wireframe={true}
                />
              </mesh>
            </group>
          </Float>

          <Environment preset="night" />
          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      {/* Resource Details */}
      <div className="p-6 border-t border-white/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Resource Consumption
        </h3>

        <div className="space-y-3">
          {resources.map((res, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: res.color }}
                  />
                  <span className="text-white font-semibold text-sm">{res.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{res.value}%</span>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    res.impact === 'Critical' ? 'bg-red-500/30 text-red-300' :
                    res.impact === 'High' ? 'bg-orange-500/30 text-orange-300' :
                    res.impact === 'Medium' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-green-500/30 text-green-300'
                  }`}>
                    {res.impact}
                  </span>
                </div>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${res.value}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: res.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carbon Footprint */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              Environmental Impact
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs text-white/60 mb-1">Carbon Footprint</div>
              <div className="text-lg font-bold text-green-400">2.4 kg CO₂</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-xs text-white/60 mb-1">Power Consumption</div>
              <div className="text-lg font-bold text-blue-400">8.7 kWh</div>
            </div>
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-white font-bold text-sm mb-2">Optimization Tips</h4>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Scale down GPU usage during off-peak hours</li>
            <li>• Implement caching to reduce network calls</li>
            <li>• Consider distributed processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}