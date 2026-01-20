import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Vote, Coins, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GovernanceImpact3D from './GovernanceImpact3D';

export default function EnhancedGovernanceHub() {
  const queryClient = useQueryClient();
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [requestedFunds, setRequestedFunds] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: proposals } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: () => base44.entities.GovernanceProposal.list('-created_date', 20),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 20),
  });

  const { data: impactMetrics } = useQuery({
    queryKey: ['governance-impacts'],
    queryFn: () => base44.entities.GovernanceImpactMetric.list('-decision_date', 20),
  });

  const { data: treasury } = useQuery({
    queryKey: ['treasury'],
    queryFn: () => base44.entities.Treasury.list('', 1),
  });

  const createAgentProposal = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createAgentProposal', {
        agent_id: selectedAgent,
        proposal_title: proposalTitle,
        proposal_description: proposalDesc,
        requested_treasury_amount: requestedFunds
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      setProposalTitle('');
      setProposalDesc('');
      setRequestedFunds(0);
    }
  });

  const castVote = useMutation({
    mutationFn: async ({ proposalId, voteChoice, voterType }) => {
      const response = await base44.functions.invoke('castReputationBasedVote', {
        proposal_id: proposalId,
        voter_id: voterType === 'agent' ? selectedAgent : 'user-001',
        voter_type: voterType,
        vote_choice: voteChoice
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
    }
  });

  const executeTreasury = useMutation({
    mutationFn: async (proposalId) => {
      const response = await base44.functions.invoke('executeTreasuryAllocation', {
        proposal_id: proposalId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals', 'treasury', 'governance-impacts'] });
    }
  });

  const activeProposals = proposals?.filter(p => p.status === 'active') || [];
  const treasuryBalance = treasury?.[0]?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Treasury & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <CardContent className="p-4">
            <Coins className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="text-white text-2xl font-bold">{treasuryBalance.toFixed(0)}</div>
            <div className="text-white/60 text-sm">Treasury Balance</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <Vote className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-white text-2xl font-bold">{activeProposals.length}</div>
            <div className="text-white/60 text-sm">Active Proposals</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-white text-2xl font-bold">{impactMetrics?.length || 0}</div>
            <div className="text-white/60 text-sm">Impact Records</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <CardContent className="p-4">
            <Shield className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="text-white text-2xl font-bold">
              {impactMetrics?.filter(m => m.blockchain_verification?.verified_on_chain).length || 0}
            </div>
            <div className="text-white/60 text-sm">On-Chain Verified</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Proposal Creation */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Create Agent Proposal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Select Agent</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {agents?.slice(0, 6).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-2 rounded border text-sm ${
                    selectedAgent === agent.id
                      ? 'bg-purple-500/50 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white text-xs">{agent.name}</div>
                </button>
              ))}
            </div>
          </div>
          <Input
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            placeholder="Proposal title"
            className="bg-white/5 border-white/10 text-white"
          />
          <Textarea
            value={proposalDesc}
            onChange={(e) => setProposalDesc(e.target.value)}
            placeholder="Proposal description"
            className="bg-white/5 border-white/10 text-white"
          />
          <Input
            type="number"
            value={requestedFunds}
            onChange={(e) => setRequestedFunds(Number(e.target.value))}
            placeholder="Requested funds"
            className="bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={() => createAgentProposal.mutate()}
            disabled={createAgentProposal.isPending || !selectedAgent || !proposalTitle}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Submit Agent Proposal
          </Button>
        </CardContent>
      </Card>

      {/* Active Proposals with Voting */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Active Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {activeProposals.length > 0 ? (
            <div className="space-y-4">
              {activeProposals.map((proposal) => {
                const totalPower = (proposal.total_voting_power_for || 0) + (proposal.total_voting_power_against || 0);
                const approvalRate = totalPower > 0 ? (proposal.total_voting_power_for / totalPower) * 100 : 0;
                
                return (
                  <div key={proposal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold mb-1">{proposal.proposal_title}</h3>
                        <p className="text-white/70 text-sm">{proposal.proposal_description}</p>
                      </div>
                      <Badge className={`${
                        proposal.proposer_type === 'agent' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                        {proposal.proposer_type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Votes For</div>
                        <div className="text-green-400 font-bold">{proposal.votes_for || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Votes Against</div>
                        <div className="text-red-400 font-bold">{proposal.votes_against || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Power For</div>
                        <div className="text-green-400 font-bold">{proposal.total_voting_power_for?.toFixed(0) || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Approval</div>
                        <div className="text-cyan-400 font-bold">{approvalRate.toFixed(0)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Requested</div>
                        <div className="text-yellow-400 font-bold">${proposal.requested_funds || 0}</div>
                      </div>
                    </div>

                    {/* Voting power progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Voting Power</span>
                        <span>{approvalRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all"
                          style={{ width: `${approvalRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => castVote.mutate({ 
                          proposalId: proposal.id, 
                          voteChoice: 'for',
                          voterType: selectedAgent ? 'agent' : 'user'
                        })}
                        disabled={castVote.isPending}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Vote For
                      </Button>
                      <Button
                        onClick={() => castVote.mutate({ 
                          proposalId: proposal.id, 
                          voteChoice: 'against',
                          voterType: selectedAgent ? 'agent' : 'user'
                        })}
                        disabled={castVote.isPending}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Vote Against
                      </Button>
                      {approvalRate >= 50 && proposal.execution_status !== 'executed' && (
                        <Button
                          onClick={() => executeTreasury.mutate(proposal.id)}
                          disabled={executeTreasury.isPending}
                          size="sm"
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        >
                          Execute
                        </Button>
                      )}
                    </div>

                    {proposal.blockchain_verification?.verified_on_chain && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-400">On-Chain Verified</span>
                        <span className="text-white/60">
                          Tx: {proposal.blockchain_verification.transaction_hash?.slice(0, 10)}...
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">
              No active proposals
            </div>
          )}
        </CardContent>
      </Card>

      {/* Governance Impact Visualization */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Governance Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <GovernanceImpact3D impactMetrics={impactMetrics || []} />
        </CardContent>
      </Card>
    </div>
  );
}