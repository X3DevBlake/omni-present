import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Brain, Sparkles, Zap, Settings, BarChart3, Code, FileText } from 'lucide-react';

export default function MistralHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedModel, setSelectedModel] = useState('mistral-large-latest');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [temperature, setTemperature] = useState(0.7);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const generateContent = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/mistral-agent-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentGoal: prompt,
          agentContext: `Model: ${selectedModel}, Temperature: ${temperature}`
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
    }
  });

  const quickPrompts = [
    { label: 'Create Trading Agent', prompt: 'Create an autonomous trading agent specialized in cryptocurrency markets' },
    { label: 'Generate Market Analysis', prompt: 'Generate a comprehensive market analysis for Q1 2026' },
    { label: 'Design Agent Personality', prompt: 'Design a collaborative agent personality focused on team coordination' },
    { label: 'Build Knowledge Graph', prompt: 'Build a knowledge graph structure for financial data' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Mistral AI Hub</h1>
              <p className="text-white/60">Advanced AI capabilities integrated throughout the platform</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
            <TabsTrigger value="playground" className="data-[state=active]:bg-indigo-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-indigo-500/20">
              <Brain className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-indigo-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Docs
            </TabsTrigger>
          </TabsList>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-400" />
                    AI Generation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm mb-2 block">Model</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mistral-large-latest">Mistral Large (Latest)</SelectItem>
                          <SelectItem value="mistral-medium-latest">Mistral Medium</SelectItem>
                          <SelectItem value="mistral-small-latest">Mistral Small</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-white/80 text-sm mb-2 block">Temperature: {temperature}</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-sm mb-2 block">Prompt</label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        className="min-h-[200px] bg-white/5 border-white/10"
                      />
                    </div>

                    <Button 
                      onClick={() => generateContent.mutate()}
                      disabled={generateContent.isPending || !prompt}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {generateContent.isPending ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Output Section */}
                {generatedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 p-6">
                      <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Generated Content
                      </h3>
                      <pre className="text-white/80 text-sm overflow-auto max-h-[400px] bg-black/40 p-4 rounded-lg">
                        {JSON.stringify(generatedContent, null, 2)}
                      </pre>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Quick Prompts</h3>
                  <div className="space-y-2">
                    {quickPrompts.map((qp, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setPrompt(qp.prompt)}
                        variant="outline"
                        className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        {qp.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Integration Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">API Status</span>
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Model</span>
                      <span className="text-white text-sm">{selectedModel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Requests Today</span>
                      <span className="text-white text-sm">0</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Mistral-Powered Agents</h3>
              <p className="text-white/60 mb-4">
                All agents in the platform can leverage Mistral AI for enhanced decision-making and autonomous operations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Agent Creator', 'Decision Engine', 'Strategy Generator', 'Communication Hub'].map((feature, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white font-medium">{feature}</p>
                    <p className="text-white/40 text-sm mt-1">Integrated with Mistral AI</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Usage Analytics</h3>
              <p className="text-white/60">Coming soon: Detailed analytics on AI usage, token consumption, and performance metrics.</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Mistral AI Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">API Key Status</label>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">✓ API Key Configured</p>
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Default Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral-large-latest">Mistral Large (Latest)</SelectItem>
                      <SelectItem value="mistral-medium-latest">Mistral Medium</SelectItem>
                      <SelectItem value="mistral-small-latest">Mistral Small</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="mt-6">
            <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Mistral AI Documentation</h3>
              <div className="space-y-4 text-white/80">
                <div>
                  <h4 className="font-bold text-white mb-2">Getting Started</h4>
                  <p>Mistral AI is integrated throughout the platform to enhance agent capabilities, provide intelligent suggestions, and automate complex tasks.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Available Models</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mistral Large: Best for complex tasks and reasoning</li>
                    <li>Mistral Medium: Balanced performance and speed</li>
                    <li>Mistral Small: Fast responses for simple tasks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Autonomous agent creation</li>
                    <li>Real-time decision support</li>
                    <li>Natural language understanding</li>
                    <li>Strategy generation</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}