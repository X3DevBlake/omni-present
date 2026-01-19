import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import TeamStructure3D from '@/components/collaboration/TeamStructure3D';
import CommunicationFlow3D from '@/components/collaboration/CommunicationFlow3D';
import { Users, Zap, Target, TrendingUp } from 'lucide-react';

export default function AICollaborationHub() {
  const [taskObjective, setTaskObjective] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ['agent-teams'],
    queryFn: () => base44.entities.AgentTeam.list()
  });

  const discoverAgentsMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('discoverComplementaryAgents', params);
      return response.data;
    }
  });

  const formTeamMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('formTaskTeam', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-teams']);
    }
  });

  const distributeWorkloadMutation = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('distributeWorkload', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-teams']);
    }
  });

  const activeTeams = teams.filter(t => t.status === 'active').length;
  const avgSynergy = teams.length > 0
    ? teams.reduce((sum, t) => sum + (t.team_synergy_score || 0), 0) / teams.length
    : 0;
  const completedTeams = teams.filter(t => t.status === 'completed').length;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Users className="w-12 h-12 text-cyan-400" />
            AI Collaboration Hub
          </h1>
          <p className="text-xl text-gray-300">
            Autonomous agent team formation and collaborative task execution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Teams</p>
                  <p className="text-3xl font-bold text-white">{activeTeams}</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Synergy</p>
                  <p className="text-3xl font-bold text-white">{avgSynergy.toFixed(0)}%</p>
                </div>
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-white">{completedTeams}</p>
                </div>
                <Target className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-white">{teams.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="teams">Active Teams</TabsTrigger>
            <TabsTrigger value="structure">3D Team Structure</TabsTrigger>
            <TabsTrigger value="communication">Communication Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <div className="space-y-4">
              {teams.map((team) => (
                <Card key={team.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{team.task_objective}</h3>
                          <Badge className={
                            team.status === 'active' ? 'bg-green-600' :
                            team.status === 'completed' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }>
                            {team.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Members: {team.team_members?.length || 0}</p>
                          <p>Synergy: {team.team_synergy_score?.toFixed(0)}%</p>
                          <p>Progress: {team.progress_percentage}%</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedTeam(team)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View 3D
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="structure">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <TeamStructure3D team={selectedTeam || teams[0]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <CommunicationFlow3D team={selectedTeam || teams[0]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}