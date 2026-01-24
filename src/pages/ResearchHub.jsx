import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import BlockchainIntegrityVisualizer3D from '../components/security/BlockchainIntegrityVisualizer3D';
import DecentralizedVaultManager3D from '../components/security/DecentralizedVaultManager3D';
import { FlaskConical, Users, Shield, Sparkles, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ResearchHub() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    abstract: '',
    research_type: 'experimental'
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProjects = [] } = useQuery({
    queryKey: ['my-research-projects'],
    queryFn: () => base44.entities.ResearchProject.filter({ principal_investigator: user.id }),
    enabled: !!user
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['all-research-projects'],
    queryFn: () => base44.entities.ResearchProject.list()
  });

  const { data: collaborativeProjects = [] } = useQuery({
    queryKey: ['collaborative-projects'],
    queryFn: async () => {
      const projects = await base44.entities.ResearchProject.list();
      return projects.filter(p => p.collaborators?.includes(user.id));
    },
    enabled: !!user
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      const response = await base44.functions.invoke('academicOrchestrator', {
        action: 'create_research_project',
        ...projectData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-research-projects'] });
      setShowCreateForm(false);
      setNewProject({ title: '', abstract: '', research_type: 'experimental' });
      toast.success('Research project created with blockchain-secured data vault!');
    }
  });

  const requestLiteratureReview = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'literature_review',
        query
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Literature review completed!');
    }
  });

  const handleCreateProject = () => {
    createProjectMutation.mutate(newProject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Research Hub</h1>
            <p className="text-gray-300">Blockchain-secured collaborative research</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Research Project
          </Button>
        </div>
      </motion.div>

      {/* Create Project Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Research Project</h3>
            <div className="space-y-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
              <Textarea
                placeholder="Abstract"
                value={newProject.abstract}
                onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                className="bg-white/10 border-white/20 text-white h-32"
              />
              <select
                value={newProject.research_type}
                onChange={(e) => setNewProject({ ...newProject, research_type: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-2"
              >
                <option value="theoretical">Theoretical</option>
                <option value="experimental">Experimental</option>
                <option value="applied">Applied</option>
                <option value="mixed_methods">Mixed Methods</option>
              </select>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">My Projects</CardTitle>
            <FlaskConical className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{myProjects.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Collaborations</CardTitle>
            <Users className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{collaborativeProjects.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Blockchain Secured</CardTitle>
            <Shield className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{allProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Integrity Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <BlockchainIntegrityVisualizer3D />
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {myProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-blue-400/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl mb-2">{project.title}</CardTitle>
                    <p className="text-gray-300 text-sm">{project.abstract}</p>
                  </div>
                  <Badge className={
                    project.status === 'active' ? 'bg-green-500' :
                    project.status === 'peer_review' ? 'bg-amber-500' :
                    project.status === 'published' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-400">Collaborators:</span>
                  {project.collaborators?.map((collabId, i) => (
                    <Badge key={i} variant="outline" className="text-white border-white/20">
                      {collabId.substring(0, 8)}
                    </Badge>
                  ))}
                  {project.ai_assistants?.map((aiId, i) => (
                    <Badge key={i} className="bg-purple-500/30 text-purple-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Assistant
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Data Vaults ({project.data_vaults?.length || 0})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white"
                    onClick={() => requestLiteratureReview.mutate(project.title)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Literature Review
                  </Button>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-gray-400 font-semibold">Milestones:</div>
                    {project.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={milestone.completed ? 'text-green-400' : 'text-gray-400'}>
                          {milestone.completed ? '✓' : '○'}
                        </span>
                        <span className="text-white">{milestone.milestone_name}</span>
                        {milestone.blockchain_anchor && (
                          <Badge variant="outline" className="text-xs border-emerald-400/30 text-emerald-300">
                            Blockchain ✓
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Decentralized Vault Manager */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DecentralizedVaultManager3D />
      </motion.div>
    </div>
  );
}