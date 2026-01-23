import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Code, Copy, Terminal, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CodeBlock = ({ code, language = 'javascript' }) => {
  return (
    <div className="relative bg-black/80 rounded-lg p-4 border border-cyan-500/30">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => {
          navigator.clipboard.writeText(code);
          toast.success('Code copied!');
        }}
      >
        <Copy className="w-3 h-3" />
      </Button>
      <pre className="text-green-400 text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function SDKDocumentation() {
  const jsSDK = `// Install
npm install @omega-sdk/javascript

// Initialize
import { OmegaClient } from '@omega-sdk/javascript';

const omega = new OmegaClient({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// List agents
const agents = await omega.agents.list({ limit: 50 });

// Create agent
const newAgent = await omega.agents.create({
  name: 'My Custom Agent',
  personality: 'analytical',
  capabilities: ['data_analysis', 'prediction']
});

// Deploy augmentation
const augmentation = await omega.augmentations.deploy({
  type: 'neural_interface',
  config: { sync_rate_hz: 100 }
});

// Access marketplace
const listings = await omega.marketplace.browse({
  category: 'consciousness_modules'
});`;

  const pythonSDK = `# Install
pip install omega-sdk

# Initialize
from omega_sdk import OmegaClient

omega = OmegaClient(
    api_key='your_api_key_here',
    environment='production'
)

# List agents
agents = omega.agents.list(limit=50)

# Create agent
new_agent = omega.agents.create(
    name='My Custom Agent',
    personality='analytical',
    capabilities=['data_analysis', 'prediction']
)

# Deploy augmentation
augmentation = omega.augmentations.deploy(
    type='neural_interface',
    config={'sync_rate_hz': 100}
)

# Access marketplace
listings = omega.marketplace.browse(
    category='consciousness_modules'
)`;

  const apiReference = `# API Reference

## Authentication
All requests require API key in Authorization header:
Authorization: Bearer YOUR_API_KEY

## Rate Limits
- 60 requests/minute
- 10,000 requests/day

## Endpoints

### GET /api/agents/list
List all agents
Query params: limit, offset, filter

### POST /api/agents/create
Create new agent
Body: { name, personality, capabilities[] }

### GET /api/marketplace/listings
Browse marketplace
Query params: category, min_rating, max_price

### POST /api/augmentations/deploy
Deploy augmentation
Body: { type, config, user_id }`;

  return (
    <Card className="bg-black/40 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <FileCode className="w-8 h-8 text-cyan-400" />
          SDK Documentation & Tutorials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript">
          <TabsList className="grid w-full grid-cols-3 bg-black/60">
            <TabsTrigger value="javascript">JavaScript SDK</TabsTrigger>
            <TabsTrigger value="python">Python SDK</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="mt-6 space-y-4">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                JavaScript SDK Guide
              </h3>
              <CodeBlock code={jsSDK} />
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg">
              <div className="text-blue-400 font-bold mb-2">Quick Start</div>
              <ul className="text-white/80 text-sm space-y-1">
                <li>1. Install SDK: <code className="bg-black/60 px-2 py-0.5 rounded">npm install @omega-sdk/javascript</code></li>
                <li>2. Get API key from Developer Console</li>
                <li>3. Initialize client with your key</li>
                <li>4. Start building!</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-6 space-y-4">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                Python SDK Guide
              </h3>
              <CodeBlock code={pythonSDK} language="python" />
            </div>

            <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
              <div className="text-green-400 font-bold mb-2">Features</div>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Full async/await support</li>
                <li>• Type hints for better IDE support</li>
                <li>• Automatic retry on rate limits</li>
                <li>• Built-in error handling</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6 space-y-4">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                REST API Reference
              </h3>
              <CodeBlock code={apiReference} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
                <div className="text-purple-400 font-bold mb-2">Available Endpoints</div>
                <ul className="text-white/80 text-xs space-y-1">
                  <li>• /api/agents/*</li>
                  <li>• /api/marketplace/*</li>
                  <li>• /api/augmentations/*</li>
                  <li>• /api/consciousness/*</li>
                  <li>• /api/neural/*</li>
                  <li>• /api/biometric/*</li>
                </ul>
              </div>

              <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg">
                <div className="text-orange-400 font-bold mb-2">Response Format</div>
                <CodeBlock code={`{
  "success": true,
  "data": {...},
  "metadata": {
    "timestamp": "2026-01-23T...",
    "version": "1.0"
  }
}`} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}