import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PivotControls, Sphere, Box, Plane } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Zap, Mouse, Eye, Settings } from 'lucide-react';
import * as THREE from 'three';

function InteractiveObject({ position, scale, color, onDrag }) {
  const meshRef = React.useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <PivotControls
      anchor={[0, 0, 0]}
      depthTest={false}
      onDrag={onDrag}
    >
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </PivotControls>
  );
}

function PhysicsObject({ position, velocity = [0, 0, 0] }) {
  const meshRef = React.useRef();
  const velRef = React.useRef(velocity);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += velRef.current[0];
      meshRef.current.position.y += velRef.current[1];
      meshRef.current.position.z += velRef.current[2];

      // Gravity
      velRef.current[1] -= 0.001;

      // Bounce
      if (meshRef.current.position.y < -5) {
        meshRef.current.position.y = -5;
        velRef.current[1] *= -0.8;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#00f5ff" metalness={0.8} roughness={0.1} />
    </mesh>
  );
}

export default function Interactive3DSimulationPanel() {
  const [objects, setObjects] = useState([
    { id: 1, position: [-2, 0, 0], color: '#00f5ff' },
    { id: 2, position: [0, 0, 0], color: '#a855f7' },
    { id: 3, position: [2, 0, 0], color: '#ec4899' }
  ]);

  const [physicsActive, setPhysicsActive] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [viewMode, setViewMode] = useState('orbit');

  const dropObject = () => {
    const newObject = {
      id: Math.max(...objects.map(o => o.id), 0) + 1,
      position: [(Math.random() - 0.5) * 10, 5, (Math.random() - 0.5) * 10],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };
    setObjects(prev => [...prev, newObject]);
  };

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          3D Interactive Control Panel
        </h3>
      </div>

      {/* 3D Canvas */}
      <div className="h-96 bg-black/60 rounded-lg overflow-hidden border border-white/10">
        <Canvas camera={{ position: [0, 5, 15], fov: 75 }} shadows>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, 10]} intensity={0.8} color="#a855f7" />

          {/* Ground */}
          <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
            <meshStandardMaterial color="#1a1a2e" />
          </Plane>

          {/* Interactive Objects */}
          {objects.map(obj => (
            <InteractiveObject
              key={obj.id}
              position={obj.position}
              scale={1}
              color={obj.color}
              onDrag={() => setSelectedObject(obj.id)}
            />
          ))}

          {/* Physics Objects */}
          {physicsActive && (
            <>
              {[0, 1, 2].map(i => (
                <PhysicsObject
                  key={`physics-${i}`}
                  position={[-5 + i * 5, 10, 0]}
                  velocity={[(Math.random() - 0.5) * 0.05, 0, 0]}
                />
              ))}
            </>
          )}

          <OrbitControls enableZoom autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* View Mode */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">View Mode</label>
          <div className="flex gap-2">
            {[
              { id: 'orbit', label: 'Orbit', icon: Eye },
              { id: 'physics', label: 'Physics', icon: Zap },
              { id: 'interactive', label: 'Interactive', icon: Mouse }
            ].map(mode => (
              <motion.button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                whileHover={{ scale: 1.05 }}
                className={`flex-1 py-2 px-2 rounded text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                  viewMode === mode.id
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Physics Controls */}
        <motion.button
          onClick={() => setPhysicsActive(!physicsActive)}
          whileHover={{ scale: 1.05 }}
          className={`w-full py-2 rounded text-xs font-medium transition-all ${
            physicsActive
              ? 'bg-red-500/20 border border-red-500/40 text-red-300'
              : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
          }`}
        >
          {physicsActive ? '⏸ Stop Physics Simulation' : '▶ Start Physics Simulation'}
        </motion.button>

        {/* Object Management */}
        <motion.button
          onClick={dropObject}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs font-medium"
        >
          + Drop Object
        </motion.button>

        {/* Environment Parameters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/60 text-xs mb-1 block">Gravity</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="1"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Friction</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              className="w-full"
            />
          </div>
        </div>

        {/* Selected Object Info */}
        {selectedObject && (
          <div className="bg-white/5 border border-white/10 rounded p-2">
            <p className="text-white/60 text-xs mb-1">Selected Object: <span className="font-bold text-cyan-400">#{selectedObject}</span></p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button className="py-1 bg-white/10 hover:bg-white/20 text-white rounded">Delete</button>
              <button className="py-1 bg-white/10 hover:bg-white/20 text-white rounded">Properties</button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white/5 border border-white/10 rounded p-2 text-xs text-white/70">
        <p>Objects: <span className="font-bold text-cyan-400">{objects.length}</span></p>
        <p>Physics: <span className="font-bold">{physicsActive ? 'Active' : 'Inactive'}</span></p>
      </div>
    </div>
  );
}