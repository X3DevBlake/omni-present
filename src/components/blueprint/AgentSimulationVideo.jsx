import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Download, RotateCcw } from 'lucide-react';

function HumanAgent({ position, animation }) {
  const groupRef = useRef();
  const [walkCycle, setWalkCycle] = useState(0);

  useFrame((state, delta) => {
    if (groupRef.current && animation === 'walking') {
      // Walking animation
      setWalkCycle(prev => prev + delta * 2);
      
      // Move forward
      groupRef.current.position.z += delta * 0.5;
      
      // Rotate slightly for natural movement
      groupRef.current.rotation.y = Math.sin(walkCycle) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      
      {/* Left Arm */}
      <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, Math.sin(walkCycle) * 0.3]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.4, 1.2, 0]} rotation={[0, 0, -Math.sin(walkCycle) * 0.3]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* Left Leg */}
      <mesh position={[-0.15, 0.4, 0]} rotation={[Math.sin(walkCycle + Math.PI) * 0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[0.15, 0.4, 0]} rotation={[Math.sin(walkCycle) * 0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Glow effect */}
      <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#00f5ff" distance={3} />
    </group>
  );
}

function ParkEnvironment() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>

      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 50]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Trees */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 8 + Math.random() * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <coneGeometry args={[1.5, 3, 8]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          </group>
        );
      })}

      {/* Benches */}
      {[...Array(4)].map((_, i) => {
        const x = (i % 2 === 0 ? 5 : -5);
        const z = (i - 1.5) * 8;
        
        return (
          <group key={`bench-${i}`} position={[x, 0, z]} rotation={[0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1.5, 0.1, 0.4]} />
              <meshStandardMaterial color="#78716c" />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.9, -0.15]} castShadow>
              <boxGeometry args={[1.5, 0.6, 0.1]} />
              <meshStandardMaterial color="#78716c" />
            </mesh>
            {/* Legs */}
            <mesh position={[-0.6, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.6, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#57534e" />
            </mesh>
          </group>
        );
      })}

      {/* Lamp posts */}
      {[...Array(6)].map((_, i) => {
        const x = i % 2 === 0 ? 4 : -4;
        const z = (i - 2.5) * 6;
        
        return (
          <group key={`lamp-${i}`} position={[x, 0, z]}>
            {/* Post */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            {/* Light */}
            <mesh position={[0, 3.8, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 3.8, 0]} intensity={1} color="#fbbf24" distance={10} />
          </group>
        );
      })}

      {/* Flowers */}
      {[...Array(40)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={`flower-${i}`} position={[x, 0.2, z]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 4)]} />
          </mesh>
        );
      })}

      {/* Fountain in center */}
      <group position={[0, 0, 15]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[2, 2.5, 1, 16]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, 2, 0]} intensity={0.5} color="#60a5fa" distance={5} />
      </group>
    </>
  );
}

function CameraAnimation({ duration }) {
  const controlsRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    setProgress(prev => Math.min(prev + delta / duration, 1));
    
    if (controlsRef.current) {
      // Smooth camera movement following the agent
      const angle = progress * Math.PI * 0.3;
      const radius = 8;
      const x = Math.sin(angle) * radius;
      const z = -10 + progress * 25;
      const y = 3 + Math.sin(progress * Math.PI) * 2;
      
      state.camera.position.x = x;
      state.camera.position.y = y;
      state.camera.position.z = z;
      state.camera.lookAt(0, 1.5, progress * 25);
    }
  });

  return <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} enableRotate={false} />;
}

export default function AgentSimulationVideo({ show, onClose, agent, duration = 45 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (show) {
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [show]);

  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, duration]);

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Agent Simulation Preview</h3>
              <p className="text-white/60 text-sm">Realistic 3D simulation of {agent?.name || 'agent'} in a park environment</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex-1 relative">
            <Canvas shadows camera={{ position: [5, 3, -10], fov: 60 }}>
              <Sky sunPosition={[100, 20, 100]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
              
              <ParkEnvironment />
              <HumanAgent position={[0, 0, -20]} animation={isPlaying ? 'walking' : 'idle'} />
              
              <CameraAnimation duration={duration} />
            </Canvas>

            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-lg ${isPlaying ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-green-500/20 border border-green-500/40'}`}>
                  <Play className={`w-5 h-5 ${isPlaying ? 'text-yellow-300' : 'text-green-300'}`} />
                </button>
                <button onClick={handleReplay} className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40">
                  <RotateCcw className="w-5 h-5 text-blue-300" />
                </button>
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-white/70 mb-1">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{duration}s</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100" style={{ width: `${(currentTime / duration) * 100}%` }} />
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/40">
                  <Download className="w-5 h-5 text-purple-300" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1">Behavior</div>
                  <div className="text-white font-medium">Walking</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1">Location</div>
                  <div className="text-white font-medium">Park</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1">Activity</div>
                  <div className="text-white font-medium">Exploring</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1">Status</div>
                  <div className="text-green-400 font-medium">Active</div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-sm font-semibold">Live Simulation</span>
              </div>
              <div className="text-white/60 text-xs">Realistic human-like behavior</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}