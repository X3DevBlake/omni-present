import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cone, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';

const AgentNode = ({ position, agent, level, onClick }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const hover = 0.1 * Math.sin(state.clock.elapsedTime * 2 + level);
      meshRef.current.position.y = position[1] + hover;
    }
  });

  const colors = {
    overseer: '#8b5cf6',
    manager: '#3b82f6',
    worker: '#10b981'
  };

  const sizes = {
    overseer: 0.6,
    manager: 0.4,
    worker: 0.25
  };

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[sizes[agent.type], 32, 32]}>
        <meshStandardMaterial
          color={colors[agent.type]}
          emissive={colors[agent.type]}
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Html distanceFactor={8}>
        <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          {agent.name}
        </div>
      </Html>
    </group>
  );
};

export default function HAASSwarmVisualizer3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(true);

  // Hierarchical structure
  const swarm = {
    overseer: { name: 'Supreme Oversight Board', type: 'overseer', pos: [0, 4, 0] },
    managers: [
      { name: 'Vision Manager', type: 'manager', pos: [-3, 1, 0] },
      { name: 'Logic Manager', type: 'manager', pos: [0, 1, 0] },
      { name: 'Motor Manager', type: 'manager', pos: [3, 1, 0] }
    ],
    workers: [
      { name: 'CAD Fetch', type: 'worker', pos: [-4, -2, 0] },
      { name: 'Trap Path', type: 'worker', pos: [-2, -2, 0] },
      { name: 'Mesh Opt', type: 'worker', pos: [0, -2, 0] },
      { name: 'Physics Sim', type: 'worker', pos: [2, -2, 0] },
      { name: 'Render', type: 'worker', pos: [4, -2, 0] }
    ]
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Cone className="w-5 h-5 text-purple-400" />
            Hierarchical Autonomous Agent Swarm (HAAS)
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

            {/* Supreme Oversight Board */}
            <AgentNode
              position={swarm.overseer.pos}
              agent={swarm.overseer}
              level={0}
            />

            {/* Manager Layer */}
            {swarm.managers.map((manager, idx) => (
              <React.Fragment key={`manager-${idx}`}>
                <AgentNode
                  position={manager.pos}
                  agent={manager}
                  level={1}
                />
                {/* Connection to overseer */}
                <Line
                  points={[swarm.overseer.pos, manager.pos]}
                  color="#8b5cf6"
                  lineWidth={2}
                  transparent
                  opacity={0.6}
                />
              </React.Fragment>
            ))}

            {/* Worker Layer */}
            {swarm.workers.map((worker, idx) => {
              const managerIdx = Math.floor(idx / 2) % swarm.managers.length;
              return (
                <React.Fragment key={`worker-${idx}`}>
                  <AgentNode
                    position={worker.pos}
                    agent={worker}
                    level={2}
                  />
                  {/* Connection to manager */}
                  <Line
                    points={[swarm.managers[managerIdx].pos, worker.pos]}
                    color="#3b82f6"
                    lineWidth={1}
                    transparent
                    opacity={0.4}
                  />
                </React.Fragment>
              );
            })}

            {/* Task flow visualization */}
            {isRunning && (
              <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={1}
                />
              </Sphere>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-3">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-300">Overseer (SOB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Managers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Workers</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            C_s(t + 1) = C_s(t) + Σ Interact(A_i, A_i+1)
            <br />
            <span className="text-purple-400">Swarm capability grows through recursive agent interaction</span>
          </div>

          <p className="text-sm text-gray-300">
            HAAS architecture prevents spec drift by implementing Global Workspace Theory. 
            Agents compete for broadcast access, ensuring alignment with user intent.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}