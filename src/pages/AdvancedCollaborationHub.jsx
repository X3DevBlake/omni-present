import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Layers, Shield, Activity, Plus } from 'lucide-react';
import { toast } from 'sonner';

import CollaborativeHolographicWorkspace3D from '../components/collaboration/CollaborativeHolographicWorkspace3D';
import RealTimeSpatialSync3D from '../components/collaboration/RealTimeSpatialSync3D';
import PersonalityEvolutionDashboard3D from '../components/personality/PersonalityEvolutionDashboard3D';
import DecentralizedVaultManager3D from '../components/security/DecentralizedVaultManager3D';

export default function AdvancedCollaborationHub() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const queryClient = useQueryClient();

  const { data: workspaces = [] } = useQuery({
    queryKey: ['holographic-workspaces'],
    queryFn: () => base44.entities.HolographicCollaborativeWorkspace.list(),
    refetchInterval: 5000
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['spatial-sessions'],
    queryFn: () => base44.entities.MultiUserSpatialSession.list(),
    refetchInterval: 2000
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-with-personality'],
    queryFn: () => base44.entities.Agent.list()
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('holographicWorkspaceOrchestrator', {
        action: 'create_workspace',
        data: {
          name: workspaceName || 'New Workspace',
          device_type: 'desktop'
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holographic-workspaces'] });
      setSelectedWorkspaceId(data.workspace.workspace_id);
      toast.success('Workspace created!');
      setWorkspaceName('');
    }
  });

  const stats = {
    totalWorkspaces: workspaces.length,
    activeParticipants: workspaces.reduce((sum, w) => sum + (w.active_participants?.length || 0), 0),
    activeSessions: sessions.length,
    evolvingAgents: agents.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-cyan-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Advanced Collaboration Hub
          </h1>
          <p className="text-slate-400">
            Multi-user holographic workspaces • AI personality evolution • Decentralized security
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Layers className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalWorkspaces}</div>
              <div className="text-xs text-slate-400">Workspaces</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeParticipants}</div>
              <div className="text-xs text-slate-400">Participants</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeSessions}</div>
              <div className="text-xs text-slate-400">Live Sessions</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.evolvingAgents}</div>
              <div className="text-xs text-slate-400">Evolving AIs</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Workspace */}
        <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="New workspace name..."
                className="flex-1 bg-slate-800 text-white border-slate-700"
              />
              <Button
                onClick={() => createWorkspaceMutation.mutate()}
                disabled={createWorkspaceMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="workspaces" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-700 p-1">
            <TabsTrigger value="workspaces" className="gap-2">
              <Layers className="w-4 h-4" />
              Holographic Workspaces
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2">
              <Activity className="w-4 h-4" />
              Spatial Sync
            </TabsTrigger>
            <TabsTrigger value="personality" className="gap-2">
              <Users className="w-4 h-4" />
              AI Personalities
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Data Vaults
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces" className="space-y-4">
            {workspaces.length === 0 ? (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No workspaces yet</p>
                  <p className="text-sm text-slate-500 mt-2">Create one to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {workspaces.map(workspace => (
                  <CollaborativeHolographicWorkspace3D
                    key={workspace.id}
                    workspaceId={workspace.workspace_id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            {sessions.length === 0 ? (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No active sync sessions</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map(session => (
                <RealTimeSpatialSync3D
                  key={session.id}
                  sessionId={session.session_id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="personality" className="space-y-4">
            {agents.length === 0 ? (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No agents found</p>
                </CardContent>
              </Card>
            ) : (
              agents.slice(0, 3).map(agent => (
                <PersonalityEvolutionDashboard3D
                  key={agent.id}
                  agentId={agent.agent_id || agent.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <DecentralizedVaultManager3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}