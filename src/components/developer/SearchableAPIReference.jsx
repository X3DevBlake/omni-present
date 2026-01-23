import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Code, Zap } from 'lucide-react';

const API_ENDPOINTS = [
  { method: 'POST', path: '/agents/create', description: 'Create a new AI agent', category: 'Agents' },
  { method: 'GET', path: '/agents/list', description: 'List all agents', category: 'Agents' },
  { method: 'PUT', path: '/agents/:id/update', description: 'Update agent configuration', category: 'Agents' },
  { method: 'DELETE', path: '/agents/:id', description: 'Delete an agent', category: 'Agents' },
  { method: 'POST', path: '/swarms/create', description: 'Initialize swarm intelligence', category: 'Collaboration' },
  { method: 'POST', path: '/swarms/:id/execute', description: 'Execute swarm task', category: 'Collaboration' },
  { method: 'GET', path: '/consciousness/stream', description: 'Subscribe to consciousness data', category: 'Consciousness' },
  { method: 'POST', path: '/consciousness/command', description: 'Send neural command', category: 'Consciousness' },
  { method: 'GET', path: '/quantum/states', description: 'Get quantum consciousness states', category: 'Quantum' },
  { method: 'POST', path: '/quantum/harmonize', description: 'Harmonize quantum states', category: 'Quantum' },
  { method: 'POST', path: '/training/scenario/create', description: 'Create training scenario', category: 'Training' },
  { method: 'POST', path: '/training/scenario/run', description: 'Execute training session', category: 'Training' },
  { method: 'GET', path: '/analytics/behavior', description: 'Get user behavior analytics', category: 'Analytics' },
  { method: 'POST', path: '/personalization/apply', description: 'Apply AI personalization', category: 'Personalization' },
  { method: 'GET', path: '/emergent/behaviors', description: 'List emergent behaviors', category: 'Intelligence' }
];

export default function SearchableAPIReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(API_ENDPOINTS.map(e => e.category))];

  const filteredEndpoints = useMemo(() => {
    return API_ENDPOINTS.filter(endpoint => {
      const matchesSearch = searchQuery === '' || 
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || endpoint.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Card className="bg-black/40 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-400" />
          Searchable API Reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/60 border-purple-500/30 text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              className={`cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-500/50 text-white'
                  : 'bg-black/60 text-white/60 hover:bg-black/80'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredEndpoints.map((endpoint, idx) => (
            <div
              key={idx}
              className="bg-black/60 p-4 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all"
            >
              <div className="flex items-start gap-3">
                <Badge className={`
                  ${endpoint.method === 'GET' ? 'bg-blue-500/30 text-blue-300' : ''}
                  ${endpoint.method === 'POST' ? 'bg-green-500/30 text-green-300' : ''}
                  ${endpoint.method === 'PUT' ? 'bg-yellow-500/30 text-yellow-300' : ''}
                  ${endpoint.method === 'DELETE' ? 'bg-red-500/30 text-red-300' : ''}
                `}>
                  {endpoint.method}
                </Badge>
                <div className="flex-1">
                  <div className="text-white font-mono font-bold text-sm mb-1">
                    {endpoint.path}
                  </div>
                  <div className="text-white/70 text-xs mb-2">
                    {endpoint.description}
                  </div>
                  <Badge variant="outline" className="text-xs text-purple-400">
                    {endpoint.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center text-white/60 py-8">
            No endpoints found matching your search
          </div>
        )}

        <div className="mt-4 bg-purple-500/20 border border-purple-500/50 p-3 rounded-lg">
          <div className="text-purple-400 text-xs font-bold mb-1">
            {filteredEndpoints.length} endpoints available
          </div>
          <div className="text-white/70 text-xs">
            Use the search and category filters to find what you need
          </div>
        </div>
      </CardContent>
    </Card>
  );
}