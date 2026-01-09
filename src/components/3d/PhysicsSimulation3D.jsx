import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Torus, MeshDistortMaterial, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function PhysicsObject({ position, type, velocity, mass, color }) {
  const meshRef = useRef();
  const [pos, setPos] = useState(position);
  const [vel, setVel] = useState(velocity);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Apply gravity
      const newVel = [vel[0], vel[1] - 9.8 * delta * 0.1, vel[2]];
      
      // Update position
      const newPos = [
        pos[0] + newVel[0] * delta,
        pos[1] + newVel[1] * delta,
        pos[2] + newVel[2] * delta
      ];

      // Bounce off boundaries
      if (newPos[1] < -5) {
        newPos[1] = -5;
        newVel[1] = -newVel[1] * 0.8;
      }
      if (Math.abs(newPos[0]) > 8) newVel[0] = -newVel[0] * 0.8;
      if (Math.abs(newPos[2]) > 8) newVel[2] = -newVel[2] * 0.8;

      setPos(newPos);
      setVel(newVel);
      meshRef.current.position.set(...newPos);
      meshRef.current.rotation.x += delta * vel[0];
      meshRef.current.rotation.y += delta * vel[1];
    }
  });

  const geometry = type === 'sphere' ? (
    <sphereGeometry args={[mass * 0.5, 32, 32]} />
  ) : type === 'box' ? (
    <boxGeometry args={[mass, mass, mass]} />
  ) : (
    <torusGeometry args={[mass * 0.5, mass * 0.2, 16, 100]} />
  );

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

function ForceField({ active }) {
  return active ? (
    <mesh>
      <sphereGeometry args={[10, 32, 32]} />
      <meshBasicMaterial color="#00f5ff" opacity={0.1} transparent wireframe />
    </mesh>
  ) : null;
}

export default function PhysicsSimulation3D() {
  const [objects, setObjects] = useState([
    { id: 1, type: 'sphere', position: [-3, 5, 0], velocity: [2, 0, 1], mass: 1, color: '#00f5ff', friction: 0.1, elasticity: 0.8 },
    { id: 2, type: 'box', position: [3, 7, 0], velocity: [-1, 0, -1], mass: 1.2, color: '#a855f7', friction: 0.2, elasticity: 0.6 },
    { id: 3, type: 'torus', position: [0, 9, 3], velocity: [0.5, 0, -0.5], mass: 0.8, color: '#ec4899', friction: 0.15, elasticity: 0.9 },
    { id: 4, type: 'sphere', position: [-2, 6, -3], velocity: [1, 0, 2], mass: 0.9, color: '#10b981', friction: 0.05, elasticity: 0.95 }
  ]);

  const [gravity, setGravity] = useState(9.8);
  const [forceFields, setForceFields] = useState([
    { id: 1, position: [0, 0, 0], strength: 5, radius: 8, type: 'attract', active: false },
    { id: 2, position: [5, 0, 5], strength: 3, radius: 5, type: 'repel', active: false }
  ]);
  const [simulating, setSimulating] = useState(true);
  const [selectedObject, setSelectedObject] = useState(null);
  const [friction, setFriction] = useState(0.1);
  const [elasticity, setElasticity] = useState(0.8);
  const [sharedUsers, setSharedUsers] = useState([
    { id: 1, name: 'You', color: '#00f5ff', active: true },
    { id: 2, name: 'User-2', color: '#a855f7', active: false }
  ]);

  const addObject = () => {
    const types = ['sphere', 'box', 'torus'];
    const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
    setObjects([...objects, {
      id: Date.now(),
      type: types[Math.floor(Math.random() * types.length)],
      position: [
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 8,
        (Math.random() - 0.5) * 6
      ],
      velocity: [
        (Math.random() - 0.5) * 4,
        0,
        (Math.random() - 0.5) * 4
      ],
      mass: Math.random() * 0.5 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      friction: friction,
      elasticity: elasticity
    }]);
  };

  const toggleForceField = (id) => {
    setForceFields(forceFields.map(ff => 
      ff.id === id ? { ...ff, active: !ff.active } : ff
    ));
  };

  const updateObjectProperties = (id, props) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, ...props } : obj
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Interactive Physics Simulation</h3>
        
        {/* Controls */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Gravity: {gravity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Friction: {friction.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={friction}
              onChange={(e) => setFriction(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Elasticity: {elasticity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSimulating(!simulating)}
              className={`px-3 py-2 rounded-lg font-semibold flex-1 text-sm ${
                simulating
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                  : 'bg-green-500/20 border border-green-500/50 text-green-400'
              }`}
            >
              {simulating ? '⏸' : '▶'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addObject}
              className="px-3 py-2 rounded-lg font-semibold bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 flex-1 text-sm"
            >
              + Add
            </motion.button>
          </div>
        </div>

        {/* Force Fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {forceFields.map(ff => (
            <div key={ff.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-semibold">
                  Force Field {ff.id} ({ff.type})
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => toggleForceField(ff.id)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    ff.active 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                  }`}
                >
                  {ff.active ? 'ON' : 'OFF'}
                </motion.button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Strength: {ff.strength}</span>
                  <span className="text-white/60">Radius: {ff.radius}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Multiplayer Users */}
        <div className="flex gap-2 mb-4">
          {sharedUsers.map(user => (
            <div key={user.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
              <span className="text-white/70 text-xs">{user.name}</span>
              {user.active && <span className="text-green-400 text-xs">●</span>}
            </div>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="h-[600px] rounded-xl overflow-hidden bg-black/20">
          <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
            
            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1a1a2e" opacity={0.5} transparent />
            </mesh>

            {/* Physics objects */}
            {simulating && objects.map((obj) => (
              <PhysicsObject key={obj.id} {...obj} />
            ))}

            <ForceField active={forceField} />
            <OrbitControls />
          </Canvas>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Objects</p>
            <p className="text-white font-bold text-xl">{objects.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Gravity</p>
            <p className="text-white font-bold text-xl">{gravity.toFixed(1)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Friction</p>
            <p className="text-white font-bold text-xl">{friction.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Elasticity</p>
            <p className="text-white font-bold text-xl">{elasticity.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Status</p>
            <p className="text-white font-bold text-xl">{simulating ? '🟢' : '⏸️'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}