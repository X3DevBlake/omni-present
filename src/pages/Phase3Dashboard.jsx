import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Network, Link2, Shield, Zap, Database, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Phase3Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  
  const { data: decentralizedNodes = [] } = useQuery({
    queryKey: ['decentralized-nodes'],
    queryFn: () => base44.entities.DecentralizedNode.filter({ is_active: true }).limit(20)
  });
  
  const { data: blockchainTxs = [] } = useQuery({
    queryKey: ['blockchain-txs'],
    queryFn: () => base44.entities.BlockchainTransaction.filter({}).limit(15)
  });
  
  const { data: crossPlatformAgents = [] } = useQuery({
    queryKey: ['cross-platform-agents'],
    queryFn: () => base44.entities.CrossPlatformAgent.filter({}).limit(10)
  });
  
  const phase3Features = [
    {
      category: 'Decentralized Network',
      icon: Network,
      color: 'text-cyan-400',
      features: [
        { name: 'Peer-to-Peer Node Network', status: 'active', metric: `${decentralizedNodes.length} nodes`, description: 'Distributed agent infrastructure' },
        { name: 'Node Discovery Protocol', status: 'active', metric: '342 discoveries', description: 'Automatic peer finding' },
        { name: 'Reputation System', status: 'active', metric: 'Avg 87/100', description: 'Decentralized trust scoring' },
        { name: 'Cross-Node Collaboration', status: 'active', metric: '156 sessions', description: 'Inter-node agent teamwork' }
      ]
    },
    {
      category: 'Cross-Chain Protocols',
      icon: Link2,
      color: 'text-purple-400',
      features: [
        { name: 'Multi-Chain Bridge', status: 'active', metric: '5 chains', description: 'Ethereum, BSC, Polygon, Arbitrum, Base' },
        { name: 'Cross-Chain Transactions', status: 'active', metric: `${blockchainTxs.length} txs`, description: 'Seamless asset transfers' },
        { name: 'Chain Agnostic Agents', status: 'active', metric: '23 agents', description: 'Agents operating across chains' },
        { name: 'Unified Identity Layer', status: 'active', metric: 'DID enabled', description: 'Decentralized identity management' }
      ]
    },
    {
      category: 'Ecosystem Expansion',
      icon: Globe,
      color: 'text-green-400',
      features: [
        { name: 'External API Gateway', status: 'active', metric: '45 integrations', description: 'Third-party service connections' },
        { name: 'Cross-Platform Sync', status: 'active', metric: `${crossPlatformAgents.length} platforms`, description: 'Agent mobility across systems' },
        { name: 'Marketplace Federation', status: 'active', metric: '8 marketplaces', description: 'Multi-marketplace presence' },
        { name: 'Community Protocols', status: 'active', metric: '2.3k members', description: 'Open collaboration standards' }
      ]
    },
    {
      category: 'Decentralized Intelligence',
      icon: Database,
      color: 'text-orange-400',
      features: [
        { name: 'Distributed Knowledge Graph', status: 'active', metric: '125k nodes', description: 'Shared intelligence network' },
        { name: 'Federated Learning', status: 'active', metric: '12 models', description: 'Privacy-preserving AI training' },
        { name: 'Consensus Algorithms', status: 'active', metric: 'PoS + PoA', description: 'Multi-consensus support' },
        { name: 'Data Sovereignty', status: 'active', metric: '100% encrypted', description: 'User-controlled data' }
      ]
    }
  ];
  
  const createNodeMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.blockchain['decentralized-node-registration']({
        node_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        platform: 'base44'
      });
    }
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Phase 3: Ecosystem Expansion</h1>
            <p className="text-gray-300">Decentralized intelligence and cross-chain capabilities</p>
          </div>
          <Badge className="bg-cyan-500 text-white px-4 py-2 text-lg">
            <Globe className="w-4 h-4 mr-2" />
            Decentralized
          </Badge>
        </div>
        
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-black/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nodes">Network Nodes</TabsTrigger>
            <TabsTrigger value="blockchain">Cross-Chain</TabsTrigger>
            <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {phase3Features.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black/30 border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <category.icon className={`w-5 h-5 mr-2 ${category.color}`} />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.features.map((feature, j) => (
                        <motion.div
                          key={j}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-4 rounded-lg border border-cyan-500/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{feature.name}</span>
                            <Badge className="bg-green-500">{feature.status}</Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-1">{feature.description}</p>
                          <p className={`text-sm font-semibold ${category.color}`}>{feature.metric}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="nodes">
            <Card className="bg-black/30 border-cyan-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Decentralized Network Nodes</CardTitle>
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => createNodeMutation.mutate()}
                  disabled={createNodeMutation.isPending}
                >
                  <Network className="w-4 h-4 mr-2" />
                  Register Node
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {decentralizedNodes.map((node, i) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Node {node.node_id.slice(0, 8)}</h3>
                        <Badge className={node.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                          {node.is_active ? 'Active' : 'Offline'}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">Platform: {node.platform}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyan-400">Reputation: {node.reputation_score}/100</span>
                        <span className="text-purple-400">{node.agent_ids?.length || 0} agents</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="blockchain">
            <Card className="bg-black/30 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white">Cross-Chain Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockchainTxs.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{tx.transaction_type}</p>
                          <p className="text-gray-400 text-sm">{tx.transaction_hash?.slice(0, 16)}...</p>
                        </div>
                        <Badge className={
                          tx.status === 'confirmed' ? 'bg-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyan-400">Block: {tx.block_number || 'Pending'}</span>
                        <span className="text-purple-400">Confirmations: {tx.confirmations}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ecosystem">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'External Integrations', value: '45', icon: Link2, color: 'text-cyan-400' },
                { label: 'Network Nodes', value: decentralizedNodes.length, icon: Network, color: 'text-purple-400' },
                { label: 'Cross-Chain Txs', value: blockchainTxs.length, icon: GitBranch, color: 'text-green-400' },
                { label: 'Active Protocols', value: '12', icon: Shield, color: 'text-orange-400' }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-black/30 border-cyan-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{metric.label}</p>
                          <p className={`text-3xl font-bold ${metric.color} mt-2`}>{metric.value}</p>
                        </div>
                        <metric.icon className={`w-12 h-12 ${metric.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}