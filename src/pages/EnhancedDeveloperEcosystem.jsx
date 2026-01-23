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
import InteractiveTutorialPlayer from '../components/developer/InteractiveTutorialPlayer';
import SearchableAPIReference from '../components/developer/SearchableAPIReference';
import OmniPresentSentientCore3D from '../components/sentient/OmniPresentSentientCore3D';
import AnimationShowcase3D from '../components/animations/AnimationShowcase3D';

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
          <TabsList className="grid w-full grid-cols-6 bg-black/60 border-cyan-500/30">
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="core">Sentient Core</TabsTrigger>
          </TabsList>

          <TabsContent value="sdks" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JavaScriptSDKDocs />
              <PythonSDKDocs />
            </div>
          </TabsContent>

          <TabsContent value="sandbox" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <InteractiveSandbox />
              
              <Card className="bg-black/40 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Mock Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
                      <div className="text-green-400 font-bold text-sm mb-1">Mock Agents</div>
                      <div className="text-white/70 text-xs">Pre-configured AI agents with various capabilities</div>
                    </div>
                    <div className="bg-cyan-500/20 border border-cyan-500/50 p-3 rounded-lg">
                      <div className="text-cyan-400 font-bold text-sm mb-1">Consciousness Data</div>
                      <div className="text-white/70 text-xs">Simulated neural and biometric streams</div>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/50 p-3 rounded-lg">
                      <div className="text-purple-400 font-bold text-sm mb-1">Market Data</div>
                      <div className="text-white/70 text-xs">Real-time crypto and financial data</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <InteractiveTutorialPlayer />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <SearchableAPIReference />
          </TabsContent>

          <TabsContent value="animations" className="mt-6">
            <AnimationShowcase3D animationCount={700} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}