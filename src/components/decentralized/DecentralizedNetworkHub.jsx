import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Link2, Shield, Zap, Users, Network } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as THREE from 'three';

function NetworkNode({ position, label, reputation, isActive }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.y += 0.01;
    if (isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const color = reputation > 75 ? '#22c55e' : reputation > 50 ? '#3b82f6' : '#f59e0b';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          wireframe={!isActive}
        />
      </Sphere>
      <Text position={[0, 0.7, 0]} fontSize={0.2} color="white">
        {label}
      </Text>
      <Text position={[0, -0.7, 0]} fontSize={0.15} color="#aaa">
        {reputation.toFixed(0)}%
      </Text>
    </group>
  );
}

function NetworkConnection({ start, end, isActive }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  return <Line points={points} color={isActive ? '#a855f7' : '#666'} lineWidth={isActive ? 3 : 1} />;
}

function DecentralizedNetworkVisualization({ nodes }) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {nodes?.map((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 5;
        return (
          <NetworkNode
            key={node.id}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            label={`Node ${i + 1}`}
            reputation={node.reputation_score}
            isActive={node.is_active}
          />
        );
      })}
      
      {nodes?.map((node, i) => {
        const angle1 = (i / nodes.length) * Math.PI * 2;
        const angle2 = ((i + 1) / nodes.length) * Math.PI * 2;
        const radius = 5;
        return (
          <NetworkConnection
            key={`conn-${i}`}
            start={[Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0]}
            end={[Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0]}
            isActive={node.is_active && nodes[(i + 1) % nodes.length]?.is_active}
          />
        );
      })}
      
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
      </mesh>
    </Canvas>
  );
}

export default function DecentralizedNetworkHub() {
  const [nodeAddress, setNodeAddress] = useState('');
  const queryClient = useQueryClient();

  const { data: nodes } = useQuery({
    queryKey: ['decentralized-nodes'],
    queryFn: () => base44.entities.DecentralizedNode.list()
  });

  const { data: transactions } = useQuery({
    queryKey: ['blockchain-transactions'],
    queryFn: () => base44.entities.BlockchainTransaction.list('-timestamp', 20)
  });

  const { data: governance } = useQuery({
    queryKey: ['governance-rules'],
    queryFn: () => base44.entities.AgentGovernanceRule.list()
  });

  const registerNode = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.DecentralizedNode.create({
        node_id: `node_${Date.now()}`,
        node_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        agent_ids: [],
        platform: 'omni-platform',
        public_key: `pub_${Math.random().toString(36).substr(2, 20)}`,
        reputation_score: 50,
        discovery_status: 'discoverable'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decentralized-nodes'] });
      toast.success('Node registered on blockchain');
    }
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.BlockchainTransaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchain-transactions'] });
      toast.success('Transaction broadcasted');
    }
  });

  const totalAgents = nodes?.reduce((sum, node) => sum + (node.agent_ids?.length || 0), 0) || 0;
  const avgReputation = nodes?.reduce((sum, node) => sum + node.reputation_score, 0) / (nodes?.length || 1) || 0;
  const activeNodes = nodes?.filter(n => n.is_active).length || 0;

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <Network className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{nodes?.length || 0}</p>
            <p className="text-sm text-gray-600">Network Nodes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{totalAgents}</p>
            <p className="text-sm text-gray-600">Total Agents</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <Shield className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{avgReputation.toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Avg Reputation</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-orange-500/30">
          <CardContent className="p-4">
            <Zap className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{transactions?.filter(t => t.status === 'confirmed').length || 0}</p>
            <p className="text-sm text-gray-600">Confirmed Txns</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Decentralized Network Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black">
            <DecentralizedNetworkVisualization nodes={nodes?.slice(0, 8)} />
          </div>
        </CardContent>
      </Card>

      {/* Node Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-500" />
            Join Decentralized Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm mb-3">
              Register your node to enable cross-platform agent collaboration with blockchain security
            </p>
            <Button onClick={() => registerNode.mutate()} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Register Node on Blockchain
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {nodes?.slice(0, 4).map((node) => (
              <div key={node.id} className="p-3 rounded border bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{node.node_id}</p>
                    <p className="text-xs text-gray-500">{node.platform}</p>
                  </div>
                  <Badge variant={node.is_active ? 'default' : 'secondary'}>
                    {node.is_active ? 'Active' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span>Reputation: {node.reputation_score}%</span>
                  <span>{node.agent_ids?.length || 0} agents</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-green-500" />
            Recent Blockchain Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions?.map((txn) => (
            <div key={txn.id} className="p-3 rounded border bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="secondary" className="mb-1">{txn.transaction_type}</Badge>
                  <p className="text-xs font-mono text-gray-600">
                    {txn.transaction_hash || 'Pending...'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={txn.status === 'confirmed' ? 'default' : 'secondary'}>
                    {txn.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{txn.confirmations} confirms</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Governance Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            Governance Rules Applied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {governance?.slice(0, 3).map((rule) => (
              <div key={rule.id} className="p-3 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{rule.rule_name}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{rule.rule_type}</Badge>
                  </div>
                  <Badge variant="outline">{rule.enforcement_level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}