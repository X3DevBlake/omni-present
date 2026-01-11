import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Agent3DNode({ position, name, isActive, decisions = [] }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current && isActive) {
      ref.current.rotation.y += 0.02;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[0.5, 32, 32]}>
        <meshPhongMaterial 
          color={isActive ? '#00f5ff' : '#a855f7'} 
          emissive={isActive ? '#00f5ff' : '#a855f7'} 
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </Sphere>
      <Text position={[0, -1, 0]} fontSize={0.3} color="white">
        {name}
      </Text>
      {isActive && <pointLight intensity={2} color="#00f5ff" distance={5} />}
      
      {/* Decision markers */}
      {decisions.map((decision, idx) => (
        <Sphere 
          key={idx}
          position={[
            Math.cos(idx * Math.PI / 3) * 0.8, 
            Math.sin(idx * Math.PI / 3) * 0.8, 
            0
          ]} 
          args={[0.1, 16, 16]}
        >
          <meshBasicMaterial color="#10b981" />
        </Sphere>
      ))}
    </group>
  );
}

function CommunicationFlow({ start, end, active }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={active ? '#00f5ff' : '#ffffff'}
      lineWidth={active ? 3 : 1}
      opacity={active ? 0.8 : 0.2}
      dashed={!active}
    />
  );
}

function PathfindingTrail({ path }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const points = path.map(p => new THREE.Vector3(...p));
  
  return (
    <Line
      ref={ref}
      points={points}
      color="#ec4899"
      lineWidth={2}
      opacity={0.6}
    />
  );
}

export default function Enhanced3DAgentCollaboration({ agents, communications, pathfinding }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[600px] bg-black/20 rounded-xl border border-white/10"
    >
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Agent Nodes */}
        {agents.map((agent, idx) => (
          <Agent3DNode
            key={agent.id || idx}
            position={agent.position || [
              Math.cos((idx / agents.length) * Math.PI * 2) * 4,
              (Math.random() - 0.5) * 2,
              Math.sin((idx / agents.length) * Math.PI * 2) * 4
            ]}
            name={agent.name}
            isActive={agent.isActive}
            decisions={agent.recentDecisions || []}
          />
        ))}

        {/* Communication Lines */}
        {communications.map((comm, idx) => (
          <CommunicationFlow
            key={idx}
            start={comm.from_position}
            end={comm.to_position}
            active={comm.active}
          />
        ))}

        {/* Pathfinding Trails */}
        {pathfinding && pathfinding.map((path, idx) => (
          <PathfindingTrail key={idx} path={path.waypoints} />
        ))}

        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/60 rounded-lg p-3 text-xs">
        <p className="text-white/80">🤖 Agents: {agents.length}</p>
        <p className="text-cyan-400">💬 Communications: {communications.length}</p>
        <p className="text-pink-400">🛤️ Active Paths: {pathfinding?.length || 0}</p>
      </div>
    </motion.div>
  );
}