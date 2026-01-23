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
          <TabsList className="grid w-full grid-cols-5 bg-black/60">
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
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

          <TabsContent value="streaming" className="mt-4 space-y-4">
            <div>
              <h4 className="text-white font-bold mb-2">Real-Time Agent Status Streaming</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`// Subscribe to agent status updates
const agentStream = client.agents.stream(agentId);

agentStream.on('status_change', (data) => {
  console.log('Agent Status:', data.status);
  console.log('Current Task:', data.current_task);
  console.log('Performance:', data.performance_metrics);
});

agentStream.on('error', (error) => {
  console.error('Stream error:', error);
});

// Cleanup
agentStream.close();`, 'streaming1')}
                >
                  {copiedSection === 'streaming1' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{`// Subscribe to agent status updates
const agentStream = client.agents.stream(agentId);

agentStream.on('status_change', (data) => {
  console.log('Agent Status:', data.status);
  console.log('Current Task:', data.current_task);
  console.log('Performance:', data.performance_metrics);
});

agentStream.on('error', (error) => {
  console.error('Stream error:', error);
});

// Cleanup
agentStream.close();`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-2">Advanced AI Model Integration</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`// Integrate custom AI model
const customModel = await client.ai.registerModel({
  name: 'MyCustomModel',
  type: 'transformer',
  endpoint: 'https://my-model-api.com',
  apiKey: process.env.MODEL_API_KEY
});

// Use model for agent enhancement
const enhancedAgent = await client.agents.enhance({
  agent_id: agentId,
  ai_model: customModel.id,
  capabilities: ['reasoning', 'prediction']
});`, 'streaming2')}
                >
                  {copiedSection === 'streaming2' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{`// Integrate custom AI model
const customModel = await client.ai.registerModel({
  name: 'MyCustomModel',
  type: 'transformer',
  endpoint: 'https://my-model-api.com',
  apiKey: process.env.MODEL_API_KEY
});

// Use model for agent enhancement
const enhancedAgent = await client.agents.enhance({
  agent_id: agentId,
  ai_model: customModel.id,
  capabilities: ['reasoning', 'prediction']
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-2">Enhanced Error Handling & Debugging</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`// Enable debug mode
client.setDebugMode(true);

try {
  const result = await client.agents.execute(task);
} catch (error) {
  // Detailed error information
  console.error('Error Code:', error.code);
  console.error('Details:', error.details);
  console.error('Stack Trace:', error.stackTrace);
  console.error('Request ID:', error.requestId);
  
  // Automatic retry with exponential backoff
  if (error.retryable) {
    const retryResult = await client.retry(error.requestId);
  }
}`, 'streaming3')}
                >
                  {copiedSection === 'streaming3' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-green-400 text-xs overflow-x-auto">
                  <code>{`// Enable debug mode
client.setDebugMode(true);

try {
  const result = await client.agents.execute(task);
} catch (error) {
  // Detailed error information
  console.error('Error Code:', error.code);
  console.error('Details:', error.details);
  console.error('Stack Trace:', error.stackTrace);
  console.error('Request ID:', error.requestId);
  
  // Automatic retry with exponential backoff
  if (error.retryable) {
    const retryResult = await client.retry(error.requestId);
  }
}`}</code>
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
                <div className="text-yellow-400 font-bold mb-1">client.agents.stream(agentId)</div>
                <div className="text-white/70 text-sm">Streams real-time agent status and performance updates</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.ai.registerModel(config)</div>
                <div className="text-white/70 text-sm">Integrates custom AI models for agent enhancement</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.swarms.execute(swarmId)</div>
                <div className="text-white/70 text-sm">Executes a multi-agent swarm operation</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.consciousness.subscribe(userId)</div>
                <div className="text-white/70 text-sm">Subscribes to real-time consciousness updates</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold mb-1">client.setDebugMode(enabled)</div>
                <div className="text-white/70 text-sm">Enables detailed error tracking and debugging information</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}