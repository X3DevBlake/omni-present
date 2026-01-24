import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Network, Search, Sparkles, GitBranch, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function SemanticClusterNode({ cluster, position, highlighted, onClick }) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    if (!highlighted) return;
    const interval = setInterval(() => {
      setPulse(p => (p === 1 ? 1.3 : 1));
    }, 500);
    return () => clearInterval(interval);
  }, [highlighted]);

  const scale = (0.3 + (cluster.query_hits || 0) * 0.02) * pulse;

  return (
    <group position={position} onClick={() => onClick(cluster)}>
      <Sphere args={[scale, 32, 32]}>
        <meshStandardMaterial 
          color={highlighted ? '#fbbf24' : '#8b5cf6'}
          emissive={highlighted ? '#fbbf24' : '#8b5cf6'}
          emissiveIntensity={highlighted ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
      
      {cluster.emergent_insights?.length > 0 && (
        <Sphere args={[0.1, 16, 16]} position={[scale + 0.15, scale, 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        </Sphere>
      )}

      <Text position={[0, scale + 0.3, 0]} fontSize={0.12} color="white" maxWidth={2} textAlign="center">
        {cluster.cluster_name?.slice(0, 15)}
      </Text>
    </group>
  );
}

function SemanticRelationshipLine({ from, to, relationship }) {
  const getColor = () => {
    switch(relationship.relationship_type) {
      case 'causes': return '#ef4444';
      case 'supports': return '#22c55e';
      case 'contradicts': return '#f59e0b';
      case 'extends': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  return (
    <Line
      points={[from, to]}
      color={getColor()}
      lineWidth={relationship.strength * 3}
      opacity={0.4 + relationship.strength * 0.4}
      dashed={!relationship.bidirectional}
    />
  );
}

export default function AdvancedKnowledgeGraph3D() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [highlightedClusters, setHighlightedClusters] = useState([]);
  const queryClient = useQueryClient();

  const { data: clusters } = useQuery({
    queryKey: ['fusedClusters'],
    queryFn: () => base44.entities.FusedKnowledgeCluster.list('-created_date', 30),
    initialData: []
  });

  const { data: relationships } = useQuery({
    queryKey: ['semanticRelationships'],
    queryFn: () => base44.entities.SemanticRelationship.list(),
    initialData: []
  });

  const discoverMutation = useMutation({
    mutationFn: () => base44.functions.invoke('discoverSemanticRelationships', {}),
    onSuccess: () => {
      queryClient.invalidateQueries(['semanticRelationships']);
    }
  });

  const queryMutation = useMutation({
    mutationFn: ({ query }) => base44.functions.invoke('queryKnowledgeFusion', { query }),
    onSuccess: (data) => {
      setQueryResults(data.data);
      const clusterIds = data.data.results?.map(r => r.cluster?.cluster_id).filter(Boolean) || [];
      setHighlightedClusters(clusterIds);
    }
  });

  const handleQuery = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      await queryMutation.mutateAsync({ query });
    }
  };

  // Calculate 3D positions
  const clusterPositions = clusters.map((cluster, idx) => {
    const angle = (idx / clusters.length) * Math.PI * 2;
    const layer = Math.floor(idx / 8);
    const radius = 4 + layer * 2;
    
    return {
      cluster,
      position: [
        Math.cos(angle) * radius,
        layer * 1.5,
        Math.sin(angle) * radius
      ]
    };
  });

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Network className="w-6 h-6 text-purple-400" />
          Advanced Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[15, 15, 15]} intensity={1} />
            <pointLight position={[-15, -15, -15]} intensity={0.4} />
            
            {/* Knowledge Clusters */}
            {clusterPositions.map(({ cluster, position }) => (
              <SemanticClusterNode
                key={cluster.cluster_id}
                cluster={cluster}
                position={position}
                highlighted={highlightedClusters.includes(cluster.cluster_id)}
                onClick={setSelectedCluster}
              />
            ))}

            {/* Semantic Relationships */}
            {relationships.map(rel => {
              const sourcePos = clusterPositions.find(cp => cp.cluster.cluster_id === rel.source_cluster_id)?.position;
              const targetPos = clusterPositions.find(cp => cp.cluster.cluster_id === rel.target_cluster_id)?.position;
              
              if (sourcePos && targetPos) {
                return (
                  <SemanticRelationshipLine
                    key={rel.relationship_id}
                    from={sourcePos}
                    to={targetPos}
                    relationship={rel}
                  />
                );
              }
              return null;
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        </div>

        <form onSubmit={handleQuery} className="mb-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask complex questions about the knowledge base..."
              className="bg-black/40 border-purple-500/30 text-white"
            />
            <Button type="submit" disabled={queryMutation.isPending}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Clusters</span>
            </div>
            <div className="text-2xl font-bold text-white">{clusters.length}</div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Relations</span>
            </div>
            <div className="text-2xl font-bold text-white">{relationships.length}</div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Insights</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {clusters.reduce((sum, c) => sum + (c.emergent_insights?.length || 0), 0)}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => discoverMutation.mutate()}
          disabled={discoverMutation.isPending}
          className="w-full mb-4 bg-purple-600 hover:bg-purple-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          AI Discover Relationships
        </Button>

        {queryResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mb-4"
          >
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              AI Answer
            </h3>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              {queryResults.answer_summary}
            </p>
            <div className="text-xs text-gray-500">
              Searched {queryResults.total_clusters_searched} clusters
            </div>
          </motion.div>
        )}

        {selectedCluster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">{selectedCluster.cluster_name}</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300 text-xs">{selectedCluster.fused_content?.ai_summary}</p>
              
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedCluster.source_types?.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">Confidence:</span>
                <Badge className="bg-purple-600">
                  {Math.round((selectedCluster.fusion_confidence || 0) * 100)}%
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}