import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Code, Zap } from 'lucide-react';

const API_ENDPOINTS = [
  { method: 'POST', path: '/agents/create', description: 'Create a new AI agent', category: 'Agents' },
  { method: 'GET', path: '/agents/list', description: 'List all agents', category: 'Agents' },
  { method: 'POST', path: '/agents/train', description: 'Train an agent', category: 'Agents' },
  { method: 'POST', path: '/swarms/create', description: 'Create agent swarm', category: 'Collaboration' },
  { method: 'POST', path: '/swarms/execute', description: 'Execute swarm task', category: 'Collaboration' },
  { method: 'GET', path: '/consciousness/subscribe', description: 'Subscribe to consciousness stream', category: 'Consciousness' },
  { method: 'POST', path: '/consciousness/command', description: 'Send thought command', category: 'Consciousness' },
  { method: 'GET', path: '/analytics/insights', description: 'Get predictive insights', category: 'Analytics' },
  { method: 'POST', path: '/quantum/harmonize', description: 'Harmonize quantum states', category: 'Quantum' },
  { method: 'POST', path: '/sandbox/create', description: 'Create sandbox environment', category: 'Developer' }
];

export default function APIReferenceSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEndpoints = API_ENDPOINTS.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const methodColors = {
    GET: 'bg-green-500/30 text-green-300',
    POST: 'bg-blue-500/30 text-blue-300',
    PUT: 'bg-yellow-500/30 text-yellow-300',
    DELETE: 'bg-red-500/30 text-red-300'
  };

  return (
    <Card className="bg-black/40 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          Searchable API Reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search endpoints, methods, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/60 border-cyan-500/30 text-white"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEndpoints.map((endpoint, idx) => (
            <div
              key={idx}
              className="bg-black/60 p-3 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={methodColors[endpoint.method]}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-cyan-400 text-sm">{endpoint.path}</code>
                </div>
                <Badge variant="outline" className="text-white/60">
                  {endpoint.category}
                </Badge>
              </div>
              <p className="text-white/80 text-xs">{endpoint.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-cyan-500/20 border border-cyan-500/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-sm">
            <Code className="w-4 h-4" />
            <span>Found {filteredEndpoints.length} endpoints</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}