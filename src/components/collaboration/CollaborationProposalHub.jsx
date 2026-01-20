import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Brain, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TeamDynamicsFlow3D from './TeamDynamicsFlow3D';

export default function CollaborationProposalHub({ agentId }) {
  const queryClient = useQueryClient();
  const [taskDescription, setTaskDescription] = useState('');

  const { data: proposals } = useQuery({
    queryKey: ['collaboration-proposals', agentId],
    queryFn: () => base44.entities.CollaborationProposal.filter(
      { proposing_agent_id: agentId },
      '-created_date',
      20
    ),
  });

  const { data: teamSnapshots } = useQuery({
    queryKey: ['team-snapshots'],
    queryFn: () => base44.entities.TeamDynamicsSnapshot.list('-snapshot_timestamp', 10),
  });

  const initiateProposal = useMutation({
    mutationFn: async (autonomous) => {
      const response = await base44.functions.invoke('initiateCollaborationProposal', {
        agent_id: agentId,
        task_description: taskDescription,
        autonomous
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-proposals'] });
      setTaskDescription('');
    }
  });

  const approveProposal = useMutation({
    mutationFn: async (proposalId) => {
      await base44.entities.CollaborationProposal.update(proposalId, {
        proposal_status: 'approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-proposals'] });
    }
  });

  const latestSnapshot = teamSnapshots?.[0];

  return (
    <div className="space-y-6">
      {/* Initiate Collaboration */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Initiate Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Describe the task requiring collaboration..."
            className="bg-white/5 border-white/10 text-white min-h-[100px]"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => initiateProposal.mutate(true)}
              disabled={initiateProposal.isPending || !taskDescription}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Autonomous Proposal
            </Button>
            <Button
              onClick={() => initiateProposal.mutate(false)}
              disabled={initiateProposal.isPending || !taskDescription}
              variant="outline"
              className="flex-1"
            >
              Manual Proposal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals && proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{proposal.proposal_name}</h3>
                    <Badge className={`${
                      proposal.proposal_status === 'approved' ? 'bg-green-500' :
                      proposal.proposal_status === 'in_progress' ? 'bg-blue-500' :
                      proposal.proposal_status === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {proposal.proposal_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Complexity</div>
                      <div className="text-orange-400 font-bold">
                        {proposal.task_complexity_analysis?.complexity_score || 0}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Skill Gaps</div>
                      <div className="text-red-400 font-bold">
                        {proposal.detected_skill_gaps?.length || 0}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Team Size</div>
                      <div className="text-cyan-400 font-bold">
                        {(proposal.suggested_team_members?.length || 0) + 1}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Duration</div>
                      <div className="text-purple-400 font-bold">
                        {proposal.task_complexity_analysis?.estimated_duration || 0}h
                      </div>
                    </div>
                  </div>

                  {proposal.suggested_team_members && proposal.suggested_team_members.length > 0 && (
                    <div className="mb-3">
                      <div className="text-white/60 text-xs mb-2">Suggested Team:</div>
                      <div className="flex flex-wrap gap-2">
                        {proposal.suggested_team_members.slice(0, 3).map((member, i) => (
                          <Badge key={i} className="bg-purple-500/20 border-purple-500/30">
                            Agent {member.agent_id?.slice(-6)} ({member.compatibility_score}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposal.proposal_status === 'pending_approval' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => approveProposal.mutate(proposal.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}

                  {proposal.autonomous_initiation && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                      <Brain className="w-3 h-3" />
                      Autonomously initiated
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">
              No proposals yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Dynamics Visualization */}
      {latestSnapshot && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Live Team Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamDynamicsFlow3D snapshot={latestSnapshot} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}