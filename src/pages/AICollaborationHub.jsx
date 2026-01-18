import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, Network, TrendingUp, GitBranch, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import CollaborationNetwork3D from '../components/3d/CollaborationNetwork3D';
import SubTeamVisualizer3D from '../components/3d/SubTeamVisualizer3D';

export default function AICollaborationHub() {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations'],
    queryFn: () => base44.entities.AgentCollaboration.filter({}).sort('-created_date').limit(50)
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.TeamOrchestration.filter({}).sort('-created_date').limit(20)
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['agentMessages'],
    queryFn: () => base44.entities.AgentCommunication.filter({}).sort('-created_date').limit(100)
  });

  const { data: sharedKnowledge = [] } = useQuery({
    queryKey: ['sharedKnowledge'],
    queryFn: () => base44.entities.SharedKnowledge.filter({}).sort('-quality_score').limit(20)
  });

  const activeCollaborations = collaborations.filter(c => c.status === 'active');
  const completedCollaborations = collaborations.filter(c => c.status === 'completed');

  const recentNegotiations = messages.filter(m => 
    m.classification === 'negotiation' || m.priority === 'high'
  ).slice(0, 10);

  const subTeams = teams.filter(t => t.parent_orchestration_id);

  const proposeMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.AgentCollaboration.create({
        collaboration_type: 'joint_project',
        task_description: newProjectDesc,
        status: 'proposed',
        agent_ids: [],
        formation_reasoning: 'User-initiated project proposal'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collaborations']);
      setNewProjectTitle('');
      setNewProjectDesc('');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">AI Agent Collaboration Hub</h1>
          <p className="text-slate-400">Monitor and facilitate agent interactions, negotiations, and joint ventures</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Collaborations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{activeCollaborations.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{messages.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Sub-Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{subTeams.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Shared Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{sharedKnowledge.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">3D Collaboration Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <CollaborationNetwork3D collaborations={activeCollaborations} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Sub-Team Formation Visualizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SubTeamVisualizer3D teams={subTeams} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="interactions" className="space-y-4">
          <TabsList className="bg-slate-900/50">
            <TabsTrigger value="interactions">Live Interactions</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
            <TabsTrigger value="projects">Joint Projects</TabsTrigger>
            <TabsTrigger value="knowledge">Shared Knowledge</TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Real-Time Agent Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.slice(0, 10).map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={msg.priority === 'urgent' ? 'destructive' : 'default'}>
                            {msg.priority}
                          </Badge>
                          <span className="text-slate-400 text-sm">{msg.classification}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.created_date).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-400">{msg.sender_agent_id}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-purple-400">{msg.recipient_agent_id}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negotiations" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Active Negotiations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNegotiations.map(neg => (
                    <motion.div
                      key={neg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-700/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">Task Delegation Negotiation</h3>
                        <Badge>In Progress</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Initiator:</span>
                          <p className="text-white">{neg.sender_agent_id}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Responder:</span>
                          <p className="text-white">{neg.recipient_agent_id}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Propose Joint Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Project Title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Textarea
                  placeholder="Project Description and Goals"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={4}
                />
                <Button
                  onClick={() => proposeMutation.mutate()}
                  disabled={!newProjectDesc}
                  className="w-full"
                >
                  Propose Project
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeCollaborations.map(collab => (
                    <div key={collab.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h3 className="text-white font-semibold mb-2">{collab.task_description}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{collab.collaboration_type}</Badge>
                        <span className="text-sm text-slate-400">
                          {collab.agent_ids?.length || 0} agents
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Collaborative Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sharedKnowledge.map(knowledge => (
                    <motion.div
                      key={knowledge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-700/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{knowledge.knowledge_topic}</h3>
                        <Badge variant="outline">
                          Quality: {knowledge.quality_score}/100
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        Contributors: {knowledge.agent_ids?.length || 0} agents
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge>v{knowledge.version || 1}</Badge>
                        <span className="text-xs text-slate-500">
                          {knowledge.contribution_count} contributions
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}