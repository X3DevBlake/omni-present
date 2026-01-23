import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Save, Upload, Download, GitFork, Sparkles, History, Play } from 'lucide-react';
import AgentCustomizationStudio3D from '../components/agents/AgentCustomizationStudio3D';
import AIBehaviorSuggestions3D from '../components/agents/AIBehaviorSuggestions3D';
import TemplateForkManager from '../components/agents/TemplateForkManager';
import ScenarioSimulator3D from '../components/agents/ScenarioSimulator3D';
import { toast } from 'sonner';

export default function AgentBehaviorStudio() {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [archetype, setArchetype] = useState('balanced');
  const [currentConfig, setCurrentConfig] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showScenarioTest, setShowScenarioTest] = useState(false);

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

  const { data: suggestions = [] } = useQuery({
    queryKey: ['ai-suggestions', currentConfig],
    queryFn: async () => {
      if (!currentConfig) return [];
      const response = await base44.functions.invoke('behaviorAISuggester', {
        action: 'generate_suggestions',
        current_config: currentConfig
      });
      return response.data.suggestions || [];
    },
    enabled: !!currentConfig,
    initialData: []
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['template-versions', selectedTemplateId],
    queryFn: async () => {
      if (!selectedTemplateId) return [];
      const response = await base44.functions.invoke('behaviorVersionController', {
        action: 'get_version_history',
        template_id: selectedTemplateId
      });
      return response.data.versions || [];
    },
    enabled: !!selectedTemplateId,
    initialData: []
  });

  const { data: scenarioTests = [] } = useQuery({
    queryKey: ['scenario-tests', selectedTemplateId],
    queryFn: async () => {
      if (!selectedTemplateId) return [];
      return await base44.entities.BehaviorScenarioTest.filter({ template_id: selectedTemplateId });
    },
    enabled: !!selectedTemplateId,
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

  const forkTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const response = await base44.functions.invoke('behaviorAISuggester', {
        action: 'fork_template',
        template_id: template.template_id,
        new_name: `${template.template_name} (My Fork)`
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-templates'] });
      toast.success('Template forked successfully!');
    }
  });

  const runScenarioMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplateId) return;
      const response = await base44.functions.invoke('scenarioSimulator', {
        action: 'run_scenario',
        template_id: selectedTemplateId,
        scenario_type: 'ethical_dilemma',
        complexity: 'high'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario-tests'] });
      toast.success('Scenario test completed!');
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

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
          </Button>
          <Button
            onClick={() => setShowScenarioTest(!showScenarioTest)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {showScenarioTest ? 'Hide' : 'Show'} Scenario Testing
          </Button>
        </div>

        {showSuggestions && currentConfig && (
          <div className="mb-6">
            <AIBehaviorSuggestions3D
              suggestions={suggestions}
              onApplySuggestion={(s) => {
                toast.success(`Applied: ${s.recommendation}`);
              }}
            />
          </div>
        )}

        {showScenarioTest && selectedTemplateId && (
          <div className="mb-6">
            <ScenarioSimulator3D
              test={scenarioTests[0]}
              onRunScenario={() => runScenarioMutation.mutate()}
            />
          </div>
        )}

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
                <div className="text-white/60 text-sm mb-3">Version History</div>
                {selectedTemplateId && versions.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {versions.map((version) => (
                      <div key={version.id} className="bg-black/60 p-2 rounded border border-purple-500/20">
                        <div className="text-white text-xs font-bold">v{version.version_number}</div>
                        <div className="text-white/60 text-xs">{version.ai_diff_summary}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/50 text-xs">Select a template to view versions</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <TemplateForkManager
          templates={templates}
          onFork={(template) => forkTemplateMutation.mutate(template)}
          onLoadTemplate={(template) => {
            setSelectedTemplateId(template.template_id);
            setCurrentConfig({
              proactiveness: template.behavioral_traits?.proactiveness || 0.7,
              creativity: 0.8,
              empathy: 0.75,
              risk_tolerance: template.behavioral_traits?.risk_preference || 0.5,
              autonomy: 0.6
            });
            toast.success('Template loaded!');
          }}
        />
      </div>
    </div>
  );
}