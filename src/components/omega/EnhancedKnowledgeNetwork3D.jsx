import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, CheckCircle, Clock, Shield, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function DynamicKnowledgeNode({ node, position, onClick }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Real-time pulse based on trust score
    const interval = setInterval(() => {
      setScale(s => (s === 1 ? 1 + (node.trust_score || 0) * 0.3 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [node.trust_score]);

  const getColor = () => {
    if (node.validation_status === 'validated') return '#22c55e';
    if (node.validation_status === 'rejected') return '#ef4444';
    if (node.validation_status === 'disputed') return '#f59e0b';
    return '#6b7280';
  };

  const baseSize = 0.2 + (node.trust_score || 0) * 0.3;

  return (
    <group position={position} onClick={() => onClick(node)}>
      <Sphere args={[baseSize * scale, 32, 32]}>
        <meshStandardMaterial 
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.4 + (node.trust_score || 0) * 0.3}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7 + (node.trust_score || 0) * 0.3}
        />
      </Sphere>
      
      {/* Provenance chain indicator */}
      {node.provenance_chain && node.provenance_chain.length > 0 && (
        <Sphere args={[baseSize * 0.3, 16, 16]} position={[baseSize + 0.15, baseSize, 0]}>
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#8b5cf6" 
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}

      <Text
        position={[0, baseSize + 0.3, 0]}
        fontSize={0.1}
        color="white"
      >
        {Math.round((node.trust_score || 0) * 100)}%
      </Text>
    </group>
  );
}

function ProvenanceChain({ node, position }) {
  const chainLength = Math.min(node.provenance_chain?.length || 0, 5);
  
  return (
    <group position={position}>
      {Array.from({ length: chainLength }).map((_, idx) => (
        <Sphere 
          key={idx} 
          args={[0.05, 16, 16]} 
          position={[0, idx * 0.15, 0]}
        >
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

export default function EnhancedKnowledgeNetwork3D() {
  const [selectedNode, setSelectedNode] = useState(null);

  const { data: nodes, refetch } = useQuery({
    queryKey: ['enhancedKnowledgeNodes'],
    queryFn: () => base44.entities.DecentralizedKnowledgeNode.list('-created_date', 30),
    initialData: []
  });

  // Real-time subscription to node updates
  useEffect(() => {
    const unsubscribe = base44.entities.DecentralizedKnowledgeNode.subscribe((event) => {
      refetch();
    });
    return unsubscribe;
  }, [refetch]);

  // Calculate dynamic 3D positions
  const nodePositions = nodes.map((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2;
    const radius = 3 + (node.trust_score || 0) * 2;
    const height = (node.validation_votes?.approve || 0) * 0.3 - 0.5;
    
    return {
      node,
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ]
    };
  });

  const validatedCount = nodes.filter(n => n.validation_status === 'validated').length;
  const avgTrust = nodes.length > 0
    ? nodes.reduce((sum, n) => sum + (n.trust_score || 0), 0) / nodes.length
    : 0;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Network className="w-6 h-6 text-purple-400" />
          Enhanced Knowledge Network (Live)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* Dynamic Knowledge Nodes */}
            {nodePositions.map(({ node, position }) => (
              <React.Fragment key={node.node_id || node.id}>
                <DynamicKnowledgeNode
                  node={node}
                  position={position}
                  onClick={setSelectedNode}
                />
                {node.provenance_chain && node.provenance_chain.length > 2 && (
                  <ProvenanceChain
                    node={node}
                    position={[position[0], position[1] - 1, position[2]]}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Semantic Connections */}
            {nodePositions.map(({ node, position: pos1 }, idx1) => 
              node.connected_nodes?.map(connectedId => {
                const idx2 = nodePositions.findIndex(np => np.node.node_id === connectedId);
                if (idx2 > idx1 && idx2 >= 0) {
                  const bothValidated = node.validation_status === 'validated' && 
                                       nodePositions[idx2].node.validation_status === 'validated';
                  return (
                    <Line
                      key={`${node.node_id}-${connectedId}`}
                      points={[pos1, nodePositions[idx2].position]}
                      color={bothValidated ? '#22c55e' : '#6b7280'}
                      lineWidth={bothValidated ? 2 : 1}
                      opacity={bothValidated ? 0.6 : 0.3}
                    />
                  );
                }
                return null;
              })
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Validated</span>
            </div>
            <div className="text-xl font-bold text-white">{validatedCount}</div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Avg Trust</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(avgTrust * 100)}%
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total Nodes</span>
            </div>
            <div className="text-xl font-bold text-white">{nodes.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
          <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm text-white">Real-time consensus tracking active</span>
        </div>

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mt-4"
          >
            <h3 className="font-bold text-white mb-3">Node Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Trust Score:</span>
                <Badge className="bg-purple-600">
                  {Math.round((selectedNode.trust_score || 0) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge variant={selectedNode.validation_status === 'validated' ? 'default' : 'outline'}>
                  {selectedNode.validation_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Provenance Chain:</span>
                <span className="text-white font-bold">
                  {selectedNode.provenance_chain?.length || 0} entries
                </span>
              </div>
              {selectedNode.tamper_proof_hash && (
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Hash:</span>
                  <code className="text-xs text-purple-300 break-all">
                    {selectedNode.tamper_proof_hash.slice(0, 24)}...
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