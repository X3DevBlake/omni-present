import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function CouncilMemberNode({ member, position, voting }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!voting) return;
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.3 : 1);
    }, 800);
    return () => clearInterval(interval);
  }, [voting]);

  const colors = {
    utilitarian: '#3b82f6',
    deontological: '#8b5cf6',
    virtue_ethics: '#22c55e',
    care_ethics: '#f59e0b',
    rights_based: '#ef4444',
    justice_oriented: '#06b6d4',
    pragmatic: '#a855f7'
  };

  const color = colors[member.specialization] || '#6b7280';

  return (
    <group position={position}>
      <Sphere args={[0.3 * pulse, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={voting ? 0.8 : 0.4}
          metalness={0.7}
        />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white" maxWidth={3}>
        {member.ai_agent_name}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="#a0a0a0">
        {member.specialization.replace(/_/g, ' ')}
      </Text>
    </group>
  );
}

function DebateLine({ from, to, active }) {
  return (
    <Line
      points={[from, to]}
      color="#8b5cf6"
      lineWidth={active ? 2 : 0.5}
      opacity={active ? 0.6 : 0.2}
    />
  );
}

export default function EthicalCouncilViz3D() {
  const [debating, setDebating] = useState(false);
  const queryClient = useQueryClient();

  const { data: councilMembers } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: () => base44.entities.EthicalCouncilMember.list(),
    initialData: []
  });

  const { data: proposals } = useQuery({
    queryKey: ['ethicalProposals'],
    queryFn: () => base44.entities.EthicalProposal.list('-created_date', 20),
    initialData: []
  });

  const debateMutation = useMutation({
    mutationFn: ({ proposal_id }) =>
      base44.functions.invoke('ethicalCouncilDebate', { proposal_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ethicalProposals']);
      queryClient.invalidateQueries(['councilMembers']);
      setDebating(true);
      setTimeout(() => setDebating(false), 4000);
    }
  });

  // Position council members in circle
  const memberPositions = councilMembers.map((member, idx) => {
    const angle = (idx / councilMembers.length) * Math.PI * 2;
    const radius = 5;
    return {
      member,
      position: [Math.cos(angle) * radius, Math.sin(idx * 0.3), Math.sin(angle) * radius]
    };
  });

  const latestProposal = proposals[0];
  const approvedCount = proposals.filter(p => p.status === 'approved').length;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-violet-400" />
          AI Ethical Council
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 5, 0]} intensity={1.5} color="#a855f7" />
            
            {/* Central Proposal */}
            {latestProposal && (
              <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color={latestProposal.status === 'approved' ? '#22c55e' : '#8b5cf6'}
                  emissive={latestProposal.status === 'approved' ? '#22c55e' : '#8b5cf6'}
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )}

            {/* Council Members */}
            {memberPositions.map(({ member, position }) => (
              <CouncilMemberNode
                key={member.member_id}
                member={member}
                position={position}
                voting={debating}
              />
            ))}

            {/* Debate Lines */}
            {memberPositions.map(({ position }, idx) => (
              <DebateLine
                key={idx}
                from={position}
                to={[0, 0, 0]}
                active={debating}
              />
            ))}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.4} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-violet-950/30 border border-violet-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Members</span>
            </div>
            <div className="text-2xl font-bold text-white">{councilMembers.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-400" />
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

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Impact</span>
            </div>
            <div className="text-lg font-bold text-white">
              {latestProposal?.impact_simulation_results?.ethical_score_delta ? 
                `+${Math.round(latestProposal.impact_simulation_results.ethical_score_delta * 100)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {latestProposal && (
          <Button
            onClick={() => debateMutation.mutate({ proposal_id: latestProposal.proposal_id })}
            disabled={debateMutation.isPending || latestProposal.status !== 'proposed'}
            className="w-full mb-4 bg-violet-600 hover:bg-violet-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {debateMutation.isPending ? 'Debating...' : 'Initiate Council Debate'}
          </Button>
        )}

        {latestProposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-950/30 border border-violet-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-2">Latest Proposal</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <Badge className="bg-purple-600">{latestProposal.proposal_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge className={
                  latestProposal.status === 'approved' ? 'bg-green-600' :
                  latestProposal.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
                }>
                  {latestProposal.status}
                </Badge>
              </div>
              
              {latestProposal.votes && (
                <div className="pt-2 border-t border-violet-700">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-green-400 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {latestProposal.votes.approve}
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" /> {latestProposal.votes.reject}
                    </span>
                  </div>
                </div>
              )}

              {latestProposal.council_debate_log && latestProposal.council_debate_log.length > 0 && (
                <div className="pt-2 border-t border-violet-700 max-h-40 overflow-y-auto">
                  <div className="text-xs text-gray-400 mb-2">Council Debate:</div>
                  {latestProposal.council_debate_log.slice(0, 3).map((debate, idx) => (
                    <div key={idx} className="bg-black/40 p-2 rounded mb-1">
                      <div className="text-white text-xs mb-1">{debate.statement.slice(0, 100)}...</div>
                      <Badge className="text-[10px]" variant="outline">{debate.stance}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}