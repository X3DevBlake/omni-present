import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Activity, Workflow } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import CollaborationProposalHub from '../components/collaboration/CollaborationProposalHub';
import TaskTimeline3D from '../components/collaboration/TaskTimeline3D';
import TeamDynamicsFlow3D from '../components/collaboration/TeamDynamicsFlow3D';
import { motion } from 'framer-motion';

export default function EnhancedCollaborationStudio() {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 20),
  });

  const { data: taskAssignments } = useQuery({
    queryKey: ['task-assignments'],
    queryFn: () => base44.entities.AgentTaskAssignment.list('-created_date', 50),
  });

  const { data: dependencies } = useQuery({
    queryKey: ['task-dependencies'],
    queryFn: () => base44.entities.TaskDependency.list('', 50),
  });

  const { data: teamSnapshots } = useQuery({
    queryKey: ['team-snapshots'],
    queryFn: () => base44.entities.TeamDynamicsSnapshot.list('-snapshot_timestamp', 5),
  });

  const tasks = taskAssignments?.map(t => ({
    id: t.id,
    name: t.task_name || 'Untitled Task',
    status: t.status || 'pending'
  })) || [];

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Collaboration Studio
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Autonomous proposals, intelligent team formation, and dynamic task allocation
          </p>
        </motion.div>

        {/* Agent Selection */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {agents?.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAgentId === agent.id
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{agent.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="proposals">
              <Users className="w-4 h-4 mr-2" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="dynamics">
              <Activity className="w-4 h-4 mr-2" />
              Team Dynamics
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            {selectedAgentId ? (
              <CollaborationProposalHub agentId={selectedAgentId} />
            ) : (
              <Card className="bg-black/40 border-white/10">
                <CardContent className="py-12">
                  <div className="text-white/60 text-center">
                    Select an agent to view collaboration proposals
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Task Timeline & Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskTimeline3D tasks={tasks} dependencies={dependencies || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dynamics">
            <div className="grid grid-cols-1 gap-6">
              {teamSnapshots?.map((snapshot) => (
                <Card key={snapshot.id} className="bg-black/40 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">
                        Team Dynamics - {new Date(snapshot.snapshot_timestamp).toLocaleString()}
                      </CardTitle>
                      <div className="text-cyan-400 text-sm">
                        Efficiency: {snapshot.collaboration_efficiency}%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TeamDynamicsFlow3D snapshot={snapshot} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Automated Workflow Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/60 text-center py-8">
                  Workflow automation coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}