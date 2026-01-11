import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function Agent3D({ position, color, name }) {
  const meshRef = useRef();
  const velocityRef = useRef([
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += velocityRef.current[0];
      meshRef.current.position.y += velocityRef.current[1];
      meshRef.current.position.z += velocityRef.current[2];

      // Bounce boundaries
      if (Math.abs(meshRef.current.position.x) > 10) velocityRef.current[0] *= -1;
      if (Math.abs(meshRef.current.position.y) > 10) velocityRef.current[1] *= -1;
      if (Math.abs(meshRef.current.position.z) > 10) velocityRef.current[2] *= -1;

      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 2]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        metalness={0.8}
        roughness={0.1}
      />
    </mesh>
  );
}

function InteractionLine({ from, to }) {
  const pointsRef = useRef();

  useFrame(() => {
    if (pointsRef.current && pointsRef.current.geometry) {
      pointsRef.current.geometry.attributes.position.array[0] = from[0];
      pointsRef.current.geometry.attributes.position.array[1] = from[1];
      pointsRef.current.geometry.attributes.position.array[2] = from[2];
      pointsRef.current.geometry.attributes.position.array[3] = to[0];
      pointsRef.current.geometry.attributes.position.array[4] = to[1];
      pointsRef.current.geometry.attributes.position.array[5] = to[2];
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line>
      <bufferGeometry ref={pointsRef}>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([from[0], from[1], from[2], to[0], to[1], to[2]])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#a855f7"
        transparent={true}
        opacity={0.2}
        linewidth={1}
      />
    </line>
  );
}

export default function MultiAgentWorld3D() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const mockAgents = [
      { id: 1, position: [-5, 0, -5], color: '#00f5ff', name: 'Agent-A1' },
      { id: 2, position: [5, 0, -5], color: '#a855f7', name: 'Agent-B2' },
      { id: 3, position: [-5, 5, 5], color: '#ec4899', name: 'Agent-C3' },
      { id: 4, position: [5, 5, 5], color: '#3b82f6', name: 'Agent-D4' },
      { id: 5, position: [0, -3, 0], color: '#10b981', name: 'Agent-E5' },
      { id: 6, position: [0, 3, 0], color: '#f59e0b', name: 'Agent-F6' }
    ];
    setAgents(mockAgents);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

        <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.1}>
          <group>
            {/* Agents */}
            {agents.map(agent => (
              <Agent3D
                key={agent.id}
                position={agent.position}
                color={agent.color}
                name={agent.name}
              />
            ))}

            {/* Interaction lines between agents */}
            {agents.slice(0, 3).map((agent, idx) => (
              <InteractionLine
                key={`line-${idx}`}
                from={agent.position}
                to={agents[(idx + 1) % agents.length].position}
              />
            ))}

            {/* Central reference sphere */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.2}
                transparent={true}
                opacity={0.3}
                wireframe={true}
              />
            </mesh>
          </group>
        </Float>

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.2} />
      </Canvas>

      {/* Agent Stats */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-bold text-sm mb-3">Active Agents ({agents.length})</h3>
        <div className="space-y-2">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <span className="text-white/70">{agent.name}</span>
              <span className="text-cyan-400 ml-auto">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Society Stats */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4">
        <div className="text-xs space-y-2">
          <div className="flex justify-between text-white/70">
            <span>Total Interactions:</span>
            <span className="text-purple-400">147</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Emergent Behaviors:</span>
            <span className="text-purple-400">8</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Resource Transfers:</span>
            <span className="text-purple-400">32</span>
          </div>
        </div>
      </div>
    </div>
  );
}