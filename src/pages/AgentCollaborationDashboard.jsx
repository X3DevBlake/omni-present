import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, Network, Lightbulb, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import CollaborationWorkingGroupsPanel from '../components/collaboration/CollaborationWorkingGroupsPanel';
import CollaborationTasksPanel from '../components/collaboration/CollaborationTasksPanel';
import SharedInsightsPanel from '../components/collaboration/SharedInsightsPanel';
import CollaborationVisualization from '../components/collaboration/CollaborationVisualization';
import CollaborationChat from '../components/collaboration/CollaborationChat';
import TaskDependencyBuilder from '../components/collaboration/TaskDependencyBuilder';
import AIInsightSuggestions from '../components/collaboration/AIInsightSuggestions';

export default function AgentCollaborationDashboard() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const { data: workingGroups = [] } = useQuery({
    queryKey: ['workingGroups'],
    queryFn: () => base44.entities.WorkingGroup.list('-created_date', 100),
    initialData: []
  });

  const { data: collaborationTasks = [] } = useQuery({
    queryKey: ['collaborationTasks'],
    queryFn: () => base44.entities.CollaborationTask.list('-created_date', 100),
    initialData: []
  });

  const { data: sharedInsights = [] } = useQuery({
    queryKey: ['sharedInsights'],
    queryFn: () => base44.entities.SharedInsight.list('-created_date', 50),
    initialData: []
  });

  const stats = [
    { label: 'Active Groups', value: workingGroups.filter(g => g.status === 'active').length, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Agents', value: workingGroups.reduce((acc, g) => acc + (g.agent_members?.length || 0), 0), icon: <Network className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Tasks In Progress', value: collaborationTasks.filter(t => t.status === 'in_progress').length, icon: <Clock className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Insights Shared', value: sharedInsights.length, icon: <Lightbulb className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-12 h-12 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Agent Collaboration Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">Cross-hub agent coordination, shared knowledge, and collaborative problem-solving</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="visualization" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="visualization">Collaboration Network</TabsTrigger>
            <TabsTrigger value="groups">Working Groups</TabsTrigger>
            <TabsTrigger value="tasks">Collaborative Tasks</TabsTrigger>
            <TabsTrigger value="chat">Chat & Dependencies</TabsTrigger>
            <TabsTrigger value="insights">Shared Insights</TabsTrigger>
          </TabsList>

          {/* Visualization Tab */}
          <TabsContent value="visualization">
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Real-time Collaboration Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <CollaborationVisualization workingGroups={workingGroups} tasks={collaborationTasks} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Groups Tab */}
          <TabsContent value="groups">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCreateGroup(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Working Group
              </Button>
            </div>
            <CollaborationWorkingGroupsPanel groups={workingGroups} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <CollaborationTasksPanel 
              tasks={collaborationTasks} 
              groups={workingGroups}
              onSelectTask={setSelectedTask}
            />
          </TabsContent>

          {/* Chat & Dependencies Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {selectedTask ? (
                <>
                  <div className="lg:col-span-2">
                    <CollaborationChat 
                      taskId={selectedTask.id}
                      groupId={selectedTask.working_group_id}
                      title={`Chat: ${selectedTask.task_name}`}
                    />
                  </div>
                  <div>
                    <AIInsightSuggestions 
                      taskContext={selectedTask}
                      groupContext={selectedGroup}
                      onApply={(suggestion) => console.log('Applied:', suggestion)}
                    />
                  </div>
                </>
              ) : (
                <div className="lg:col-span-3 p-8 text-center text-slate-400">
                  Select a task from the Collaborative Tasks tab to start chatting
                </div>
              )}
            </div>
            <TaskDependencyBuilder 
              tasks={collaborationTasks} 
              onDependencyCreate={() => console.log('Dependency created')}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <SharedInsightsPanel insights={sharedInsights} />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}