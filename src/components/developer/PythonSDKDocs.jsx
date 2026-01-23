import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PythonSDKDocs() {
  const [copiedSection, setCopiedSection] = useState('');

  const copyCode = (code, section) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    toast.success('Code copied!');
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <Card className="bg-black/40 border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          Python SDK Documentation
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
                onClick={() => copyCode('pip install omnipresent-sdk', 'install')}
              >
                {copiedSection === 'install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <pre className="text-blue-400 text-sm">
                <code>pip install omnipresent-sdk</code>
              </pre>
            </div>
            <div className="mt-4 text-white/80 text-sm space-y-2">
              <p><strong>Requirements:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Python 3.8+</li>
                <li>requests library</li>
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
                onClick={() => copyCode(`from omnipresent import OmniPresentClient

client = OmniPresentClient(
    api_key='your_api_key',
    endpoint='https://api.omnipresent.ai'
)

# Create an agent
agent = client.agents.create(
    name='MyAgent',
    capabilities=['analysis', 'prediction']
)

# Execute a task
result = client.tasks.execute(
    agent_id=agent.id,
    task_type='data_analysis',
    payload={'dataset_url': 'https://...'}
)`, 'quickstart')}
              >
                {copiedSection === 'quickstart' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <pre className="text-blue-400 text-xs overflow-x-auto">
                <code>{`from omnipresent import OmniPresentClient

client = OmniPresentClient(
    api_key='your_api_key',
    endpoint='https://api.omnipresent.ai'
)

# Create an agent
agent = client.agents.create(
    name='MyAgent',
    capabilities=['analysis', 'prediction']
)

# Execute a task
result = client.tasks.execute(
    agent_id=agent.id,
    task_type='data_analysis',
    payload={'dataset_url': 'https://...'}
)`}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-4 space-y-4">
            <div>
              <h4 className="text-white font-bold mb-2">AI Training Scenario</h4>
              <div className="bg-gray-900 p-4 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`scenario = client.training.create_scenario(
    name='Ethical Decision Making',
    complexity=8,
    dilemmas=[
        {
            'type': 'resource_allocation',
            'options': ['Option A', 'Option B']
        }
    ]
)

results = client.training.run_scenario(
    agent_id=agent.id,
    scenario_id=scenario.id
)

print(f"Ethical Score: {results.ethical_alignment}")`, 'example1')}
                >
                  {copiedSection === 'example1' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <pre className="text-blue-400 text-xs overflow-x-auto">
                  <code>{`scenario = client.training.create_scenario(
    name='Ethical Decision Making',
    complexity=8,
    dilemmas=[
        {
            'type': 'resource_allocation',
            'options': ['Option A', 'Option B']
        }
    ]
)

results = client.training.run_scenario(
    agent_id=agent.id,
    scenario_id=scenario.id
)

print(f"Ethical Score: {results.ethical_alignment}")`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-4">
            <div className="space-y-3">
              <div className="bg-black/60 p-3 rounded-lg border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-1">client.agents.create(**kwargs)</div>
                <div className="text-white/70 text-sm">Creates a new AI agent with specified capabilities</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-1">client.training.run_scenario(agent_id, scenario_id)</div>
                <div className="text-white/70 text-sm">Executes a training scenario for an agent</div>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-blue-500/30">
                <div className="text-blue-400 font-bold mb-1">client.analytics.get_insights(user_id)</div>
                <div className="text-white/70 text-sm">Retrieves predictive analytics and behavior insights</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}