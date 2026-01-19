import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Brain, Network, Sparkles, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import KnowledgeGraph3DVisualizer from '../components/knowledge/KnowledgeGraph3DVisualizer';
import { Badge } from '@/components/ui/badge';

export default function KnowledgeGraphHub() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const buildGraph = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('buildKnowledgeGraph', {
        agent_id: agentId,
        source_type: 'all',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph-nodes'] });
    },
  });

  const searchKnowledge = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('semanticSearch', {
        query,
        agent_id: selectedAgent?.id,
        limit: 20,
      });
      return response.data;
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Knowledge Graph
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Visualize agent knowledge, relationships, and semantic connections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                Knowledge Graph Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KnowledgeGraph3DVisualizer
                agentId={selectedAgent?.id}
                onNodeSelect={setSelectedNode}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Agent Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents?.slice(0, 5).map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedAgent?.id === agent.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-white/60">
                      {agent.agent_type || 'General Agent'}
                    </div>
                  </button>
                ))}

                {selectedAgent && (
                  <Button
                    onClick={() => buildGraph.mutate(selectedAgent.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={buildGraph.isPending}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {buildGraph.isPending ? 'Building...' : 'Rebuild Graph'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {selectedNode && (
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Node Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge className="mb-2">{selectedNode.node_type}</Badge>
                    <h3 className="text-white font-bold text-lg">{selectedNode.label}</h3>
                  </div>
                  <p className="text-white/70 text-sm">{selectedNode.content}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Confidence</div>
                      <div className="text-white font-bold">
                        {((selectedNode.confidence_score || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Accessed</div>
                      <div className="text-white font-bold">
                        {selectedNode.access_count || 0}x
                      </div>
                    </div>
                  </div>

                  {selectedNode.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Semantic Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search knowledge graph..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchKnowledge.mutate(searchQuery)}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={() => searchKnowledge.mutate(searchQuery)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {searchKnowledge.data?.results && (
              <div className="space-y-3">
                {searchKnowledge.data.results.map((result, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="mb-1">{result.node_type}</Badge>
                        <h4 className="text-white font-bold">{result.label}</h4>
                      </div>
                      <span className="text-cyan-400 text-sm font-medium">
                        {result.search_score.toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{result.content}</p>
                    
                    {result.connected_context?.length > 0 && (
                      <div className="text-xs text-white/50">
                        Related: {result.connected_context.map(c => c.label).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}