import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MessageCircle } from 'lucide-react';
import * as THREE from 'three';

function SwarmAgent({ position, agent, interactionCount }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + interactionCount) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      glowRef.current.rotation.x += 0.01;
      glowRef.current.rotation.z += 0.01;
    }
  });

  const activityLevel = interactionCount / 10;
  const color = new THREE.Color().setHSL(0.6 - activityLevel * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5 + activityLevel * 0.3}
        />
      </Sphere>
      
      <Sphere ref={glowRef} args={[0.35, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>

      <Text position={[0, 0.4, 0]} fontSize={0.1} color="white" anchorX="center">
        Agent {agent.slice(0, 4)}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="#00ff00" anchorX="center">
        {interactionCount} acts
      </Text>
    </group>
  );
}

function InteractionBeam({ from, to, type, timestamp }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      const age = (Date.now() - new Date(timestamp).getTime()) / 1000;
      lineRef.current.material.opacity = Math.max(0.1, 1 - age / 10);
    }
  });

  const typeColors = {
    'message': '#00ffff',
    'task_delegation': '#ff00ff',
    'knowledge_sharing': '#ffff00',
    'resource_transfer': '#00ff00'
  };

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={typeColors[type] || '#ffffff'}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

function SwarmScene({ collaboration }) {
  const agents = collaboration.participating_agents || [];
  const interactions = collaboration.interaction_history?.slice(-20) || [];

  const agentPositions = agents.map((agent, idx) => {
    const angle = (idx / agents.length) * Math.PI * 2;
    const radius = 3;
    return {
      agent: agent.agent_id,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
    };
  });

  const interactionCounts = agents.reduce((acc, agent) => {
    acc[agent.agent_id] = interactions.filter(i => 
      i.from_agent_id === agent.agent_id || i.to_agent_id === agent.agent_id
    ).length;
    return acc;
  }, {});

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#8b5cf6" />

      <Text position={[0, 3.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Swarm Intelligence Network
      </Text>

      <Sphere position={[0, 0, 0]} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#4f46e5"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>

      {agentPositions.map(({ agent, position }, idx) => (
        <SwarmAgent
          key={agent}
          position={position}
          agent={agent}
          interactionCount={interactionCounts[agent] || 0}
        />
      ))}

      {interactions.map((interaction, idx) => {
        const fromPos = agentPositions.find(a => a.agent === interaction.from_agent_id);
        const toPos = agentPositions.find(a => a.agent === interaction.to_agent_id);
        
        if (fromPos && toPos) {
          return (
            <InteractionBeam
              key={idx}
              from={fromPos.position}
              to={toPos.position}
              type={interaction.interaction_type}
              timestamp={interaction.timestamp}
            />
          );
        }
        return null;
      })}

      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function SwarmInteractionVisualizer3D({ collaboration }) {
  const agents = collaboration.participating_agents || [];
  const interactions = collaboration.interaction_history || [];
  const metrics = collaboration.collaboration_metrics || {};

  const recentInteractions = interactions.slice(-10);

  return (
    <Card className="bg-black/40 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          Real-Time Swarm Interactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ height: '500px' }}>
              <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
                <SwarmScene collaboration={collaboration} />
              </Canvas>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/60 border border-indigo-500/30 rounded-lg p-3 text-center">
                <div className="text-indigo-400 text-2xl font-bold">
                  {((metrics.coordination_quality || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-white/60 text-xs">Coordination</div>
              </div>
              <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-2xl font-bold">
                  {((metrics.synergy_score || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-white/60 text-xs">Synergy</div>
              </div>
              <div className="bg-black/60 border border-pink-500/30 rounded-lg p-3 text-center">
                <div className="text-pink-400 text-2xl font-bold">
                  {((metrics.efficiency_rating || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-white/60 text-xs">Efficiency</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-white text-sm font-bold mb-2">Recent Interactions</div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {recentInteractions.map((interaction, idx) => (
                  <div
                    key={idx}
                    className="bg-black/60 border border-indigo-500/30 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <MessageCircle className="w-3 h-3 text-indigo-400" />
                      <span className="text-white text-xs font-bold">{interaction.interaction_type}</span>
                    </div>
                    <div className="text-white/60 text-xs">
                      From: {interaction.from_agent_id?.slice(0, 8)} → To: {interaction.to_agent_id?.slice(0, 8)}
                    </div>
                    <Badge className="mt-1 bg-green-500/30 text-green-300 text-xs">
                      {interaction.outcome}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}