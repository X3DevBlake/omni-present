import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Bot, Zap, Settings, Activity, MessageSquare, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

const AI_ASSISTANTS = [
  {
    id: 'omni',
    name: 'Omni Assistant',
    icon: Sparkles,
    description: 'General-purpose AI assistant for all Omni products',
    features: ['Multi-modal', 'Context-aware', 'Voice enabled'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gemini',
    name: 'Gemini Assistant',
    icon: Bot,
    description: 'Google Gemini-powered assistant for advanced tasks',
    features: ['Multimodal AI', 'Code generation', 'Data analysis'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'vertex',
    name: 'Vertex AI Copilot',
    icon: Zap,
    description: 'Workflow automation and agent creation assistant',
    features: ['Workflow builder', 'Agent creator', 'API integration'],
    color: 'from-purple-500 to-pink-500'
  }
];

export default function AIManagement() {
  const [assistantSettings, setAssistantSettings] = useState({
    omni: { enabled: true, responsiveness: 80, verbosity: 60, autoSuggest: true },
    gemini: { enabled: true, responsiveness: 70, verbosity: 50, autoSuggest: false },
    vertex: { enabled: true, responsiveness: 90, verbosity: 70, autoSuggest: true }
  });

  const [globalSettings, setGlobalSettings] = useState({
    proactiveMode: true,
    multiAssistant: false,
    contextSharing: true,
    voiceEnabled: true
  });

  const [logs, setLogs] = useState([
    { assistant: 'vertex', action: 'Created trading agent', timestamp: new Date(Date.now() - 300000) },
    { assistant: 'omni', action: 'Answered user query', timestamp: new Date(Date.now() - 600000) },
    { assistant: 'gemini', action: 'Generated code snippet', timestamp: new Date(Date.now() - 900000) },
    { assistant: 'vertex', action: 'Built automation workflow', timestamp: new Date(Date.now() - 1200000) }
  ]);

  const updateAssistantSetting = (assistantId, setting, value) => {
    setAssistantSettings(prev => ({
      ...prev,
      [assistantId]: { ...prev[assistantId], [setting]: value }
    }));
  };

  const clearLogs = () => setLogs([]);

  return (
    <AuroraBackground>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="w-8 h-8" />
                AI Management Center
              </h1>
              <p className="text-white/60 mt-2">Configure and manage all AI assistants</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {Object.values(assistantSettings).filter(s => s.enabled).length} Active
            </Badge>
          </div>

          <Tabs defaultValue="assistants" className="space-y-6">
            <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="assistants">Assistants</TabsTrigger>
              <TabsTrigger value="global">Global Settings</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="assistants" className="space-y-4">
              {AI_ASSISTANTS.map((assistant) => {
                const settings = assistantSettings[assistant.id];
                const Icon = assistant.icon;

                return (
                  <Card key={assistant.id} className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white">{assistant.name}</CardTitle>
                            <CardDescription className="text-white/60">{assistant.description}</CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(val) => updateAssistantSetting(assistant.id, 'enabled', val)}
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        {assistant.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-white/80 text-sm">Responsiveness</label>
                          <span className="text-white/60 text-sm">{settings.responsiveness}%</span>
                        </div>
                        <Slider
                          value={[settings.responsiveness]}
                          onValueChange={(val) => updateAssistantSetting(assistant.id, 'responsiveness', val[0])}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-white/80 text-sm">Verbosity</label>
                          <span className="text-white/60 text-sm">{settings.verbosity}%</span>
                        </div>
                        <Slider
                          value={[settings.verbosity]}
                          onValueChange={(val) => updateAssistantSetting(assistant.id, 'verbosity', val[0])}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">Auto-Suggest</p>
                          <p className="text-white/60 text-xs">Proactive suggestions enabled</p>
                        </div>
                        <Switch
                          checked={settings.autoSuggest}
                          onCheckedChange={(val) => updateAssistantSetting(assistant.id, 'autoSuggest', val)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="global" className="space-y-4">
              <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Global AI Preferences</CardTitle>
                  <CardDescription className="text-white/60">Settings that apply to all AI assistants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Proactive Mode</p>
                      <p className="text-white/60 text-sm">AI assistants suggest actions automatically</p>
                    </div>
                    <Switch
                      checked={globalSettings.proactiveMode}
                      onCheckedChange={(val) => setGlobalSettings({ ...globalSettings, proactiveMode: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Multi-Assistant Mode</p>
                      <p className="text-white/60 text-sm">Allow multiple assistants to collaborate</p>
                    </div>
                    <Switch
                      checked={globalSettings.multiAssistant}
                      onCheckedChange={(val) => setGlobalSettings({ ...globalSettings, multiAssistant: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Context Sharing</p>
                      <p className="text-white/60 text-sm">Share conversation context between assistants</p>
                    </div>
                    <Switch
                      checked={globalSettings.contextSharing}
                      onCheckedChange={(val) => setGlobalSettings({ ...globalSettings, contextSharing: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Voice Enabled</p>
                      <p className="text-white/60 text-sm">Enable voice interactions for all assistants</p>
                    </div>
                    <Switch
                      checked={globalSettings.voiceEnabled}
                      onCheckedChange={(val) => setGlobalSettings({ ...globalSettings, voiceEnabled: val })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activity Logs
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={clearLogs}>Clear Logs</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {logs.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No activity logs</p>
                    ) : (
                      logs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-purple-400" />
                            <div>
                              <p className="text-white text-sm">{log.action}</p>
                              <p className="text-white/40 text-xs">{AI_ASSISTANTS.find(a => a.id === log.assistant)?.name}</p>
                            </div>
                          </div>
                          <span className="text-white/40 text-xs">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Total Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">1,247</p>
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                      <TrendingUp className="w-3 h-3" />
                      +12% this week
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Avg Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">1.2s</p>
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                      <TrendingUp className="w-3 h-3" />
                      -0.3s faster
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">94%</p>
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                      <TrendingUp className="w-3 h-3" />
                      +2% improvement
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuroraBackground>
  );
}