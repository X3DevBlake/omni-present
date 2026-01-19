import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuroraBackground from '@/components/omni/AuroraBackground';
import GovernanceVoting3D from '@/components/governance/GovernanceVoting3D';
import TreasuryFlow3D from '@/components/governance/TreasuryFlow3D';
import { Vote, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';

export default function DAOGovernanceHub() {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalType, setProposalType] = useState('feature_development');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const queryClient = useQueryClient();

  const { data: proposals = [] } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: () => base44.entities.GovernanceProposal.list()
  });

  const { data: treasury } = useQuery({
    queryKey: ['treasury'],
    queryFn: async () => {
      const treasuries = await base44.entities.Treasury.list();
      return treasuries[0];
    }
  });

  const createProposalMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createProposal', {
        proposal_title: proposalTitle,
        description: proposalDesc,
        proposal_type: proposalType,
        execution_data: {}
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['governance-proposals']);
      setProposalTitle('');
      setProposalDesc('');
    }
  });

  const castVoteMutation = useMutation({
    mutationFn: async ({ proposal_id, vote }) => {
      const response = await base44.functions.invoke('castVote', {
        proposal_id,
        vote
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['governance-proposals']);
    }
  });

  const activeProposals = proposals.filter(p => p.status === 'voting').length;
  const passedProposals = proposals.filter(p => p.status === 'passed').length;
  const totalVotes = proposals.reduce((sum, p) => (p.votes_for || 0) + (p.votes_against || 0) + (p.votes_abstain || 0), 0);

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Vote className="w-12 h-12 text-cyan-400" />
            DAO Governance Hub
          </h1>
          <p className="text-xl text-gray-300">
            Decentralized decision-making and treasury management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Votes</p>
                  <p className="text-3xl font-bold text-white">{activeProposals}</p>
                </div>
                <Vote className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Passed</p>
                  <p className="text-3xl font-bold text-white">{passedProposals}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treasury</p>
                  <p className="text-2xl font-bold text-white">${(treasury?.total_balance_usd / 1e6).toFixed(2)}M</p>
                </div>
                <DollarSign className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Votes</p>
                  <p className="text-3xl font-bold text-white">{totalVotes}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="voting">3D Voting</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{proposal.proposal_title}</h3>
                          <Badge className={
                            proposal.status === 'passed' ? 'bg-green-600' :
                            proposal.status === 'rejected' ? 'bg-red-600' :
                            proposal.status === 'voting' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }>
                            {proposal.status}
                          </Badge>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                            {proposal.proposal_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{proposal.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-400">For: {proposal.votes_for || 0}</span>
                          <span className="text-red-400">Against: {proposal.votes_against || 0}</span>
                          <span className="text-yellow-400">Abstain: {proposal.votes_abstain || 0}</span>
                        </div>
                      </div>
                      {proposal.status === 'voting' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => castVoteMutation.mutate({ proposal_id: proposal.id, vote: 'for' })}
                            disabled={castVoteMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            Vote For
                          </Button>
                          <Button
                            onClick={() => castVoteMutation.mutate({ proposal_id: proposal.id, vote: 'against' })}
                            disabled={castVoteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            Against
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voting">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <GovernanceVoting3D proposal={selectedProposal || proposals[0]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treasury">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <TreasuryFlow3D treasury={treasury} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Proposal title..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
                
                <Textarea
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                  placeholder="Detailed description..."
                  className="bg-slate-800 border-slate-600 text-white h-32"
                />
                
                <Select value={proposalType} onValueChange={setProposalType}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fee_adjustment">Fee Adjustment</SelectItem>
                    <SelectItem value="feature_development">Feature Development</SelectItem>
                    <SelectItem value="treasury_allocation">Treasury Allocation</SelectItem>
                    <SelectItem value="rule_change">Rule Change</SelectItem>
                    <SelectItem value="strategic_decision">Strategic Decision</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={() => createProposalMutation.mutate()}
                  disabled={!proposalTitle || !proposalDesc || createProposalMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {createProposalMutation.isPending ? 'Creating...' : 'Submit Proposal'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}