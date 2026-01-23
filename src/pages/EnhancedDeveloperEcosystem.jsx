import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Rocket, TestTube, Brain, Book } from 'lucide-react';
import JavaScriptSDKDocs from '../components/developer/JavaScriptSDKDocs';
import PythonSDKDocs from '../components/developer/PythonSDKDocs';
import InteractiveSandbox from '../components/developer/InteractiveSandbox';
import OmniPresentSentientCore3D from '../components/sentient/OmniPresentSentientCore3D';

export default function EnhancedDeveloperEcosystem() {
  const { data: integrations = [] } = useQuery({
    queryKey: ['sdk-integrations'],
    queryFn: () => base44.entities.SDKIntegration.list('-created_date', 20),
    initialData: []
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: () => base44.entities.SandboxEnvironment.filter({ sandbox_status: 'active' }),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Rocket className="w-12 h-12 text-cyan-400 animate-pulse" />
            Enhanced Developer Ecosystem
          </h1>
          <p className="text-white/60 text-lg">
            Robust SDKs, comprehensive documentation, and secure sandbox testing
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
            <CardContent className="pt-6">
              <Code className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-white/60 text-sm">SDK Languages</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50">
            <CardContent className="pt-6">
              <Book className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-white/60 text-sm">API Methods</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <TestTube className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">{sandboxes.length}</div>
              <div className="text-white/60 text-sm">Active Sandboxes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{integrations.length}</div>
              <div className="text-white/60 text-sm">Integrations</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <Rocket className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sdks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60 border-cyan-500/30">
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="core">Sentient Core</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          </TabsList>

          <TabsContent value="sdks" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JavaScriptSDKDocs />
              <PythonSDKDocs />
            </div>
          </TabsContent>

          <TabsContent value="sandbox" className="mt-6">
            <InteractiveSandbox />
          </TabsContent>

          <TabsContent value="core" className="mt-6">
            <OmniPresentSentientCore3D
              coreStatus={{
                intelligence_level: 9.5,
                consciousness_coherence: 0.96,
                autonomy_score: 0.91
              }}
            />
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Quick Start Guide', difficulty: 'Beginner', time: '10 min' },
                { title: 'Agent Creation', difficulty: 'Intermediate', time: '30 min' },
                { title: 'Consciousness Integration', difficulty: 'Advanced', time: '60 min' },
                { title: 'Multi-Agent Systems', difficulty: 'Advanced', time: '90 min' },
                { title: 'Swarm Intelligence', difficulty: 'Expert', time: '120 min' },
                { title: 'Quantum Consciousness', difficulty: 'Expert', time: '180 min' }
              ].map((tutorial, idx) => (
                <Card key={idx} className="bg-black/40 border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-bold mb-2">{tutorial.title}</h3>
                    <div className="flex gap-2">
                      <div className="text-cyan-400 text-xs">{tutorial.difficulty}</div>
                      <div className="text-white/60 text-xs">• {tutorial.time}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}