import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, Zap, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DynamicKnowledgeGraph({ userEmail }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const queryClient = useQueryClient();

  const { data: nodes } = useQuery({
    queryKey: ['knowledgeNodes', userEmail],
    queryFn: () => base44.entities.KnowledgeGraphNode.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const updateGraph = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/dynamic-graph-updater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInteractions: [],
          outcomes: [],
          externalData: {},
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeNodes'] });
      toast.success('Knowledge graph updated');
    }
  });

  const nodeColors = {
    concept: 'bg-cyan-500',
    skill: 'bg-purple-500',
    agent: 'bg-green-500',
    event: 'bg-orange-500',
    outcome: 'bg-pink-500',
    relationship: 'bg-blue-500'
  };

  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          Dynamic Knowledge Graph
        </h3>
        <Button
          onClick={() => updateGraph.mutate()}
          disabled={updateGraph.isPending}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-purple-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Auto-Update
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {nodes?.slice(0, 9).map(node => (
          <motion.div
            key={node.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedNode(node)}
            className={`p-3 rounded-lg cursor-pointer ${nodeColors[node.node_type]}/20 border border-${nodeColors[node.node_type]}/50`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${nodeColors[node.node_type]}`} />
              <p className="text-white font-semibold text-sm">{node.label}</p>
            </div>
            <Badge className="text-xs">{node.node_type}</Badge>
            {node.connections?.length > 0 && (
              <p className="text-white/60 text-xs mt-1">
                {node.connections.length} connections
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <h4 className="text-white font-bold mb-2">{selectedNode.label}</h4>
          <p className="text-white/70 text-sm mb-3">
            Type: {selectedNode.node_type} • Confidence: {(selectedNode.confidence * 100).toFixed(0)}%
          </p>
          {selectedNode.connections?.length > 0 && (
            <div>
              <p className="text-white/60 text-xs mb-2">Connections:</p>
              {selectedNode.connections.map((conn, i) => (
                <div key={i} className="text-xs text-white/50 mb-1">
                  → {conn.relationship_type} (strength: {(conn.strength * 100).toFixed(0)}%)
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-purple-300 text-xs flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Graph automatically evolves from agent interactions and outcomes
        </p>
      </div>
    </Card>
  );
}