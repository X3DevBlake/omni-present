import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JavaScriptSDKDocs() {
  const [copiedSection, setCopiedSection] = useState('');

  const copyCode = (code, section) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    toast.success('Code copied!');
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <Card className="bg-black/40 border-yellow-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-yellow-400" />
          JavaScript SDK Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="installation" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60">
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="installation" className="mt-4">
            <div className="bg-gray-900 p-4 rounded-lg relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyCode('npm install @omni-present/sdk', 'install')}
              >
                {copiedSection === 'install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <pre className="text-green-400 text-sm">
                <code>npm install @omni-present/sdk</code>
              </pre>
            </div>
            <div className="mt-4 text-white/80 text-sm space-y-2">
              <p><strong>Requirements:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Node.js 16+ or modern browser</li>
                <li>TypeScript 4.5+ (optional)</li>
                <li>API Key from Developer Portal</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="quickstart" className="mt-4">
            <div className="bg-gray-900 p-4 rounded-lg relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`import { OmniPresentClient } from '@omni-present/sdk';

const client = new OmniPresentClient({
  apiKey: 'your_api_key',
  endpoint: 'https://api.omnipresent.ai'
});

// Create an agent
const agent = await client.agents.create({
  name: 'MyAgent',
  capabilities: ['analysis', 'prediction']
});

// Execute a task
const result = await client.tasks.execute({
  agent_id: agent.id,
  task_type: 'data_analysis',
  payload: { dataset_url: 'https://...' }
});`, 'quickstart')}
              >
                {copiedSection === 'quickstart' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <pre className="text-green-400 text-xs overflow-x-auto">
                <code>{`import { OmniPresentClient } from '@omni-present/sdk';

const client = new OmniPresentClient({
  apiKey: 'your_api_key',
  endpoint: 'https://api.omnipresent.ai'
});

// Create an agent
const agent = await client.agents.create({
  name: 'MyAgent',
  capabilities: ['analysis', 'prediction']
});

// Execute a task
const result = await client.tasks.execute({
  agent_id: agent.id,
  task_type: 'data_analysis',
  payload: { dataset_url: 'https://...' }
});`}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-4 space-y-4">
            <div>
              <h4 className="text-white font-bold mb-2">Multi-Agent Collaboration</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`const swarm = await client.swarms.create({
  agents: [agent1.id, agent2.id, agent3.id],
  protocol: 'consensus',
  task: 'optimize_portfolio'
});

await swarm.execute();
const results = await swarm.getResults();`, 'example1')}
                >
                  {copiedSection === 'example1' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{`const swarm = await client.swarms.create({
  agents: [agent1.id, agent2.id, agent3.id],
  protocol: 'consensus',
  task: 'optimize_portfolio'
});

await swarm.execute();
const results = await swarm.getResults();`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-2">Real-time Consciousness Monitoring</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`const stream = client.consciousness.subscribe(user.id);

stream.on('state_change', (data) => {
  console.log('Focus:', data.focus_level);
  console.log('Emotion:', data.emotional_state);
});`, 'example2')}
                >
                  {copiedSection === 'example2' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{`const stream = client.consciousness.subscribe(user.id);

stream.on('state_change', (data) => {
  console.log('Focus:', data.focus_level);
  console.log('Emotion:', data.emotional_state);
});`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-4">
            <div className="space-y-3">
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.agents.create(config)</div>
                <div className="text-white/70 text-sm">Creates a new AI agent with specified capabilities</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.swarms.execute(swarmId)</div>
                <div className="text-white/70 text-sm">Executes a multi-agent swarm operation</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.consciousness.subscribe(userId)</div>
                <div className="text-white/70 text-sm">Subscribes to real-time consciousness updates</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}