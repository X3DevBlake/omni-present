import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Play, Copy, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationTemplateManager({ userEmail }) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);

  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['collaboration-templates'],
    queryFn: async () => {
      // Store templates in DynamicUIConfig for flexibility
      const configs = await base44.entities.DynamicUIConfig.filter({ 
        config_type: 'collaboration_template' 
      });
      return configs;
    }
  });

  const { data: agents } = useQuery({
    queryKey: ['agents-for-templates'],
    queryFn: () => base44.entities.Agent.list('-created_date', 50)
  });

  const saveTemplate = useMutation({
    mutationFn: async () => {
      return await base44.entities.DynamicUIConfig.create({
        config_name: templateName,
        page_or_component: 'CollaborationHub',
        config_type: 'collaboration_template',
        user_email: userEmail,
        configuration: {
          description: templateDescription,
          agent_roles: selectedAgents,
          workflow_steps: [],
          created_by: userEmail
        },
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-templates'] });
      toast.success('Template saved!');
      setTemplateName('');
      setTemplateDescription('');
      setSelectedAgents([]);
    }
  });

  const applyTemplate = useMutation({
    mutationFn: async (template) => {
      // Create a new collaboration from template
      return await base44.entities.AgentCollaboration.create({
        workspace_id: `workspace-${Date.now()}`,
        participating_agents: template.configuration?.agent_roles || [],
        collaboration_type: 'template_based',
        status: 'active',
        user_email: userEmail,
        metadata: {
          template_id: template.id,
          template_name: template.config_name
        }
      });
    },
    onSuccess: () => {
      toast.success('Template applied! Collaboration started.');
    }
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template) => {
      return await base44.entities.DynamicUIConfig.create({
        ...template,
        config_name: `${template.config_name} (Copy)`,
        user_email: userEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-templates'] });
      toast.success('Template duplicated!');
    }
  });

  const popularTemplates = [
    { name: 'Trading Strategy', agents: ['Analyst', 'Trader', 'Risk Manager'], icon: '📈' },
    { name: 'Research Team', agents: ['Researcher', 'Summarizer', 'Validator'], icon: '🔬' },
    { name: 'Content Creation', agents: ['Writer', 'Editor', 'Designer'], icon: '✍️' },
    { name: 'Code Review', agents: ['Developer', 'QA Tester', 'Architect'], icon: '💻' }
  ];

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Collaboration Templates
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template Name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  placeholder="Description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Agents</label>
                  <div className="grid grid-cols-2 gap-2">
                    {agents?.slice(0, 6).map(agent => (
                      <Button
                        key={agent.id}
                        size="sm"
                        variant={selectedAgents.includes(agent.id) ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedAgents(prev => 
                            prev.includes(agent.id) 
                              ? prev.filter(id => id !== agent.id)
                              : [...prev, agent.id]
                          );
                        }}
                        className="justify-start"
                      >
                        {agent.agent_name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => saveTemplate.mutate()}
                  disabled={!templateName || selectedAgents.length === 0}
                  className="w-full"
                >
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Popular Templates */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Popular Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularTemplates.map((template, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="text-white font-semibold text-sm">{template.name}</span>
                  <Star className="w-4 h-4 text-yellow-400 ml-auto" />
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{template.agents.length} agents</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.agents.map((agent, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Templates */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Your Templates</h4>
          <div className="space-y-3">
            {templates?.map(template => (
              <div key={template.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{template.config_name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateTemplate.mutate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => applyTemplate.mutate(template)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {template.configuration?.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  {template.configuration?.agent_roles?.length || 0} agents
                </div>
              </div>
            ))}
            
            {(!templates || templates.length === 0) && (
              <div className="text-center py-6 text-gray-400 text-sm">
                No templates yet. Create your first template!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}