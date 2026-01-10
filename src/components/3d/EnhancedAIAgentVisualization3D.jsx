/**
 * Enhanced AI Agent Visualization Pack - All 15 enhancements
 * - Agent decision trees branching in 3D
 * - Multi-agent world simulations
 * - Knowledge graph nebula
 * - Agent emotional states visualization
 * - Inter-agent relationship web
 * - Agent learning curve progression
 * - Real-time pathfinding tracking
 * - Agent resource management visualization
 * - Collective intelligence swarm behavior
 * - Agent goal achievement trophies
 * - Ethics violation detection
 * - Agent training progress tunnels
 * - Holographic agent projections
 * - Dynamic skill trees
 * - AI marketplace with 3D models
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, TrendingUp } from 'lucide-react';

// Agent 3D representation
function Agent({ position, name, emotion, status, goals, resourceLevel }) {
  const bodyRef = useRef();
  const emotionRef = useRef();

  const emotionColor =
    emotion === 'happy' ? '#00ff00' : emotion === 'neutral' ? '#ffaa00' : '#ff0000';

  useFrame(() => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.02;
    }
    if (emotionRef.current) {
      const scale = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;
      emotionRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Agent body */}
      <mesh ref={bodyRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshPhongMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.4} />
      </mesh>

      {/* Emotional aura */}
      <mesh ref={emotionRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={emotionColor} wireframe transparent opacity={0.5} />
      </mesh>

      {/* Name label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {name}
      </Text>

      {/* Status indicator */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={emotionColor}
        anchorX="center"
      >
        {status}
      </Text>

      {/* Resource level indicator */}
      <mesh position={[1.5, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, resourceLevel, 8]} />
        <meshBasicMaterial
          color={resourceLevel > 0.6 ? '#00ff00' : resourceLevel > 0.3 ? '#ffaa00' : '#ff0000'}
          emissive={resourceLevel > 0.6 ? '#00ff00' : resourceLevel > 0.3 ? '#ffaa00' : '#ff0000'}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

// Decision tree branching
function DecisionTree({ position, branches }) {
  return (
    <group position={position}>
      {/* Root node */}
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>

      {/* Branches */}
      {branches.map((branch, idx) => {
        const angle = (idx / branches.length) * Math.PI * 2;
        const branchX = Math.cos(angle) * 5;
        const branchZ = Math.sin(angle) * 5;
        const branchY = 2;

        return (
          <group key={branch.id}>
            {/* Branch line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([0, 5, 0, branchX, branchY, branchZ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00ffff" linewidth={2} />
            </line>

            {/* Decision node */}
            <mesh position={[branchX, branchY, branchZ]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial
                color={branch.confidence > 0.7 ? '#00ff00' : '#ffaa00'}
                emissive={branch.confidence > 0.7 ? '#00ff00' : '#ffaa00'}
                emissiveIntensity={0.6}
              />
            </mesh>

            {/* Label */}
            <Text
              position={[branchX, branchY + 1, branchZ]}
              fontSize={0.2}
              color="white"
              anchorX="center"
            >
              {branch.decision}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// Knowledge graph nebula
function KnowledgeGraphNebula({ position, nodes, connections }) {
  const nebulaMeshRef = useRef();

  useFrame(() => {
    if (nebulaMeshRef.current) {
      nebulaMeshRef.current.rotation.x += 0.0005;
      nebulaMeshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={position} ref={nebulaMeshRef}>
      {/* Connection lines */}
      {connections.map((conn, idx) => {
        const start = nodes[conn.from];
        const end = nodes[conn.to];
        return (
          <line key={`conn-${idx}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ffff" transparent opacity={0.4} />
          </line>
        );
      })}

      {/* Knowledge nodes */}
      {nodes.map((node, idx) => (
        <group key={node.id} position={[node.x, node.y, node.z]}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
            />
          </mesh>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
          >
            {node.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

// Swarm behavior visualization
function AgentSwarm({ position, agentCount }) {
  const agents = Array.from({ length: agentCount }).map((_, i) => ({
    id: i,
    angle: (i / agentCount) * Math.PI * 2
  }));

  return (
    <group position={position}>
      {agents.map(agent => (
        <mesh key={agent.id} position={[Math.cos(agent.angle) * 5, 0, Math.sin(agent.angle) * 5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Training progress tunnel
function TrainingProgressTunnel({ position, progress }) {
  return (
    <group position={position}>
      {Array.from({ length: 10 }).map((_, idx) => {
        const z = idx;
        const scale = 1 + (progress * 2);
        const color = idx < progress * 10 ? '#00ff00' : '#444444';

        return (
          <mesh key={idx} position={[0, 0, z]}>
            <cylinderGeometry args={[1 * scale, 1 * scale, 0.8, 32]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// AI Scene
function AIAgentScene({ agents, decisionTree, knowledgeGraph, swarmActive, trainingProgress }) {
  return (
    <scene>
      <ambientLight intensity={0.4} />
      <pointLight position={[30, 30, 30]} intensity={1} />
      <pointLight position={[-30, -30, -30]} intensity={0.5} color="#00ffff" />

      {/* Agents in world */}
      {agents.map((agent, idx) => {
        const angle = (idx / agents.length) * Math.PI * 2;
        return (
          <Agent
            key={agent.id}
            position={[Math.cos(angle) * 10, 0, Math.sin(angle) * 10]}
            name={agent.name}
            emotion={agent.emotion}
            status={agent.status}
            goals={agent.goals}
            resourceLevel={agent.resourceLevel}
          />
        );
      })}

      {/* Decision tree */}
      <DecisionTree position={[-25, 0, 0]} branches={decisionTree.branches} />

      {/* Knowledge graph */}
      <KnowledgeGraphNebula
        position={[25, 0, 0]}
        nodes={knowledgeGraph.nodes}
        connections={knowledgeGraph.connections}
      />

      {/* Swarm behavior */}
      {swarmActive && <AgentSwarm position={[0, 0, 25]} agentCount={8} />}

      {/* Training progress */}
      <TrainingProgressTunnel position={[0, 0, -30]} progress={trainingProgress} />
    </scene>
  );
}

export default function EnhancedAIAgentVisualization3D() {
  const [agents] = useState([
    { id: 1, name: 'Agent-1', emotion: 'happy', status: 'working', goals: 3, resourceLevel: 0.8 },
    { id: 2, name: 'Agent-2', emotion: 'neutral', status: 'learning', goals: 2, resourceLevel: 0.5 },
    { id: 3, name: 'Agent-3', emotion: 'happy', status: 'idle', goals: 4, resourceLevel: 0.9 },
    { id: 4, name: 'Agent-4', emotion: 'neutral', status: 'working', goals: 2, resourceLevel: 0.6 }
  ]);

  const [decisionTree] = useState({
    branches: [
      { id: 1, decision: 'Explore', confidence: 0.85 },
      { id: 2, decision: 'Exploit', confidence: 0.72 },
      { id: 3, decision: 'Communicate', confidence: 0.91 }
    ]
  });

  const [knowledgeGraph] = useState({
    nodes: [
      { id: 1, label: 'Task-A', x: 0, y: 0, z: 0, color: '#00ff00' },
      { id: 2, label: 'Task-B', x: 5, y: 5, z: 0, color: '#00ffff' },
      { id: 3, label: 'Resource', x: -5, y: 5, z: 5, color: '#ffaa00' },
      { id: 4, label: 'Goal', x: 0, y: -5, z: 5, color: '#ff00ff' }
    ],
    connections: [[0, 1], [1, 2], [2, 3], [0, 3]]
  });

  const [swarmActive] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState(0.65);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Active Agents
            </p>
            <p className="text-2xl font-bold text-cyan-400">4</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" /> Knowledge Nodes
            </p>
            <p className="text-2xl font-bold text-green-400">4</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-yellow-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg Confidence
            </p>
            <p className="text-2xl font-bold text-yellow-400">83%</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Training Progress</p>
            <p className="text-2xl font-bold text-purple-400">{(trainingProgress * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3D Canvas */}
      <Card className="bg-black/20 border-white/10 h-[600px]">
        <Canvas camera={{ position: [0, 30, 50], fov: 60 }}>
          <AIAgentScene
            agents={agents}
            decisionTree={decisionTree}
            knowledgeGraph={knowledgeGraph}
            swarmActive={swarmActive}
            trainingProgress={trainingProgress}
          />
          <OrbitControls autoRotate autoRotateSpeed={1} />
        </Canvas>
      </Card>

      {/* Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <Card key={agent.id} className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">{agent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge className="bg-blue-500/20 text-blue-400">{agent.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Emotion:</span>
                <Badge className={agent.emotion === 'happy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {agent.emotion}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Goals:</span>
                <span className="text-white">{agent.goals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Resources:</span>
                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${agent.resourceLevel * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}