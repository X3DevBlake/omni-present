import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Network, Loader2, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

function CollaboratingAgent({ agent, position, isSelected }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(isSelected ? pulse : 0.8);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={isSelected ? "#06b6d4" : "#3b82f6"}
          emissive={isSelected ? "#06b6d4" : "#3b82f6"}
          emissiveIntensity={isSelected ? 2 : 1}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold text-cyan-400">{agent.agent_name}</div>
        </div>
      </Html>
    </group>
  );
}

function SynergyLink({ start, end }) {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color="#06b6d4"
      lineWidth={2}
      opacity={0.6}
      dashed
      dashScale={50}
      dashSize={1}
      dashOffset={0}
    />
  );
}

export default function AgentCollaborationNetwork3D() {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['interstellar-agents'],
    queryFn: () => base44.entities.AutonomousInterstellarAgent.list('-created_date', 10)
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['collaboration-sessions'],
    queryFn: () => base44.entities.AgentCollaborationSession.list('-created_date', 10),
    refetchInterval: 5000
  });

  const collaborate = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('interstellar/agentCollaboration', {
        agentIds: selectedAgents,
        objective: "Design next-generation interstellar communication protocols through collective intelligence"
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.synergies_found} synergies discovered! ${data.next_gen_protocols_created} protocols created.`);
      setSelectedAgents([]);
      queryClient.invalidateQueries({ queryKey: ['collaboration-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['proposed-protocols'] });
    }
  });

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-blue-900/30 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-400" />
            Agent Collaboration Network - Collective Intelligence
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {sessions.length} Sessions
            </Badge>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              <Users className="w-3 h-3 mr-1" />
              {selectedAgents.length} Selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2 bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">Select agents to collaborate:</div>
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <Checkbox
                  checked={selectedAgents.includes(agent.agent_id)}
                  onCheckedChange={() => toggleAgent(agent.agent_id)}
                />
                <span className="text-white text-sm">{agent.agent_name}</span>
                <Badge variant="outline" className="text-xs bg-indigo-500/20 text-indigo-400">
                  {agent.specialization}
                </Badge>
              </div>
            ))}
            <Button
              onClick={() => collaborate.mutate()}
              disabled={selectedAgents.length < 2 || collaborate.isPending}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
            >
              {collaborate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Collaborating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Initiate Collaboration
                </>
              )}
            </Button>
          </div>

          {/* 3D Network */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#06b6d4" />

              {agents.slice(0, 8).map((agent, idx) => {
                const angle = (idx / 8) * Math.PI * 2;
                const radius = 4;
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx * 0.5),
                  Math.sin(angle) * radius
                ];
                
                return (
                  <CollaboratingAgent
                    key={agent.id}
                    agent={agent}
                    position={position}
                    isSelected={selectedAgents.includes(agent.agent_id)}
                  />
                );
              })}

              {selectedAgents.length > 1 && agents.slice(0, 8).map((agent1, i) => 
                agents.slice(i + 1, 8).map((agent2, j) => {
                  if (selectedAgents.includes(agent1.agent_id) && selectedAgents.includes(agent2.agent_id)) {
                    const angle1 = (i / 8) * Math.PI * 2;
                    const angle2 = ((i + j + 1) / 8) * Math.PI * 2;
                    const radius = 4;
                    return (
                      <SynergyLink
                        key={`${i}-${j}`}
                        start={[Math.cos(angle1) * radius, Math.sin(i * 0.5), Math.sin(angle1) * radius]}
                        end={[Math.cos(angle2) * radius, Math.sin((i + j + 1) * 0.5), Math.sin(angle2) * radius]}
                      />
                    );
                  }
                  return null;
                })
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Session History */}
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                    {session.participating_agents.length} Agents
                  </Badge>
                </div>

                <div className="bg-blue-500/10 rounded p-3 mb-2">
                  <div className="text-xs text-blue-400 font-semibold mb-1">Collective Analysis:</div>
                  <p className="text-xs text-gray-300">{session.collective_analysis}</p>
                </div>

                {session.synergistic_improvements && session.synergistic_improvements.length > 0 && (
                  <div className="bg-green-500/10 rounded p-3">
                    <div className="text-xs text-green-400 font-semibold mb-2">
                      Synergies ({session.synergistic_improvements.length}):
                    </div>
                    {session.synergistic_improvements.slice(0, 2).map((syn, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {syn.improvement} (score: {syn.synergy_score})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}