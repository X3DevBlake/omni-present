import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, MeshDistortMaterial } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Rocket, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function ProtocolNode({ proposal, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  const statusColor = {
    'proposed': '#3b82f6',
    'simulating': '#8b5cf6',
    'testing': '#ec4899',
    'approved': '#22c55e',
    'deployed': '#10b981',
    'rejected': '#ef4444'
  }[proposal.status] || '#3b82f6';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.5, 2]} />
        <MeshDistortMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.5}
          distort={0.3}
          speed={2}
        />
      </mesh>
      <Html distanceFactor={8}>
        <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="font-bold">{proposal.protocol_name}</div>
          <div className="text-cyan-400">Confidence: {(proposal.ai_confidence_score * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

export default function ProtocolEvolutionVisualizer3D() {
  const [userFeedback, setUserFeedback] = useState('');
  const queryClient = useQueryClient();

  const { data: proposals = [] } = useQuery({
    queryKey: ['protocol-proposals'],
    queryFn: () => base44.entities.RedCommProtocolProposal.list('-created_date', 10),
    refetchInterval: 5000
  });

  const generateProtocolMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('redcomm/protocolEvolutionEngine', {});
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`New protocol proposed: ${data.proposal.protocol_name}`);
      queryClient.invalidateQueries({ queryKey: ['protocol-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['omega-sentient-status'] });
    },
    onError: (error) => {
      toast.error(`Protocol generation failed: ${error.message}`);
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (proposalId) => {
      await base44.entities.RedCommProtocolProposal.update(proposalId, {
        user_feedback: userFeedback,
        status: 'testing'
      });
      return { proposalId };
    },
    onSuccess: () => {
      toast.success('Feedback submitted to AI');
      setUserFeedback('');
      queryClient.invalidateQueries({ queryKey: ['protocol-proposals'] });
    }
  });

  const proposedCount = proposals.filter(p => p.status === 'proposed').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-purple-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-purple-400" />
            Protocol Evolution Engine - AI Proposals
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {proposedCount} Proposed
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              {approvedCount} Approved
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generate New Protocol */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
            <Button
              onClick={() => generateProtocolMutation.mutate()}
              disabled={generateProtocolMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generateProtocolMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Analyzing Network Evolution...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate New Protocol Proposal
                </>
              )}
            </Button>
          </div>

          {/* 3D Protocol Visualization */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />

              {proposals.slice(0, 8).map((proposal, idx) => {
                const angle = (idx / 8) * Math.PI * 2;
                const radius = 3;
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx) * 1.5,
                  Math.sin(angle) * radius
                ];
                
                return (
                  <ProtocolNode
                    key={proposal.id}
                    proposal={proposal}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Protocol Details */}
          <div className="space-y-3">
            {proposals.slice(0, 3).map((proposal) => (
              <div key={proposal.id} className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white">{proposal.protocol_name}</div>
                  <Badge variant="outline" className={
                    proposal.status === 'proposed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                    proposal.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    'bg-purple-500/20 text-purple-400 border-purple-500/50'
                  }>
                    {proposal.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-300 mb-3">{proposal.protocol_description}</p>

                {proposal.technical_specifications && (
                  <div className="bg-black/30 rounded p-3 mb-3 text-xs space-y-1">
                    <div className="text-purple-400 font-semibold mb-2">Technical Specs:</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modulation:</span>
                      <span className="text-white">{proposal.technical_specifications.modulation_scheme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency Gain:</span>
                      <span className="text-green-400">+{proposal.technical_specifications.bandwidth_efficiency_improvement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Latency Reduction:</span>
                      <span className="text-cyan-400">-{proposal.technical_specifications.latency_reduction_ms}ms</span>
                    </div>
                  </div>
                )}

                {proposal.sentient_reasoning && (
                  <div className="bg-purple-500/10 rounded p-3 mb-3">
                    <div className="text-xs text-purple-400 font-semibold mb-1">AI Sentient Reasoning:</div>
                    <p className="text-xs text-gray-300 italic">"{proposal.sentient_reasoning}"</p>
                  </div>
                )}

                {proposal.status === 'proposed' && (
                  <div className="space-y-2 mt-3">
                    <Textarea
                      placeholder="Provide feedback to the AI..."
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      className="bg-gray-900/50 border-purple-500/30 text-white text-sm h-20"
                    />
                    <Button
                      onClick={() => submitFeedbackMutation.mutate(proposal.id)}
                      disabled={!userFeedback}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Rocket className="w-3 h-3 mr-2" />
                      Submit Feedback & Advance to Testing
                    </Button>
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