import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FlaskConical, FileText, Users, TrendingUp, Sparkles, Atom, Brain, 
  Code, Plus, Search, Filter, BookOpen, Award, Rocket
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InteractiveResearchVisualizer3D from '../components/academy/InteractiveResearchVisualizer3D';
import LiveNetworkMonitorDashboard from '../components/redcomm/LiveNetworkMonitorDashboard';

export default function ResearchHub() {
  const [activeTab, setActiveTab] = useState('projects');
  const [newProject, setNewProject] = useState({ title: '', description: '', field: 'ai' });
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['researchProjects'],
    queryFn: () => base44.entities.ResearchProject.list()
  });

  const { data: publications = [] } = useQuery({
    queryKey: ['publications'],
    queryFn: () => base44.entities.ResearchProject.filter({ status: 'published' })
  });

  const createProjectMutation = useMutation({
    mutationFn: (projectData) => base44.entities.ResearchProject.create({
      ...projectData,
      created_by: user?.email,
      status: 'planning',
      team_size: 1,
      progress: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchProjects'] });
      setNewProject({ title: '', description: '', field: 'ai' });
    }
  });

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Research Hub
              </h1>
              <p className="text-gray-400 text-lg">
                Collaborative Research & Scientific Innovation
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.6 }}>
              <FlaskConical className="w-16 h-16 text-cyan-400" />
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', value: activeProjects.length, icon: Atom, color: 'cyan' },
              { label: 'Publications', value: publications.length, icon: FileText, color: 'green' },
              { label: 'Researchers', value: projects.reduce((sum, p) => sum + (p.team_size || 0), 0), icon: Users, color: 'purple' },
              { label: 'Completed', value: completedProjects.length, icon: Award, color: 'amber' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className={`bg-black/60 border-2 border-${stat.color}-500/40 backdrop-blur-xl`}>
                    <CardContent className="p-4">
                      <Icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
                      <div className="text-white text-2xl font-bold">{stat.value}</div>
                      <div className="text-gray-400 text-xs">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 backdrop-blur-xl border border-white/10 mb-8 p-2 rounded-2xl">
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 rounded-xl py-3">
              Projects
            </TabsTrigger>
            <TabsTrigger value="visualizer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl py-3">
              3D Explorer
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl py-3">
              Create Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="grid gap-6">
              {projects.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
                  <CardContent className="p-12 text-center">
                    <FlaskConical className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-white text-xl font-bold mb-2">No Research Projects Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first research project to get started</p>
                    <Button onClick={() => setActiveTab('create')} className="bg-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-black/60 backdrop-blur-xl border-cyan-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-xl mb-2">{project.title}</h3>
                            <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                            <div className="flex gap-2">
                              <Badge className={`bg-${project.status === 'active' ? 'green' : project.status === 'completed' ? 'purple' : 'blue'}-600`}>
                                {project.status}
                              </Badge>
                              <Badge variant="outline" className="border-white/20 text-white">
                                {project.team_size || 0} researchers
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" className="bg-cyan-600">View Details</Button>
                        </div>
                        
                        {project.progress !== undefined && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="visualizer">
            <InteractiveResearchVisualizer3D />
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Plus className="w-6 h-6 text-green-400" />
                  Create Research Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Project Title</label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="e.g., Neural Network Consciousness Patterns"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Describe your research objectives..."
                      className="bg-white/10 border-white/20 text-white h-32"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Research Field</label>
                    <select
                      value={newProject.field}
                      onChange={(e) => setNewProject({ ...newProject, field: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="ai">Artificial Intelligence</option>
                      <option value="quantum">Quantum Computing</option>
                      <option value="consciousness">Consciousness Studies</option>
                      <option value="physics">Computational Physics</option>
                      <option value="neuroscience">Neuroscience</option>
                    </select>
                  </div>

                  <Button 
                    onClick={() => createProjectMutation.mutate(newProject)}
                    disabled={!newProject.title || !newProject.description || createProjectMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-6 text-lg"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    {createProjectMutation.isPending ? 'Creating...' : 'Launch Research Project'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}