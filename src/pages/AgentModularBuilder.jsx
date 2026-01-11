import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Brain, Eye, Ear, MessageSquare, Zap, Plus, Trash2, Settings, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

const MODULE_TYPES = {
  llm: { icon: Brain, label: 'Language Model', color: 'cyan' },
  vision: { icon: Eye, label: 'Vision', color: 'purple' },
  audio: { icon: Ear, label: 'Audio Processing', color: 'pink' },
  communication: { icon: MessageSquare, label: 'Communication', color: 'green' },
  reasoning: { icon: Cpu, label: 'Reasoning Engine', color: 'orange' },
  memory: { icon: Brain, label: 'Memory System', color: 'blue' }
};

const LLM_MODELS = ['gpt-4', 'claude-3', 'gemini-pro', 'mistral-large'];
const VISION_MODELS = ['clip', 'yolo-v8', 'sam', 'dinov2'];
const REASONING_TYPES = ['symbolic', 'neural', 'hybrid', 'causal'];

export default function AgentModularBuilder() {
  const [userEmail, setUserEmail] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const addModule = (type) => {
    const newModule = {
      id: Date.now(),
      type,
      config: getDefaultConfig(type)
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModuleConfig = (id, key, value) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, config: { ...m.config, [key]: value } } : m
    ));
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'llm':
        return { model: 'gpt-4', temperature: 0.7, maxTokens: 2000 };
      case 'vision':
        return { model: 'clip', resolution: 512 };
      case 'audio':
        return { sampleRate: 16000, format: 'wav' };
      case 'communication':
        return { protocol: 'json', maxConnections: 10 };
      case 'reasoning':
        return { type: 'hybrid', depth: 5 };
      case 'memory':
        return { type: 'vector', dimensions: 1536, capacity: 10000 };
      default:
        return {};
    }
  };

  const saveAgent = useMutation({
    mutationFn: async () => {
      return await base44.entities.Agent.create({
        name: agentName,
        created_by: userEmail,
        type: 'modular',
        architecture: {
          modules: modules.map(m => ({
            type: m.type,
            config: m.config
          }))
        },
        status: 'configured'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Modular agent created!');
      setAgentName('');
      setModules([]);
    }
  });

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
              Modular Agent Builder
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Snap together AI components to create custom agents
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Module Library */}
          <Card className="bg-black/40 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Available Modules
            </h3>
            <div className="space-y-2">
              {Object.entries(MODULE_TYPES).map(([type, { icon: Icon, label, color }]) => (
                <Button
                  key={type}
                  onClick={() => addModule(type)}
                  className={`w-full justify-start bg-${color}-500/20 hover:bg-${color}-500/30 border border-${color}-500/50`}
                  variant="outline"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Agent Canvas */}
          <Card className="bg-black/40 border-white/10 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Agent Architecture</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-white/5 border-white/10 w-48"
                />
                <Button
                  onClick={() => saveAgent.mutate()}
                  disabled={!agentName || modules.length === 0 || saveAgent.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Agent
                </Button>
              </div>
            </div>

            <div className="min-h-[400px] bg-black/20 rounded-lg p-4">
              {modules.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/40">
                  Add modules from the library to start building
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((module) => {
                    const { icon: Icon, label, color } = MODULE_TYPES[module.type];
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-${color}-500/10 border border-${color}-500/30 rounded-lg p-4`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 text-${color}-400`} />
                            <span className="text-white font-semibold">{label}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedModule(module)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeModule(module.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </div>

                        {selectedModule?.id === module.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pt-3 border-t border-white/10"
                          >
                            {module.type === 'llm' && (
                              <>
                                <Select
                                  value={module.config.model}
                                  onValueChange={(v) => updateModuleConfig(module.id, 'model', v)}
                                >
                                  <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {LLM_MODELS.map(m => (
                                      <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div>
                                  <label className="text-white/70 text-xs">
                                    Temperature: {module.config.temperature}
                                  </label>
                                  <Slider
                                    value={[module.config.temperature]}
                                    onValueChange={([v]) => updateModuleConfig(module.id, 'temperature', v)}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                  />
                                </div>
                              </>
                            )}

                            {module.type === 'vision' && (
                              <Select
                                value={module.config.model}
                                onValueChange={(v) => updateModuleConfig(module.id, 'model', v)}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VISION_MODELS.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {module.type === 'reasoning' && (
                              <Select
                                value={module.config.type}
                                onValueChange={(v) => updateModuleConfig(module.id, 'type', v)}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {REASONING_TYPES.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {modules.length > 0 && (
              <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-300 text-sm">
                  <strong>Agent Capabilities:</strong> This agent will have {modules.length} specialized modules
                  {modules.some(m => m.type === 'llm') && ' with language understanding'}
                  {modules.some(m => m.type === 'vision') && ', visual perception'}
                  {modules.some(m => m.type === 'reasoning') && ', advanced reasoning'}
                  {modules.some(m => m.type === 'memory') && ', and persistent memory'}.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
}