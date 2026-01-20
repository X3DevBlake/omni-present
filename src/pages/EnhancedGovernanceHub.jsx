import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import GovernanceImpactVisualizer3D from '../components/governance/GovernanceImpactVisualizer3D';
import AgentGovernancePanel from '../components/governance/AgentGovernancePanel';
import { Vote, TrendingUp, DollarSign, Shield } from 'lucide-react';

export default function EnhancedGovernanceHub() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: proposals } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: () => base44.entities.GovernanceProposal.list('-created_date', 50)
  });

  const { data: impactMetrics } = useQuery({
    queryKey: ['governance-impact'],
    queryFn: () => base44.entities.GovernanceImpactMetric.list('-decision_date', 20)
  });

  const { data: treasury } = useQuery({
    queryKey: ['treasury'],
    queryFn: () => base44.entities.Treasury.list('', 1)
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 20)
  });

  const executeTreasury = useMutation({
    mutationFn: async (proposalId) => {
      const response = await base44.functions.invoke('executeTreasuryAllocation', {
        proposal_id: proposalId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
      queryClient.invalidateQueries({ queryKey: ['governance-impact'] });
    }
  });

  const treasuryBalance = treasury?.[0]?.balance || 0;
  const allocatedFunds = treasury?.[0]?.allocated_funds || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Enhanced DAO Governance
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Agent voting, reputation-based power & dynamic treasury allocation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Vote className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{proposals?.length || 0}</p>
            <p className="text-white/60 text-sm">Total Proposals</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">${treasuryBalance.toFixed(0)}</p>
            <p className="text-white/60 text-sm">Treasury Balance</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">${allocatedFunds.toFixed(0)}</p>
            <p className="text-white/60 text-sm">Allocated</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
            <Shield className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white text-2xl font-bold">{impactMetrics?.length || 0}</p>
            <p className="text-white/60 text-sm">Impact Records</p>
          </Card>
        </div>

        <Tabs defaultValue="voting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="voting">Agent Voting</TabsTrigger>
            <TabsTrigger value="treasury">Treasury Management</TabsTrigger>
            <TabsTrigger value="impact">Impact Analysis 3D</TabsTrigger>
          </TabsList>

          <TabsContent value="voting">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Select Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agents?.slice(0, 10).map(agent => (
                    <Button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      variant={selectedAgent === agent.id ? 'default' : 'outline'}
                      className="w-full justify-start text-sm"
                      size="sm"
                    >
                      {agent.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <div className="lg:col-span-3">
                {selectedAgent ? (
                  <AgentGovernancePanel agentId={selectedAgent} />
                ) : (
                  <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                    <CardContent className="text-center">
                      <Vote className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60">Select an agent to participate in governance</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="treasury">
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Treasury Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded p-4">
                      <div className="text-white/60 text-sm">Available Balance</div>
                      <div className="text-green-400 text-3xl font-bold">${treasuryBalance.toFixed(2)}</div>
                    </div>
                    <div className="bg-black/30 rounded p-4">
                      <div className="text-white/60 text-sm">Allocated Funds</div>
                      <div className="text-orange-400 text-3xl font-bold">${allocatedFunds.toFixed(2)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-white/60 text-sm mb-2">Allocation Progress</div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full"
                        style={{ width: `${(allocatedFunds / (treasuryBalance + allocatedFunds)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {proposals?.filter(p => p.requested_funds > 0 && p.status !== 'rejected').map(proposal => {
                  const totalPower = (proposal.total_voting_power_for || 0) + (proposal.total_voting_power_against || 0);
                  const approvalRate = totalPower > 0 ? (proposal.total_voting_power_for / totalPower) * 100 : 0;
                  const canExecute = approvalRate > 50 && proposal.execution_status === 'pending';

                  return (
                    <Card key={proposal.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-medium">{proposal.proposal_title}</h4>
                            <div className="text-green-400 text-lg font-bold mt-1">
                              ${proposal.requested_funds}
                            </div>
                          </div>
                          <Badge className={proposal.execution_status === 'executed' ? 'bg-green-500' : 'bg-orange-500'}>
                            {proposal.execution_status}
                          </Badge>
                        </div>

                        <div className="bg-black/30 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/60 text-xs">Approval Rate</span>
                            <span className="text-purple-400 text-sm font-bold">{approvalRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${approvalRate > 50 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-orange-400'}`}
                              style={{ width: `${approvalRate}%` }}
                            />
                          </div>
                        </div>

                        {canExecute && (
                          <Button
                            onClick={() => executeTreasury.mutate(proposal.id)}
                            disabled={executeTreasury.isPending}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                            size="sm"
                          >
                            Execute Treasury Allocation
                          </Button>
                        )}

                        {proposal.execution_status === 'executed' && proposal.blockchain_verification?.verified_on_chain && (
                          <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
                            <div className="text-blue-300 text-xs">✓ On-Chain Verified</div>
                            <div className="text-white/60 text-xs font-mono mt-1">
                              {proposal.blockchain_verification.transaction_hash?.slice(0, 20)}...
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Governance Impact Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <GovernanceImpactVisualizer3D
                  impactMetrics={impactMetrics}
                  proposals={proposals}
                />
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {impactMetrics?.[0] && Object.entries(impactMetrics[0].impact_metrics || {}).map(([key, value]) => (
                    <div key={key} className="bg-white/5 border border-white/10 rounded p-3">
                      <div className="text-white/60 text-xs capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className={`text-xl font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {value >= 0 ? '+' : ''}{value?.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}