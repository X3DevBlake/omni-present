import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

function TerrainMesh({ scale = 20 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && meshRef.current.material.uniforms) {
      meshRef.current.material.uniforms.time.value += 0.001;
    }
  });

  const vertexShader = `
    uniform float time;
    varying float vHeight;

    void main() {
      vHeight = sin(position.x * 0.1 + time) * cos(position.z * 0.1 + time) * 2.0;
      vec3 pos = position;
      pos.y += vHeight;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying float vHeight;
    void main() {
      vec3 color = mix(vec3(0.1, 0.5, 0.2), vec3(0.5, 0.3, 0.1), (vHeight + 2.0) / 4.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
      <planeGeometry args={[scale, scale, 64, 64]} />
      <shaderMaterial
        uniforms={{ time: { value: 0 } }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

function DynamicEnvironmentObject({ position, type = 'cube' }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
      {type === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
      {type === 'cone' && <coneGeometry args={[1, 2, 32]} />}
      <meshStandardMaterial
        color={`hsl(${Math.random() * 360}, 70%, 50%)`}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
  );
}

export default function Advanced3DEnvironment({ isRunning, onSimulationEvent }) {
  const [simulationTime, setSimulationTime] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [environmentObjects, setEnvironmentObjects] = useState([
    { id: 1, position: [5, 2, 5], type: 'cube' },
    { id: 2, position: [-5, 1.5, -5], type: 'sphere' },
    { id: 3, position: [0, 2.5, 8], type: 'cone' },
  ]);

  // Simulate dynamic events
  React.useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulationTime(t => t + 1);
      
      // Generate random events
      if (Math.random() > 0.7) {
        const events = [
          { type: 'agent_interaction', msg: 'Agent detected resource' },
          { type: 'environment_change', msg: 'Environmental condition shifted' },
          { type: 'collision', msg: 'Object interaction detected' },
          { type: 'emergence', msg: 'Emergent behavior observed' },
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        setEventLog(prev => [
          { ...event, timestamp: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9)
        ]);
        
        onSimulationEvent?.(event);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 3D Environment */}
      <div className="flex-1 h-96 lg:h-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/40">
        <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[20, 20, 20]} intensity={2} color="#00f5ff" />
          <pointLight position={[-20, -20, -20]} intensity={1} color="#a855f7" />
          
          {/* Procedural terrain */}
          <TerrainMesh scale={30} />

          {/* Dynamic environment objects */}
          {environmentObjects.map(obj => (
            <DynamicEnvironmentObject
              key={obj.id}
              position={obj.position}
              type={obj.type}
            />
          ))}

          {/* Sky */}
          <mesh position={[0, 30, 0]}>
            <sphereGeometry args={[100, 32, 32]} />
            <meshBasicMaterial
              color="#0a0a2e"
              side={THREE.BackSide}
            />
          </mesh>

          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      {/* Simulation Controls & Events */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-4">Simulation Control</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-2">Simulation Time</p>
              <p className="text-cyan-400 font-bold text-2xl">{simulationTime}s</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div>
              <label className="text-white/60 text-sm">Environment Complexity</label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Event Log */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4">Event Stream</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-white/50 text-sm">Waiting for events...</p>
            ) : (
              eventLog.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 p-2 bg-black/30 rounded text-xs"
                >
                  <span className="text-cyan-400 font-mono flex-shrink-0">{event.timestamp}</span>
                  <div>
                    <p className="text-white font-semibold text-xs">{event.type}</p>
                    <p className="text-white/70">{event.msg}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4">Simulation Metrics</h3>
          <div className="space-y-3">
            {[
              { label: 'Agent Activity', value: 87 },
              { label: 'Resource Utilization', value: 62 },
              { label: 'Emergence Index', value: 45 },
            ].map((metric, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{metric.label}</span>
                  <span className="text-green-400">{metric.value}%</span>
                </div>
                <div className="bg-black/40 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}