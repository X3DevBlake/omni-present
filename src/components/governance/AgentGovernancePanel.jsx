import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Vote, CheckCircle2, XCircle, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentGovernancePanel({ agentId }) {
  const queryClient = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    treasuryAmount: 0
  });

  const { data: proposals } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: () => base44.entities.GovernanceProposal.filter({ status: 'active' }, '-created_date', 20)
  });

  const { data: agentReputation } = useQuery({
    queryKey: ['agent-reputation', agentId],
    queryFn: () => agentId
      ? base44.entities.AgentReputation.filter({ agent_id: agentId }, '', 1)
      : Promise.resolve([]),
    enabled: !!agentId
  });

  const createProposal = useMutation({
    mutationFn: async (proposalData) => {
      const response = await base44.functions.invoke('createAgentProposal', {
        agent_id: agentId,
        proposal_title: proposalData.title,
        proposal_description: proposalData.description,
        requested_treasury_amount: proposalData.treasuryAmount
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      setShowProposalForm(false);
      setNewProposal({ title: '', description: '', treasuryAmount: 0 });
    }
  });

  const castVote = useMutation({
    mutationFn: async ({ proposal_id, vote_choice }) => {
      const response = await base44.functions.invoke('castReputationBasedVote', {
        proposal_id,
        voter_id: agentId,
        voter_type: 'agent',
        vote_choice
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
    }
  });

  const votingPower = agentReputation?.[0]?.reputation_score 
    ? Math.min(100, agentReputation[0].reputation_score / 10)
    : 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Agent Governance</h3>
          <p className="text-white/60 text-sm">
            Voting Power: <span className="text-purple-400 font-bold">{votingPower.toFixed(1)}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowProposalForm(!showProposalForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Create Proposal
        </Button>
      </div>

      <AnimatePresence>
        {showProposalForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Create New Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Proposal Title</label>
                  <Input
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., Increase Agent Training Budget"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Description</label>
                  <Textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Detailed proposal description..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Treasury Request Amount</label>
                  <Input
                    type="number"
                    value={newProposal.treasuryAmount}
                    onChange={(e) => setNewProposal({ ...newProposal, treasuryAmount: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => createProposal.mutate(newProposal)}
                    disabled={!newProposal.title || createProposal.isPending}
                    className="flex-1 bg-purple-600"
                  >
                    Submit Proposal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProposalForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {proposals?.map(proposal => (
          <Card key={proposal.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{proposal.proposal_title}</CardTitle>
                <div className="flex items-center gap-2">
                  {proposal.proposer_type === 'agent' && (
                    <Badge className="bg-purple-500">Agent Proposed</Badge>
                  )}
                  <Badge className={
                    proposal.status === 'approved' ? 'bg-green-500' :
                    proposal.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {proposal.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">{proposal.proposal_description}</p>

              {proposal.requested_funds > 0 && (
                <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">Treasury Request:</span>
                    <span className="text-white font-bold">${proposal.requested_funds}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-white/60 text-xs">For</span>
                  </div>
                  <div className="text-white font-bold">{proposal.votes_for || 0}</div>
                  <div className="text-green-400 text-xs">
                    Power: {proposal.total_voting_power_for?.toFixed(1) || 0}
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-white/60 text-xs">Against</span>
                  </div>
                  <div className="text-white font-bold">{proposal.votes_against || 0}</div>
                  <div className="text-red-400 text-xs">
                    Power: {proposal.total_voting_power_against?.toFixed(1) || 0}
                  </div>
                </div>
              </div>

              {proposal.status === 'active' && agentId && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => castVote.mutate({ proposal_id: proposal.id, vote_choice: 'for' })}
                    disabled={castVote.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Vote className="w-4 h-4 mr-1" />
                    Vote For
                  </Button>
                  <Button
                    onClick={() => castVote.mutate({ proposal_id: proposal.id, vote_choice: 'against' })}
                    disabled={castVote.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <Vote className="w-4 h-4 mr-1" />
                    Vote Against
                  </Button>
                </div>
              )}

              {proposal.blockchain_verification?.verified_on_chain && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
                  <div className="text-blue-300 text-xs">
                    ✓ Verified on-chain • Block #{proposal.blockchain_verification.block_number}
                  </div>
                  <div className="text-white/60 text-xs font-mono mt-1">
                    {proposal.blockchain_verification.transaction_hash?.slice(0, 20)}...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!proposals?.length && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No active proposals</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}