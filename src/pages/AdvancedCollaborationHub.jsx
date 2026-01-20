import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import TeamDynamicsTimeline3D from '../components/collaboration/TeamDynamicsTimeline3D';
import { Users, Zap, Clock, TrendingUp } from 'lucide-react';

export default function AdvancedCollaborationHub() {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { data: proposals } = useQuery({
    queryKey: ['collaboration-proposals'],
    queryFn: () => base44.entities.CollaborationProposal.list('-created_date', 50)
  });

  const { data: teams } = useQuery({
    queryKey: ['working-groups'],
    queryFn: () => base44.entities.WorkingGroup.list('', 50)
  });

  const { data: snapshots } = useQuery({
    queryKey: ['team-snapshots', selectedTeam],
    queryFn: () => selectedTeam
      ? base44.entities.TeamDynamicsSnapshot.filter({ team_id: selectedTeam }, '-snapshot_timestamp', 20)
      : Promise.resolve([]),
    enabled: !!selectedTeam,
    refetchInterval: 5000 // Real-time updates every 5s
  });

  const reallocateTasks = useMutation({
    mutationFn: async ({ team_id, trigger }) => {
      const response = await base44.functions.invoke('reallocateTeamTasks', {
        team_id,
        trigger_reason: trigger
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-snapshots'] });
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Collaboration Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Autonomous proposals, dynamic task allocation & real-time team dynamics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{proposals?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Proposals</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <Zap className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {proposals?.filter(p => p.autonomous_initiation).length || 0}
            </p>
            <p className="text-white/60 text-sm">Autonomous</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Clock className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{teams?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Teams</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {snapshots?.[0]?.team_velocity?.toFixed(1) || 0}
            </p>
            <p className="text-white/60 text-sm">Team Velocity</p>
          </Card>
        </div>

        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="proposals">Collaboration Proposals</TabsTrigger>
            <TabsTrigger value="dynamics">Team Dynamics 3D</TabsTrigger>
            <TabsTrigger value="reallocations">Task Reallocations</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {proposals?.map(proposal => (
                <Card key={proposal.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{proposal.proposal_name}</CardTitle>
                      <Badge className={
                        proposal.proposal_status === 'approved' ? 'bg-green-500' :
                        proposal.proposal_status === 'pending_approval' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }>
                        {proposal.proposal_status}
                      </Badge>
                    </div>
                    {proposal.autonomous_initiation && (
                      <Badge className="bg-purple-500 w-fit">⚡ Autonomous</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Task Complexity</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full"
                            style={{ width: `${proposal.task_complexity_analysis?.complexity_score || 0}%` }}
                          />
                        </div>
                        <span className="text-cyan-400 text-sm font-bold">
                          {proposal.task_complexity_analysis?.complexity_score || 0}
                        </span>
                      </div>
                    </div>

                    {proposal.detected_skill_gaps?.length > 0 && (
                      <div>
                        <div className="text-white/60 text-xs mb-2">Skill Gaps Detected</div>
                        <div className="flex flex-wrap gap-1">
                          {proposal.detected_skill_gaps.slice(0, 3).map((gap, i) => (
                            <Badge key={i} className="text-xs bg-red-500/20 text-red-300">
                              {gap.skill_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {proposal.suggested_team_members?.length > 0 && (
                      <div>
                        <div className="text-white/60 text-xs mb-2">Suggested Team ({proposal.suggested_team_members.length})</div>
                        <div className="grid grid-cols-2 gap-2">
                          {proposal.suggested_team_members.slice(0, 2).map((member, i) => (
                            <div key={i} className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                              <div className="text-white text-xs font-medium">Agent {member.agent_id?.slice(-6)}</div>
                              <div className="text-purple-400 text-xs">{member.compatibility_score}% match</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dynamics">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Real-Time Team Dynamics</CardTitle>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm"
                      value={selectedTeam || ''}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                      <option value="">Select Team</option>
                      {teams?.map(team => (
                        <option key={team.id} value={team.id}>{team.group_name}</option>
                      ))}
                    </select>
                    {selectedTeam && (
                      <Button
                        size="sm"
                        onClick={() => reallocateTasks.mutate({ team_id: selectedTeam, trigger: 'manual' })}
                        disabled={reallocateTasks.isPending}
                        className="bg-orange-600"
                      >
                        Optimize Tasks
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTeam ? (
                  <>
                    <TeamDynamicsTimeline3D
                      snapshots={snapshots}
                      tasks={snapshots?.[0]?.team_members?.flatMap(m => m.current_tasks || []) || []}
                      onTaskClick={(task) => console.log('Task:', task)}
                    />
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
                        <div className="text-blue-300 text-sm">Collaboration Efficiency</div>
                        <div className="text-white text-2xl font-bold">
                          {snapshots?.[0]?.collaboration_efficiency?.toFixed(0) || 0}%
                        </div>
                      </div>
                      <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                        <div className="text-green-300 text-sm">Team Velocity</div>
                        <div className="text-white text-2xl font-bold">
                          {snapshots?.[0]?.team_velocity?.toFixed(1) || 0}
                        </div>
                      </div>
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded p-3">
                        <div className="text-orange-300 text-sm">Active Bottlenecks</div>
                        <div className="text-white text-2xl font-bold">
                          {snapshots?.[0]?.bottlenecks_detected?.length || 0}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Select a team to visualize dynamics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reallocations">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Dynamic Task Reallocations</CardTitle>
              </CardHeader>
              <CardContent>
                {snapshots?.[0]?.dynamic_reallocation_events?.length > 0 ? (
                  <div className="space-y-3">
                    {snapshots[0].dynamic_reallocation_events.slice(0, 10).map((event, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium">Task Reallocation</div>
                          <Badge className={
                            event.trigger_type === 'bottleneck' ? 'bg-red-500' :
                            event.trigger_type === 'performance' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }>
                            {event.trigger_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-white/60 text-xs">From</div>
                            <div className="text-cyan-400">Agent {event.from_agent?.slice(-6)}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">To</div>
                            <div className="text-green-400">Agent {event.to_agent?.slice(-6)}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Time</div>
                            <div className="text-white">{new Date(event.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <p className="text-white/60 text-xs mt-2">{event.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60">No task reallocations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}