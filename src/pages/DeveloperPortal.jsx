import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Book, Rocket, Shield, Beaker } from 'lucide-react';
import SDKDocumentation from '../components/developer/SDKDocumentation';
import SandboxTester3D from '../components/developer/SandboxTester3D';
import JavaScriptSDKDocs from '../components/developer/JavaScriptSDKDocs';
import PythonSDKDocs from '../components/developer/PythonSDKDocs';
import InteractiveSandbox from '../components/developer/InteractiveSandbox';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DeveloperPortal() {
  const queryClient = useQueryClient();

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-portal'],
    queryFn: () => base44.entities.SandboxEnvironment.filter({ sandbox_status: 'active' }),
    initialData: []
  });

  const createSandboxMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sandboxManager', {
        action: 'create_sandbox',
        environment_name: 'Test Environment',
        integration_id: 'test_integration'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandboxes-portal'] });
      toast.success('Sandbox created!');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Code className="w-12 h-12 text-cyan-400 animate-pulse" />
            Developer Portal
          </h1>
          <p className="text-white/60 text-lg">
            Comprehensive documentation, SDKs, tutorials, and API reference for Omega integration
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <Code className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-white/60 text-sm">SDKs Available</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Book className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-white/60 text-sm">API Endpoints</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <Rocket className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">15+</div>
              <div className="text-white/60 text-sm">Tutorials</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-orange-400 mb-2" />
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/60 text-sm">API Uptime</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="docs" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/60 border-cyan-500/30">
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <JavaScriptSDKDocs />
              <PythonSDKDocs />
            </div>
            <SDKDocumentation />
          </TabsContent>

          <TabsContent value="sandbox" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <InteractiveSandbox />
              {sandboxes[0] && (
                <SandboxTester3D
                  sandbox={sandboxes[0]}
                  onRunTest={() => toast.success('Running test in sandbox...')}
                />
              )}
            </div>

            <Card className="bg-black/40 border-green-500/50">
              <CardHeader>
                <CardTitle className="text-white">Sandbox Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-white/80 text-sm">
                  <p>Secure, isolated testing environment with:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Complete mock data ecosystem (agents, consciousness, market data)</li>
                    <li>Resource limits: 1,000 API calls, 300s compute, 100MB storage</li>
                    <li>Real-time performance logging and metrics</li>
                    <li>Automated integration testing with detailed reports</li>
                    <li>Full isolation from production environment</li>
                    <li>Automatic cleanup after 24 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Getting Started', desc: 'Set up your first Omega integration in 5 minutes', difficulty: 'Beginner' },
                { title: 'Agent Creation', desc: 'Build and deploy custom AI agents', difficulty: 'Intermediate' },
                { title: 'Neural Chip Integration', desc: 'Connect to consciousness data streams', difficulty: 'Advanced' },
                { title: 'Marketplace Publishing', desc: 'List your augmentations on Omega Marketplace', difficulty: 'Intermediate' },
                { title: 'Webhook Configuration', desc: 'Real-time event notifications', difficulty: 'Intermediate' },
                { title: 'Advanced Security', desc: 'Implement OAuth and encryption', difficulty: 'Advanced' }
              ].map((tutorial, idx) => (
                <Card key={idx} className="bg-black/40 border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{tutorial.title}</h3>
                      <Badge className={
                        tutorial.difficulty === 'Beginner' ? 'bg-green-500/30 text-green-300' :
                        tutorial.difficulty === 'Intermediate' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-red-500/30 text-red-300'
                      }>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm">{tutorial.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-6">
            <Card className="bg-black/40 border-cyan-500/50">
              <CardHeader>
                <CardTitle className="text-white">Code Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-cyan-400 font-bold mb-2">Create and Train Agent</h3>
                  <div className="bg-black/80 p-4 rounded-lg border border-cyan-500/30">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`const agent = await omega.agents.create({
  name: 'Financial Advisor',
  personality: 'analytical',
  capabilities: ['portfolio_analysis', 'risk_assessment']
});

await omega.agents.train(agent.id, {
  dataset: 'financial_scenarios_v2',
  epochs: 100,
  learning_rate: 0.001
});`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-purple-400 font-bold mb-2">Access Consciousness Data</h3>
                  <div className="bg-black/80 p-4 rounded-lg border border-purple-500/30">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`const snapshot = await omega.consciousness.getLatest(userId);

console.log(snapshot.cognitive_state.focus_level);
console.log(snapshot.emotional_state.primary_emotion);

await omega.consciousness.sendCommand(userId, {
  type: 'motor_control',
  action: 'gesture_wave'
});`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card className="bg-black/40 border-cyan-500/50">
              <CardHeader>
                <CardTitle className="text-white">Developer Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-cyan-500/20 border border-cyan-500/50 p-4 rounded-lg">
                    <h3 className="text-cyan-400 font-bold mb-2">Community Discord</h3>
                    <p className="text-white/80 text-sm">Join 5,000+ developers building on Omega</p>
                  </div>

                  <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-bold mb-2">Stack Overflow</h3>
                    <p className="text-white/80 text-sm">Tag: omega-ecosystem</p>
                  </div>

                  <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
                    <h3 className="text-green-400 font-bold mb-2">GitHub Discussions</h3>
                    <p className="text-white/80 text-sm">github.com/omega-ecosystem/discussions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}