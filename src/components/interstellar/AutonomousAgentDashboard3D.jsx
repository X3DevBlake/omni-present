import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Rocket, Zap, BookOpen } from 'lucide-react';

function AgentCore({ agent }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  const color = agent.autonomy_level > 7 ? '#8b5cf6' : '#3b82f6';

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        wireframe
      />
    </mesh>
  );
}

function DecisionOrb({ position, decision }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3;
      meshRef.current.position.y = position[1] + offset;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={decision.effectiveness_score * 2}
      />
    </mesh>
  );
}

export default function AutonomousAgentDashboard3D() {
  const { data: agents = [] } = useQuery({
    queryKey: ['autonomous-interstellar-agents'],
    queryFn: () => base44.entities.AutonomousInterstellarAgent.list('-created_date', 10),
    refetchInterval: 5000
  });

  const topAgent = agents[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-indigo-900/30 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            Autonomous Interstellar AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Agent Visualization */}
          {topAgent && (
            <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

                <AgentCore agent={topAgent} />

                {topAgent.autonomous_decisions_made?.slice(0, 8).map((decision, idx) => {
                  const angle = (idx / 8) * Math.PI * 2;
                  const radius = 3;
                  const position = [
                    Math.cos(angle) * radius,
                    Math.sin(idx * 0.5),
                    Math.sin(angle) * radius
                  ];
                  
                  return (
                    <DecisionOrb
                      key={idx}
                      position={position}
                      decision={decision}
                    />
                  );
                })}

                <OrbitControls enableDamping dampingFactor={0.05} />
              </Canvas>
            </div>
          )}

          {/* Agent Stats */}
          {agents.length > 0 ? (
            <div className="space-y-4">
              {agents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="bg-gray-800/50 rounded-lg p-4 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-white">{agent.agent_name}</div>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      {agent.specialization}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-xs text-blue-400">Autonomy Level</div>
                      <div className="text-lg font-bold text-white">{agent.autonomy_level}/10</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2">
                      <div className="text-xs text-green-400">AI Confidence</div>
                      <div className="text-lg font-bold text-white">{(agent.ai_confidence_level * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-purple-500/10 rounded p-2">
                      <div className="text-xs text-purple-400">Simulations</div>
                      <div className="text-lg font-bold text-white">{agent.interstellar_experience?.simulations_completed || 0}</div>
                    </div>
                    <div className="bg-cyan-500/10 rounded p-2">
                      <div className="text-xs text-cyan-400">FTL Success</div>
                      <div className="text-lg font-bold text-white">{agent.interstellar_experience?.successful_ftl_communications || 0}</div>
                    </div>
                  </div>

                  {agent.learned_protocols && agent.learned_protocols.length > 0 && (
                    <div className="bg-indigo-500/10 rounded p-3">
                      <div className="text-xs text-indigo-400 font-semibold mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Learned Protocols ({agent.learned_protocols.length}):
                      </div>
                      {agent.learned_protocols.slice(0, 2).map((protocol, idx) => (
                        <div key={idx} className="text-xs text-gray-300 mb-1">
                          • {protocol.protocol_name} (+{(protocol.improvement_over_baseline * 100).toFixed(0)}% improvement)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No autonomous agents yet. Run interstellar simulations to spawn AI agents.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}