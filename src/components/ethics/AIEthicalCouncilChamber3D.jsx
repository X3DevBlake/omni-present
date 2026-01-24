import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Vote, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function CouncilAgentNode({ agent, position, vote, debating }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!debating) return;
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.3 : 1);
    }, 600);
    return () => clearInterval(interval);
  }, [debating]);

  const color = vote === 'support' ? '#22c55e' :
                vote === 'oppose' ? '#ef4444' : '#6b7280';

  return (
    <group position={position}>
      <Sphere args={[0.3 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={debating ? 0.8 : 0.3}
          metalness={0.7}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white">
        {agent.slice(0, 8)}
      </Text>
    </group>
  );
}

function DebateVisualization({ transcript }) {
  return (
    <group>
      {transcript?.slice(0, 8).map((entry, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const radius = 2;
        const height = idx * 0.3;
        
        return (
          <Box
            key={idx}
            args={[0.2, 0.2, 0.2]}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <meshStandardMaterial 
              color={entry.position === 'support' ? '#22c55e' : '#ef4444'}
              emissive={entry.position === 'support' ? '#22c55e' : '#ef4444'}
              emissiveIntensity={0.5}
            />
          </Box>
        );
      })}
    </group>
  );
}

export default function AIEthicalCouncilChamber3D() {
  const [activeDebate, setActiveDebate] = useState(null);
  const queryClient = useQueryClient();

  const { data: proposals } = useQuery({
    queryKey: ['councilProposals'],
    queryFn: () => base44.entities.AICouncilProposal.list('-created_date', 20),
    initialData: []
  });

  const { data: debates } = useQuery({
    queryKey: ['councilDebates'],
    queryFn: () => base44.entities.EthicalCouncilDebate.list('-created_date', 10),
    initialData: []
  });

  const createProposal = useMutation({
    mutationFn: () => 
      base44.functions.invoke('aiEthicalCouncil', { action: 'create_proposal' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['councilProposals']);
    }
  });

  const initiateDebate = useMutation({
    mutationFn: ({ proposal_id }) => 
      base44.functions.invoke('aiEthicalCouncil', { 
        action: 'initiate_debate',
        proposal_id
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['councilDebates']);
      queryClient.invalidateQueries(['councilProposals']);
      setActiveDebate(data.data.debate);
    }
  });

  const councilAgents = ['ethical_ai_001', 'ethical_ai_002', 'ethical_ai_003', 'ethical_ai_004', 'ethical_ai_005'];
  
  const agentPositions = councilAgents.map((agent, idx) => {
    const angle = (idx / councilAgents.length) * Math.PI * 2;
    const radius = 4;
    return {
      agent,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
    };
  });

  const latestDebate = debates[0];
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const debatingCount = proposals.filter(p => p.status === 'debating').length;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-indigo-400" />
          AI Ethical Council Chamber
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 6, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 10, 0]} intensity={2} color="#8b5cf6" />
            
            {/* Council Table (center) */}
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[3, 3, 0.1, 32]} />
              <meshStandardMaterial 
                color="#1e1b4b"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Council Agents */}
            {agentPositions.map(({ agent, position }) => {
              const vote = latestDebate?.debate_transcript?.find(t => t.agent_id === agent)?.position;
              return (
                <CouncilAgentNode
                  key={agent}
                  agent={agent}
                  position={position}
                  vote={vote}
                  debating={latestDebate && !latestDebate.voting_results?.final_decision}
                />
              );
            })}

            {/* Debate Visualization */}
            {latestDebate && (
              <DebateVisualization transcript={latestDebate.debate_transcript} />
            )}

            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.2} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Proposals</span>
            </div>
            <div className="text-2xl font-bold text-white">{proposals.length}</div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Approved</span>
            </div>
            <div className="text-2xl font-bold text-white">{approvedCount}</div>
          </div>

          <div className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Debating</span>
            </div>
            <div className="text-2xl font-bold text-white">{debatingCount}</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Vote className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Debates</span>
            </div>
            <div className="text-2xl font-bold text-white">{debates.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => createProposal.mutate()}
            disabled={createProposal.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Propose Principle
          </Button>

          <Button
            onClick={() => proposals[0] && initiateDebate.mutate({ proposal_id: proposals[0].proposal_id })}
            disabled={initiateDebate.isPending || !proposals[0]}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Initiate Debate
          </Button>
        </div>

        {latestDebate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Latest Council Debate
            </h3>
            
            {latestDebate.voting_results && (
              <div className="mb-3 p-3 bg-black/40 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Voting Results:</span>
                  <Badge className={latestDebate.voting_results.final_decision === 'approved' ? 'bg-green-600' : 'bg-red-600'}>
                    {latestDebate.voting_results.final_decision}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-green-400" />
                    <span className="text-white">{latestDebate.voting_results.approve}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3 text-red-400" />
                    <span className="text-white">{latestDebate.voting_results.reject}</span>
                  </div>
                  <div className="text-gray-400">{latestDebate.voting_results.abstain} abstain</div>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {latestDebate.debate_transcript?.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="bg-black/40 p-2 rounded text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-indigo-300 font-bold">{entry.agent_id}</span>
                    <Badge variant="outline" className={
                      entry.position === 'support' ? 'border-green-500 text-green-400' :
                      entry.position === 'oppose' ? 'border-red-500 text-red-400' : 'border-gray-500'
                    }>
                      {entry.position}
                    </Badge>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{entry.argument}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}