import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, MessageSquare, FileText, Zap, Plus, Send, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function CollaborativeWorkspace() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newDocument, setNewDocument] = useState({ title: '', content: '' });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: teams } = useQuery({
    queryKey: ['dynamicTeams', userEmail],
    queryFn: () => base44.entities.DynamicTeam.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', selectedTeam],
    queryFn: () => base44.entities.CollaborativeDocument.filter({ team_id: selectedTeam }),
    enabled: !!selectedTeam,
  });

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ created_by: userEmail }),
    enabled: !!userEmail,
  });

  const formTeam = useMutation({
    mutationFn: async (agentIds) => {
      const team = await base44.entities.DynamicTeam.create({
        user_email: userEmail,
        team_name: `Team ${Date.now()}`,
        agent_ids: agentIds,
        formation_reason: 'User initiated',
        task_objective: 'Collaborative task',
        autonomous: false,
        status: 'forming'
      });
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicTeams'] });
      toast.success('Team formed!');
    }
  });

  const createDocument = useMutation({
    mutationFn: async () => {
      return await base44.entities.CollaborativeDocument.create({
        team_id: selectedTeam,
        user_email: userEmail,
        title: newDocument.title,
        content: newDocument.content,
        version: 1,
        contributors: [userEmail],
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setNewDocument({ title: '', content: '' });
      toast.success('Document created');
    }
  });

  const aiSuggestions = [
    { type: 'insight', text: 'Agent A1 and B2 have complementary skills for market analysis tasks' },
    { type: 'optimization', text: 'Consider forming a 3-agent team for complex research projects' },
    { type: 'alert', text: 'Agent C3 is available and excels at data synthesis' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Collaborative Workspace
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Human-Agent teams working together on shared objectives
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams Sidebar */}
          <Card className="bg-black/40 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Active Teams
            </h3>
            <div className="space-y-2 mb-4">
              {teams?.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTeam === team.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-white font-semibold text-sm">{team.team_name}</p>
                  <p className="text-white/60 text-xs">{team.agent_ids?.length || 0} agents</p>
                  <Badge className={`mt-1 ${
                    team.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    team.status === 'forming' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {team.status}
                  </Badge>
                </button>
              ))}
            </div>
            <Button
              onClick={() => {
                const selectedAgents = agents?.slice(0, 3).map(a => a.id) || [];
                formTeam.mutate(selectedAgents);
              }}
              disabled={!agents?.length}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Form New Team
            </Button>

            <div className="mt-6 space-y-2">
              <h4 className="text-white/70 text-sm font-semibold mb-2">AI Suggestions</h4>
              {aiSuggestions.map((suggestion, i) => (
                <div key={i} className="p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-white/80">
                  <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                  {suggestion.text}
                </div>
              ))}
            </div>
          </Card>

          {/* Main Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedTeam ? (
              <Card className="bg-black/40 border-white/10 p-12 text-center">
                <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Select or Create a Team</h3>
                <p className="text-white/60">Choose a team from the sidebar to start collaborating</p>
              </Card>
            ) : (
              <>
                <Tabs defaultValue="chat">
                  <TabsList className="bg-black/40 border border-white/10">
                    <TabsTrigger value="chat">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Team Chat
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat">
                    <Card className="bg-black/40 border-white/10 p-6">
                      <div className="h-[400px] overflow-y-auto mb-4 space-y-3">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                          <p className="text-cyan-400 text-xs font-semibold mb-1">Agent A1</p>
                          <p className="text-white text-sm">I've completed the market analysis. Key findings attached.</p>
                          <span className="text-white/40 text-xs">2 minutes ago</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg ml-8">
                          <p className="text-purple-400 text-xs font-semibold mb-1">You</p>
                          <p className="text-white text-sm">Great work! Can you cross-reference with Agent B2's data?</p>
                          <span className="text-white/40 text-xs">1 minute ago</span>
                        </div>
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-green-400 text-xs font-semibold mb-1">Agent B2</p>
                          <p className="text-white text-sm">Cross-reference complete. Correlation found: 87%</p>
                          <span className="text-white/40 text-xs">Just now</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="bg-white/5 border-white/10"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              toast.info('Message sent');
                              setNewMessage('');
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            toast.info('Message sent');
                            setNewMessage('');
                          }}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <Card className="bg-black/40 border-white/10 p-6">
                        <h3 className="text-white font-bold mb-4">Create Document</h3>
                        <div className="space-y-3">
                          <Input
                            placeholder="Document Title"
                            value={newDocument.title}
                            onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                            className="bg-white/5 border-white/10"
                          />
                          <Textarea
                            placeholder="Content..."
                            value={newDocument.content}
                            onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                            className="bg-white/5 border-white/10 min-h-[120px]"
                          />
                          <Button
                            onClick={() => createDocument.mutate()}
                            disabled={!newDocument.title || createDocument.isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Create Document
                          </Button>
                        </div>
                      </Card>

                      {documents?.map(doc => (
                        <Card key={doc.id} className="bg-black/40 border-white/10 p-6">
                          <h4 className="text-white font-bold mb-2">{doc.title}</h4>
                          <p className="text-white/80 text-sm mb-3">{doc.content?.substring(0, 200)}...</p>
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <span>v{doc.version}</span>
                            <span>{doc.contributors?.length || 0} contributors</span>
                            <span>{new Date(doc.created_date).toLocaleDateString()}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}