import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function DeviceModel({ deviceType, status, health }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && status === 'active') {
      groupRef.current.rotation.y += 0.01;
    }
  });

  const renderDevice = () => {
    switch (deviceType) {
      case 'sensor':
        return (
          <group>
            <mesh>
              <boxGeometry args={[1, 2, 0.5]} />
              <meshPhongMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshPhongMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      case 'gateway':
        return (
          <group>
            <mesh>
              <boxGeometry args={[1.5, 1, 1.5]} />
              <meshPhongMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
              <meshPhongMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.7} />
            </mesh>
          </group>
        );
      case 'drone':
      default:
        return (
          <group>
            <mesh>
              <boxGeometry args={[1, 0.3, 1.5]} />
              <meshPhongMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
            </mesh>
            {[[-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]].map((pos, i) => (
              <mesh key={i} position={pos}>
                <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
                <meshPhongMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.7} />
              </mesh>
            ))}
          </group>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {renderDevice()}

      {/* Health indicator ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.2, 0.1, 16, 100]} />
        <meshBasicMaterial
          color={health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444'}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Status indicator */}
      {status === 'active' && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
    </group>
  );
}

export default function DigitalTwin3D({ device }) {
  const [health, setHealth] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(30, Math.min(100, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-black/40 border border-cyan-500/30 rounded-2xl overflow-hidden h-80">
        <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, 5]} intensity={0.8} />

          <DeviceModel
            deviceType={device?.type || 'drone'}
            status={device?.status || 'active'}
            health={health}
          />

          <OrbitControls enableZoom autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Health</p>
          <p className="text-2xl font-bold text-cyan-400">{health.toFixed(0)}%</p>
          <div className="mt-2 w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full transition-all ${health > 70 ? 'bg-green-500' : health > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Status</p>
          <p className="text-lg font-bold text-purple-400">{device?.status || 'Active'}</p>
          <div className="mt-2 flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-purple-500/50 rounded" />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3"
        >
          <p className="text-white/60 text-xs">Uptime</p>
          <p className="text-lg font-bold text-green-400">99.2%</p>
          <p className="text-xs text-green-300 mt-1">Last 30 days</p>
        </motion.div>
      </div>
    </div>
  );
}