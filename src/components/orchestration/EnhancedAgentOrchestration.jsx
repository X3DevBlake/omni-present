import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Database, MessageSquare, TrendingUp } from 'lucide-react';
import SharedKnowledgeGraph3D from '../knowledge/SharedKnowledgeGraph3D';

export default function EnhancedAgentOrchestration({ orchestrationId }) {
  const queryClient = useQueryClient();
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  const { data: knowledge } = useQuery({
    queryKey: ['shared-knowledge'],
    queryFn: () => base44.entities.SharedKnowledgeBase.list('-relevance_score', 50)
  });

  const { data: orchestration } = useQuery({
    queryKey: ['orchestration', orchestrationId],
    queryFn: () => orchestrationId ? base44.entities.AgentOrchestration.get(orchestrationId) : null,
    enabled: !!orchestrationId
  });

  const postKnowledge = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('postKnowledge', {
        agent_id: data.agentId,
        knowledge_type: data.type,
        content: data.content,
        tags: data.tags
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-knowledge'] })
  });

  const queryKnowledge = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('queryKnowledge', {
        agent_id: 'orchestrator',
        query: query,
        knowledge_types: ['insight', 'solution', 'pattern']
      });
      return response.data;
    }
  });

  const [knowledgeForm, setKnowledgeForm] = useState({
    agentId: 'agent_001',
    type: 'insight',
    content: '',
    tags: []
  });

  const handleNodeClick = (knowledge) => {
    setSelectedKnowledge(knowledge);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Shared Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Agent ID"
              value={knowledgeForm.agentId}
              onChange={(e) => setKnowledgeForm({...knowledgeForm, agentId: e.target.value})}
              className="bg-white/5 border-white/20 text-white"
            />
            <select
              value={knowledgeForm.type}
              onChange={(e) => setKnowledgeForm({...knowledgeForm, type: e.target.value})}
              className="bg-white/5 border border-white/20 text-white rounded-md px-3 py-2"
            >
              <option value="insight">Insight</option>
              <option value="solution">Solution</option>
              <option value="pattern">Pattern</option>
              <option value="discovery">Discovery</option>
              <option value="warning">Warning</option>
            </select>
            <Button
              onClick={() => postKnowledge.mutate(knowledgeForm)}
              disabled={!knowledgeForm.content || postKnowledge.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Post Knowledge
            </Button>
          </div>
          <Input
            placeholder="Knowledge content..."
            value={knowledgeForm.content}
            onChange={(e) => setKnowledgeForm({...knowledgeForm, content: e.target.value})}
            className="bg-white/5 border-white/20 text-white"
          />
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardContent className="p-6">
          <SharedKnowledgeGraph3D knowledge={knowledge} onNodeClick={handleNodeClick} />
        </CardContent>
      </Card>

      {selectedKnowledge && (
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Knowledge Details</span>
              <Badge className="bg-purple-600">{selectedKnowledge.knowledge_type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-white/70 text-sm">Content:</span>
              <p className="text-white mt-1">{selectedKnowledge.content}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Relevance:</span>
                <p className="text-green-400 font-medium">{selectedKnowledge.relevance_score}%</p>
              </div>
              <div>
                <span className="text-white/70">Impact:</span>
                <p className="text-blue-400 font-medium">{selectedKnowledge.impact_score || 0}</p>
              </div>
              <div>
                <span className="text-white/70">Accessed:</span>
                <p className="text-white font-medium">{selectedKnowledge.access_count || 0}x</p>
              </div>
              <div>
                <span className="text-white/70">Contributors:</span>
                <p className="text-white font-medium">{selectedKnowledge.contributing_agents?.length || 0}</p>
              </div>
            </div>
            {selectedKnowledge.tags && selectedKnowledge.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedKnowledge.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-white/20 text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{knowledge?.length || 0}</div>
              <div className="text-white/70 text-sm">Total Knowledge</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {knowledge?.filter(k => k.verified).length || 0}
              </div>
              <div className="text-white/70 text-sm">Verified</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {orchestration?.participating_agents?.length || 0}
              </div>
              <div className="text-white/70 text-sm">Active Agents</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}