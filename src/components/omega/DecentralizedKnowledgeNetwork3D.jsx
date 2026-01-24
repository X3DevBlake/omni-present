import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function KnowledgeNode({ node, position, onClick }) {
  const getColor = () => {
    if (node.validation_status === 'validated') return '#22c55e';
    if (node.validation_status === 'rejected') return '#ef4444';
    if (node.validation_status === 'disputed') return '#f59e0b';
    return '#6b7280';
  };

  const scale = 0.2 + (node.trust_score || 0) * 0.3;

  return (
    <group position={position} onClick={() => onClick(node)}>
      <Sphere args={[scale, 32, 32]}>
        <meshStandardMaterial 
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.5}
        />
      </Sphere>
      <Text
        position={[0, scale + 0.2, 0]}
        fontSize={0.1}
        color="white"
      >
        {`Trust: ${Math.round((node.trust_score || 0) * 100)}%`}
      </Text>
    </group>
  );
}

function ConnectionLine({ from, to, validated }) {
  return (
    <Line
      points={[from, to]}
      color={validated ? '#22c55e' : '#6b7280'}
      lineWidth={1}
      opacity={0.4}
    />
  );
}

export default function DecentralizedKnowledgeNetwork3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const queryClient = useQueryClient();

  const { data: nodes } = useQuery({
    queryKey: ['knowledgeNodes'],
    queryFn: () => base44.entities.DecentralizedKnowledgeNode.list(),
    initialData: []
  });

  const validateMutation = useMutation({
    mutationFn: ({ node_id, vote }) => 
      base44.functions.invoke('validateKnowledgeConsensus', {
        node_id,
        validator_id: `validator_${Date.now()}`,
        vote
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledgeNodes']);
    }
  });

  const handleVote = (vote) => {
    if (selectedNode) {
      validateMutation.mutate({ 
        node_id: selectedNode.node_id, 
        vote 
      });
    }
  };

  // Calculate node positions in 3D space
  const nodePositions = nodes.map((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    return {
      node,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 2
      ]
    };
  });

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Network className="w-6 h-6 text-purple-400" />
          Decentralized Knowledge Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Center Hub */}
            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#8b5cf6" 
                emissive="#8b5cf6" 
                emissiveIntensity={0.5}
                metalness={0.8}
              />
            </Sphere>
            
            {/* Knowledge Nodes */}
            {nodePositions.map(({ node, position }, idx) => (
              <React.Fragment key={node.node_id || idx}>
                <KnowledgeNode
                  node={node}
                  position={position}
                  onClick={setSelectedNode}
                />
                {/* Connection to center */}
                <ConnectionLine
                  from={[0, 0, 0]}
                  to={position}
                  validated={node.validation_status === 'validated'}
                />
              </React.Fragment>
            ))}
            
            {/* Connections between nodes */}
            {nodePositions.map(({ node, position: pos1 }, idx1) => 
              node.connected_nodes?.map(connectedId => {
                const idx2 = nodePositions.findIndex(n => n.node.node_id === connectedId);
                if (idx2 > idx1 && idx2 >= 0) {
                  return (
                    <ConnectionLine
                      key={`${node.node_id}-${connectedId}`}
                      from={pos1}
                      to={nodePositions[idx2].position}
                      validated={node.validation_status === 'validated'}
                    />
                  );
                }
                return null;
              })
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Validated</span>
            </div>
            <div className="text-xl font-bold text-white">
              {nodes.filter(n => n.validation_status === 'validated').length}
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <div className="text-xl font-bold text-white">
              {nodes.filter(n => n.validation_status === 'pending').length}
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Rejected</span>
            </div>
            <div className="text-xl font-bold text-white">
              {nodes.filter(n => n.validation_status === 'rejected').length}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Avg Trust</span>
            </div>
            <div className="text-xl font-bold text-white">
              {nodes.length > 0 
                ? Math.round((nodes.reduce((sum, n) => sum + (n.trust_score || 0), 0) / nodes.length) * 100)
                : 0}%
            </div>
          </div>
        </div>

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">Knowledge Node Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <Badge variant={selectedNode.validation_status === 'validated' ? 'default' : 'outline'}>
                  {selectedNode.validation_status}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Trust Score:</span>
                <span className="text-white font-bold">
                  {Math.round((selectedNode.trust_score || 0) * 100)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Contributor:</span>
                <Badge variant="outline">
                  {selectedNode.contributor_type}
                </Badge>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Votes:</span>
                <div className="flex gap-2">
                  <Badge className="bg-green-600">
                    ✓ {selectedNode.validation_votes?.approve || 0}
                  </Badge>
                  <Badge className="bg-red-600">
                    ✗ {selectedNode.validation_votes?.reject || 0}
                  </Badge>
                </div>
              </div>

              {selectedNode.validation_status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleVote('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVote('reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {selectedNode.tamper_proof_hash && (
                <div className="pt-2 border-t border-gray-700">
                  <span className="text-gray-400 text-xs block mb-1">Tamper-Proof Hash:</span>
                  <code className="text-xs text-purple-300 break-all">
                    {selectedNode.tamper_proof_hash.slice(0, 32)}...
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}