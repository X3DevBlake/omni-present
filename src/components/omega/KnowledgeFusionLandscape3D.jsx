import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Sparkles, Network, Merge } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ClusterNode({ cluster, position, onClick }) {
  const scale = 0.3 + (cluster.fusion_confidence || 0) * 0.4;
  const emissiveIntensity = 0.2 + (cluster.emergent_insights?.length || 0) * 0.1;

  return (
    <group position={position} onClick={() => onClick(cluster)}>
      <Sphere args={[scale, 32, 32]}>
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={emissiveIntensity}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text
        position={[0, scale + 0.3, 0]}
        fontSize={0.12}
        color="white"
        maxWidth={2}
        textAlign="center"
      >
        {cluster.cluster_name?.slice(0, 20)}
      </Text>
      {cluster.emergent_insights?.length > 0 && (
        <Sphere args={[scale * 0.3, 16, 16]} position={[scale + 0.2, scale, 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </Sphere>
      )}
    </group>
  );
}

function SemanticLink({ from, to, strength }) {
  return (
    <Line
      points={[from, to]}
      color="#a78bfa"
      lineWidth={strength * 3}
      opacity={0.4 + strength * 0.3}
    />
  );
}

export default function KnowledgeFusionLandscape3D() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: clusters } = useQuery({
    queryKey: ['fusedClusters'],
    queryFn: () => base44.entities.FusedKnowledgeCluster.list('-created_date', 30),
    initialData: []
  });

  const { data: nodes } = useQuery({
    queryKey: ['knowledgeNodes'],
    queryFn: () => base44.entities.DecentralizedKnowledgeNode.list('-created_date', 20),
    initialData: []
  });

  const fuseMutation = useMutation({
    mutationFn: ({ node_ids }) => 
      base44.functions.invoke('fuseKnowledgeNodes', {
        node_ids,
        fusion_strategy: 'ai_semantic_merge'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['fusedClusters']);
    }
  });

  const queryMutation = useMutation({
    mutationFn: ({ query }) => 
      base44.functions.invoke('queryKnowledgeFusion', { query }),
    onSuccess: (data) => {
      setSearchResults(data.data);
    }
  });

  const handleFuse = async () => {
    const validatedNodes = nodes.filter(n => n.validation_status === 'validated');
    if (validatedNodes.length >= 2) {
      const nodeIds = validatedNodes.slice(0, 3).map(n => n.node_id);
      await fuseMutation.mutateAsync({ node_ids: nodeIds });
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      await queryMutation.mutateAsync({ query });
    }
  };

  // Calculate cluster positions
  const clusterPositions = clusters.map((cluster, idx) => {
    const angle = (idx / clusters.length) * Math.PI * 2;
    const radius = 4;
    return {
      cluster,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 3
      ]
    };
  });

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-6 h-6 text-purple-400" />
          AI-Driven Knowledge Fusion Landscape
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Central Fusion Core */}
            <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#8b5cf6" 
                emissive="#8b5cf6" 
                emissiveIntensity={0.6}
                metalness={0.8}
              />
            </Sphere>
            
            {/* Knowledge Clusters */}
            {clusterPositions.map(({ cluster, position }, idx) => (
              <React.Fragment key={cluster.cluster_id || idx}>
                <ClusterNode
                  cluster={cluster}
                  position={position}
                  onClick={setSelectedCluster}
                />
                <Line
                  points={[[0, 0, 0], position]}
                  color="#a78bfa"
                  lineWidth={1}
                  opacity={0.3}
                />
              </React.Fragment>
            ))}

            {/* Semantic Relationships */}
            {clusterPositions.map(({ cluster, position: pos1 }, idx1) => 
              cluster.semantic_relationships?.map(rel => {
                const idx2 = clusterPositions.findIndex(cp => cp.cluster.cluster_id === rel.related_cluster_id);
                if (idx2 > idx1 && idx2 >= 0) {
                  return (
                    <SemanticLink
                      key={`${cluster.cluster_id}-${rel.related_cluster_id}`}
                      from={pos1}
                      to={clusterPositions[idx2].position}
                      strength={rel.strength || 0.5}
                    />
                  );
                }
                return null;
              })
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <form onSubmit={handleQuery} className="mb-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the knowledge base..."
              className="bg-black/40 border-purple-500/30 text-white"
            />
            <Button type="submit" disabled={queryMutation.isPending}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mb-4"
          >
            <h3 className="font-bold text-white mb-2">Search Results</h3>
            <p className="text-sm text-gray-300 mb-3">{searchResults.answer_summary}</p>
            <div className="space-y-2">
              {searchResults.results?.slice(0, 3).map((result, idx) => (
                <div key={idx} className="bg-black/40 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-medium text-sm">
                      {result.cluster?.cluster_name}
                    </span>
                    <Badge className="bg-purple-600">
                      {Math.round(result.relevance_score * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{result.reasoning}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            onClick={handleFuse}
            disabled={fuseMutation.isPending || nodes.length < 2}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Merge className="w-4 h-4 mr-2" />
            Auto-Fuse Nodes
          </Button>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Emergent Insights</span>
            </div>
            <div className="text-xl font-bold text-white">
              {clusters.reduce((sum, c) => sum + (c.emergent_insights?.length || 0), 0)}
            </div>
          </div>
        </div>

        {selectedCluster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">{selectedCluster.cluster_name}</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">AI Summary:</span>
                <p className="text-white text-xs leading-relaxed">
                  {selectedCluster.fused_content?.ai_summary}
                </p>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Key Insights:</span>
                <ul className="space-y-1">
                  {selectedCluster.fused_content?.key_insights?.map((insight, idx) => (
                    <li key={idx} className="text-white text-xs flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCluster.emergent_insights?.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-1">Emergent Insights:</span>
                  {selectedCluster.emergent_insights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="bg-yellow-950/20 border border-yellow-500/30 p-2 rounded mb-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-yellow-300 text-xs">{insight.insight}</span>
                        <Badge className="bg-yellow-600 text-xs">
                          {Math.round(insight.novelty_score * 100)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400 text-xs">Sources:</span>
                <span className="text-white text-xs font-bold">
                  {selectedCluster.source_nodes?.length || 0} nodes
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}