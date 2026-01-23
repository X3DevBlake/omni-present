import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Brain, TrendingUp, Zap, MessageCircle, Target } from 'lucide-react';
import * as THREE from 'three';

function Agent3DNode({ position, agent, isActive, interactions = [] }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (glowRef.current && isActive) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(1.5 + pulse * 0.3);
    }
  });

  const roleColors = {
    'leader': '#f59e0b',
    'analyst': '#3b82f6',
    'executor': '#10b981',
    'negotiator': '#a855f7',
    'supporter': '#ef4444'
  };

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={roleColors[agent.role] || '#ffffff'}
          emissive={roleColors[agent.role] || '#ffffff'}
          emissiveIntensity={isActive ? 0.6 : 0.2}
        />
      </Sphere>
      
      {isActive && (
        <Sphere ref={glowRef} args={[0.4, 16, 16]}>
          <meshBasicMaterial
            color={roleColors[agent.role] || '#ffffff'}
            transparent
            opacity={0.2}
          />
        </Sphere>
      )}

      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {agent.agent_id.slice(0, 8)}
      </Text>
      <Text
        position={[0, 0.35, 0]}
        fontSize={0.08}
        color="#aaa"
        anchorX="center"
      >
        {agent.role}
      </Text>

      {interactions.length > 0 && (
        <mesh position={[0, -0.5, 0]}>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshBasicMaterial color="#00ff00" opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}

function InteractionLine({ from, to, type, animated }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && animated) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const typeColors = {
    'cooperation': '#10b981',
    'negotiation': '#a855f7',
    'competition': '#ef4444',
    'communication': '#3b82f6',
    'resource_sharing': '#f59e0b'
  };

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={typeColors[type] || '#ffffff'}
      lineWidth={2}
      transparent
      opacity={0.4}
      dashed={type === 'negotiation'}
    />
  );
}

function CentralGoal({ emergentBehaviors }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      <Text position={[0, 0.7, 0]} fontSize={0.15} color="white" anchorX="center">
        Group Goal
      </Text>
      {emergentBehaviors > 0 && (
        <Text position={[0, -0.7, 0]} fontSize={0.1} color="#00ff00" anchorX="center">
          {emergentBehaviors} Emergent
        </Text>
      )}
    </group>
  );
}

function MultiAgentScene({ session, activeInteraction }) {
  const agents = session.participating_agents || [];
  const interactions = session.interaction_data || [];
  const emergentCount = session.emergent_behaviors?.length || 0;

  const agentPositions = agents.map((_, idx) => {
    const angle = (idx / agents.length) * Math.PI * 2;
    const radius = 3;
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ];
  });

  const latestInteractions = interactions.slice(-10);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 10, 0]} angle={0.5} intensity={1} color="#00ffff" />

      <Text position={[0, 4, 0]} fontSize={0.3} color="white" anchorX="center">
        Multi-Agent Simulation
      </Text>

      <CentralGoal emergentBehaviors={emergentCount} />

      {agents.map((agent, idx) => (
        <Agent3DNode
          key={agent.agent_id}
          position={agentPositions[idx]}
          agent={agent}
          isActive={activeInteraction?.agent_id === agent.agent_id}
          interactions={latestInteractions.filter(i => i.agent_id === agent.agent_id)}
        />
      ))}

      {latestInteractions.map((interaction, idx) => {
        const fromIdx = agents.findIndex(a => a.agent_id === interaction.agent_id);
        const toIdx = agents.findIndex(a => a.agent_id === interaction.target_agent_id);
        
        if (fromIdx >= 0 && toIdx >= 0) {
          return (
            <InteractionLine
              key={idx}
              from={agentPositions[fromIdx]}
              to={agentPositions[toIdx]}
              type={interaction.interaction_type}
              animated={idx === latestInteractions.length - 1}
            />
          );
        }
        return null;
      })}

      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
}

export default function MultiAgentSimulation3D({ session, onInteraction }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const agents = session.participating_agents || [];
  const interactions = session.interaction_data || [];
  const decisions = session.collective_decisions || [];
  const emergentBehaviors = session.emergent_behaviors || [];
  const metrics = session.group_performance_metrics || {};

  const latestInteraction = interactions[interactions.length - 1];

  return (
    <Card className="bg-black/40 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Multi-Agent Simulation - {session.scenario_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ height: '500px' }}>
              <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
                <MultiAgentScene session={session} activeInteraction={latestInteraction} />
              </Canvas>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-black/60 border border-purple-500/30 rounded-lg p-2 text-center">
                <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-white text-xs font-bold">{agents.length}</div>
                <div className="text-white/60 text-xs">Agents</div>
              </div>
              <div className="bg-black/60 border border-blue-500/30 rounded-lg p-2 text-center">
                <MessageCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-white text-xs font-bold">{interactions.length}</div>
                <div className="text-white/60 text-xs">Interactions</div>
              </div>
              <div className="bg-black/60 border border-green-500/30 rounded-lg p-2 text-center">
                <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-white text-xs font-bold">{decisions.length}</div>
                <div className="text-white/60 text-xs">Decisions</div>
              </div>
              <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-2 text-center">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-white text-xs font-bold">{emergentBehaviors.length}</div>
                <div className="text-white/60 text-xs">Emergent</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-white text-sm font-bold mb-2">Participating Agents</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent.agent_id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full p-2 rounded-lg border transition-all text-left ${
                      selectedAgent?.agent_id === agent.agent_id
                        ? 'bg-purple-500/30 border-purple-400'
                        : 'bg-black/60 border-purple-500/30 hover:bg-purple-500/10'
                    }`}
                  >
                    <div className="text-white font-bold text-xs">{agent.agent_id.slice(0, 10)}</div>
                    <div className="text-white/60 text-xs">Role: {agent.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white text-sm font-bold mb-2">Performance Metrics</div>
              <div className="space-y-2">
                <div className="bg-black/60 border border-green-500/30 rounded-lg p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Collaboration</span>
                    <span className="text-white">{((metrics.collaboration_efficiency || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-1.5">
                    <div 
                      className="bg-green-400 h-1.5 rounded-full"
                      style={{ width: `${(metrics.collaboration_efficiency || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/60 border border-blue-500/30 rounded-lg p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Communication</span>
                    <span className="text-white">{((metrics.communication_quality || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-1.5">
                    <div 
                      className="bg-blue-400 h-1.5 rounded-full"
                      style={{ width: `${(metrics.communication_quality || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/60 border border-purple-500/30 rounded-lg p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Synergy</span>
                    <span className="text-white">{((metrics.synergy_level || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-1.5">
                    <div 
                      className="bg-purple-400 h-1.5 rounded-full"
                      style={{ width: `${(metrics.synergy_level || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-white text-sm font-bold mb-2">Emergent Behaviors</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {emergentBehaviors.map((behavior, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/60 border border-yellow-500/30 rounded-lg p-2"
                  >
                    <div className="text-white text-xs font-bold">{behavior.behavior_type}</div>
                    <div className="text-white/60 text-xs">{behavior.description}</div>
                    <Badge className="mt-1 bg-yellow-500/30 text-yellow-300 text-xs">
                      Innovation: {(behavior.innovation_score * 100).toFixed(0)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            <Badge className="w-full justify-center py-2" variant={
              session.session_status === 'completed' ? 'default' :
              session.session_status === 'running' ? 'secondary' : 'outline'
            }>
              {session.session_status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}