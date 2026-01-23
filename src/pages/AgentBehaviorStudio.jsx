import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Save, Upload, Download } from 'lucide-react';
import AgentCustomizationStudio3D from '../components/agents/AgentCustomizationStudio3D';
import { toast } from 'sonner';

export default function AgentBehaviorStudio() {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [archetype, setArchetype] = useState('balanced');
  const [currentConfig, setCurrentConfig] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['behavior-templates'],
    queryFn: async () => {
      const response = await base44.functions.invoke('behaviorTemplateEngine', {
        action: 'get_templates',
        public_only: false
      });
      return response.data.templates || [];
    },
    initialData: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (config) => {
      const response = await base44.functions.invoke('behaviorTemplateEngine', {
        action: 'create_template',
        template_name: templateName,
        personality_archetype: archetype,
        traits: {
          proactiveness: config.proactiveness,
          risk_preference: config.risk_tolerance || 0.5,
          collaboration_style: 'cooperative',
          decision_speed: 0.8,
          learning_aggressiveness: 0.7
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-templates'] });
      setTemplateName('');
      toast.success('Behavior template created!');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Wand2 className="w-12 h-12 text-purple-400 animate-pulse" />
            Agent Behavior Studio
          </h1>
          <p className="text-white/60 text-lg">
            Train and customize specific agent behaviors, ethical frameworks, and personality archetypes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 bg-black/40 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white">Live Agent Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentCustomizationStudio3D onSave={(config) => setCurrentConfig(config)} />
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white">Save as Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Empathetic Assistant"
                  className="bg-black/60 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Personality Archetype</label>
                <Select value={archetype} onValueChange={setArchetype}>
                  <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                    <SelectItem value="decisive">Decisive</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => currentConfig && createTemplateMutation.mutate(currentConfig)}
                disabled={!templateName || !currentConfig}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>

              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="text-white/60 text-sm mb-3">Saved Templates ({templates.length})</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-black/60 p-3 rounded-lg border border-purple-500/20"
                    >
                      <div className="text-white text-sm font-bold">{template.template_name}</div>
                      <div className="text-white/60 text-xs">{template.personality_archetype}</div>
                      <div className="text-white/50 text-xs mt-1">
                        Used {template.usage_stats?.times_applied || 0} times
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}