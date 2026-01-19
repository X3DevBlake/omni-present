import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, MessageCircle, Handshake, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CollaborationNetwork3D from '../components/collaboration/CollaborationNetwork3D';
import NegotiationVisualizer3D from '../components/collaboration/NegotiationVisualizer3D';

export default function AgentCollaborationHub() {
  const queryClient = useQueryClient();
  const [taskName, setTaskName] = useState('Market Analysis');

  const { data: workingGroups } = useQuery({
    queryKey: ['working-groups'],
    queryFn: () => base44.entities.WorkingGroup.list(),
  });

  const { data: negotiations } = useQuery({
    queryKey: ['negotiations'],
    queryFn: () => base44.entities.AgentNegotiation.list('-created_date', 15),
  });

  const { data: channels } = useQuery({
    queryKey: ['communication-channels'],
    queryFn: () => base44.entities.AgentCommunicationChannel.list(),
  });

  const formGroup = useMutation({
    mutationFn: async (requirements) => {
      const response = await base44.functions.invoke('formDynamicWorkingGroup', requirements);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-groups', 'communication-channels'] });
    },
  });

  const negotiate = useMutation({
    mutationFn: async (negotiationId) => {
      const response = await base44.functions.invoke('negotiateResourceSharing', {
        negotiation_id: negotiationId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
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
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Agent Collaboration Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Dynamic working groups, secure communication, and AI-driven negotiation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{workingGroups?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Groups</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Handshake className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{negotiations?.length || 0}</p>
            <p className="text-white/60 text-sm">Negotiations</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <MessageCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{channels?.length || 0}</p>
            <p className="text-white/60 text-sm">Secure Channels</p>
          </Card>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="groups">Working Groups</TabsTrigger>
            <TabsTrigger value="negotiation">Negotiations</TabsTrigger>
            <TabsTrigger value="network">Network 3D</TabsTrigger>
            <TabsTrigger value="form">Form Group</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workingGroups?.map((group, i) => (
                <Card key={group.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{group.group_name}</h3>
                        <Badge>{group.communication_protocol}</Badge>
                      </div>
                      <Badge className={`${
                        group.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      } text-white`}>
                        {group.status}
                      </Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3 mb-3">
                      <div className="text-white/60 text-xs mb-1">Collaboration Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full"
                            style={{ width: `${group.collaboration_score || 0}%` }}
                          />
                        </div>
                        <span className="text-cyan-400 font-bold">{group.collaboration_score || 0}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Members</div>
                        <div className="text-white font-bold">{group.member_agents?.length || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Tasks</div>
                        <div className="text-white font-bold">{group.task_assignments?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="negotiation" className="space-y-4">
            {negotiate.data && (
              <Card className="bg-green-500/20 border-green-500/30 mb-6">
                <CardContent className="p-6">
                  <h3 className="text-green-400 font-bold mb-3">AI Recommendation</h3>
                  <div className="bg-black/30 rounded p-3 mb-3">
                    <pre className="text-white text-xs whitespace-pre-wrap">
                      {JSON.stringify(negotiate.data.recommended_agreement, null, 2)}
                    </pre>
                  </div>
                  {negotiate.data.win_win_scenarios?.length > 0 && (
                    <div>
                      <div className="text-cyan-300 text-sm mb-2">Win-Win Scenarios:</div>
                      {negotiate.data.win_win_scenarios.map((scenario, i) => (
                        <div key={i} className="text-white/80 text-sm">• {scenario}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {negotiations?.map((neg, i) => (
                <Card key={neg.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge>{neg.negotiation_type}</Badge>
                      <Badge className={`${
                        neg.status === 'accepted' ? 'bg-green-500' :
                        neg.status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white`}>
                        {neg.status}
                      </Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3 mb-3">
                      <div className="text-white/60 text-xs mb-1">Participants</div>
                      <div className="text-white text-sm">{neg.participant_agent_ids?.length || 0} agents</div>
                    </div>

                    <Button
                      onClick={() => negotiate.mutate(neg.id)}
                      disabled={negotiate.isPending || neg.status === 'accepted'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      AI Analysis
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="network">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Collaboration Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CollaborationNetwork3D groups={workingGroups} channels={channels} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Form Dynamic Working Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Task Name</label>
                  <Input
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter task name"
                  />
                </div>

                <Button
                  onClick={() => formGroup.mutate({
                    task_requirements: {
                      task_name: taskName,
                      required_skills: ['analysis', 'trading', 'prediction'],
                      task_type: 'collaborative',
                    }
                  })}
                  disabled={formGroup.isPending}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {formGroup.isPending ? 'Forming Team...' : 'Form Working Group'}
                </Button>

                {formGroup.data && (
                  <div className="bg-cyan-500/20 border border-cyan-500/30 rounded p-4">
                    <p className="text-white font-bold mb-2">Group Created!</p>
                    <div className="space-y-2">
                      <div className="text-white/80 text-sm">
                        Collaboration Score: {formGroup.data.collaboration_score?.toFixed(0)}%
                      </div>
                      {formGroup.data.synergies?.length > 0 && (
                        <div>
                          <div className="text-cyan-300 text-xs mb-1">Synergies:</div>
                          {formGroup.data.synergies.map((s, i) => (
                            <div key={i} className="text-white/70 text-xs">• {s}</div>
                          ))}
                        </div>
                      )}
                    </div>
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