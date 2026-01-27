import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Store, TrendingUp, Users, DollarSign, Shield, Zap, Search, Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OmegaMarketplace3D from '../components/marketplace/OmegaMarketplace3D';
import AgentAnalytics3D from '../components/marketplace/AgentAnalytics3D';
import AgentCollaborationHub from '../components/marketplace/AgentCollaborationHub';
import AutomatedOnboarding from '../components/marketplace/AutomatedOnboarding';
import DecentralizedSkillNetwork3D from '../components/marketplace/DecentralizedSkillNetwork3D';

export default function AIAgentMarketplace() {
  const queryClient = useQueryClient();
  const [taskDesc, setTaskDesc] = useState('Advanced data analysis');
  const [filters, setFilters] = useState({});

  const { data: marketplaceData } = useQuery({
    queryKey: ['marketplace-engine'],
    queryFn: async () => {
      const res = await base44.functions.invoke('marketplace/omegaMarketplaceEngine', { requirements: {}, requesting_agent_id: 'user' });
      return res.data;
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['marketplace-profiles'],
    queryFn: () => base44.entities.AgentMarketplaceProfile.list('', 50),
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Decentralized Agent Marketplace
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Discover, acquire, and deploy specialized AI agents. Secure, verified, and decentralized.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-purple-500/30 p-4 backdrop-blur-md">
            <Store className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">1,248</p>
            <p className="text-white/60 text-sm">Verified Agents</p>
          </Card>
          <Card className="bg-black/40 border-green-500/30 p-4 backdrop-blur-md">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">${marketplaceData?.market_trends?.average_hourly_rate || 125}</p>
            <p className="text-white/60 text-sm">Avg Hourly Rate</p>
          </Card>
          <Card className="bg-black/40 border-orange-500/30 p-4 backdrop-blur-md">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">98.5%</p>
            <p className="text-white/60 text-sm">Success Rate</p>
          </Card>
          <Card className="bg-black/40 border-cyan-500/30 p-4 backdrop-blur-md">
            <Shield className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">Secure</p>
            <p className="text-white/60 text-sm">Protocol Active</p>
          </Card>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-black/30 p-1 text-xs">
            <TabsTrigger value="discover">Discover Agents</TabsTrigger>
            <TabsTrigger value="recommend">AI Recommendations</TabsTrigger>
            <TabsTrigger value="network">Network Visualizer</TabsTrigger>
            <TabsTrigger value="reputation">Reputation System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="flex gap-4 mb-6">
                <Input placeholder="Search for agents, skills, or tasks..." className="bg-black/40 border-white/10 text-white" />
                <Button className="bg-purple-600 hover:bg-purple-700"><Search className="w-4 h-4 mr-2" /> Search</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock List or Real Data */}
                {(marketplaceData?.recommendations || []).map((agent, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                                    <div className="flex gap-1 mt-1">
                                        {agent.specializations.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-green-400 font-bold">${agent.estimated_cost}</div>
                                    <div className="text-[10px] text-gray-400">/ project</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-white font-bold">{agent.reputation_score}</span>
                                <span className="text-white/40 text-sm">(Verified)</span>
                            </div>
                            <Button className="w-full bg-white/10 hover:bg-purple-600 hover:text-white transition-colors border border-white/10">
                                Deploy Agent
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="recommend">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> AI-Driven Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/20">
                    <h3 className="text-purple-300 font-bold mb-2">Based on your recent activity:</h3>
                    <p className="text-gray-300 text-sm mb-4">We noticed you've been focusing on DeFi analytics. Here are specialized agents that can optimize your workflow.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {marketplaceData?.recommendations?.slice(0, 2).map((rec, i) => (
                            <div key={i} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                                <div>
                                    <div className="font-bold text-white">{rec.name}</div>
                                    <div className="text-xs text-green-400">{rec.match_score}% Match</div>
                                </div>
                                <Button size="sm" className="ml-auto bg-white/10 hover:bg-white/20">View</Button>
                            </div>
                        ))}
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Live Agent Network</CardTitle>
              </CardHeader>
              <CardContent>
                <OmegaMarketplace3D />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reputation">
             <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Reputation & Trust Protocol</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <Shield className="w-8 h-8 text-green-400 mb-2" />
                            <h3 className="text-white font-bold mb-1">Identity Verified</h3>
                            <p className="text-xs text-gray-400">All agents are cryptographically verified via DID.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <Lock className="w-8 h-8 text-blue-400 mb-2" />
                            <h3 className="text-white font-bold mb-1">Secure Escrow</h3>
                            <p className="text-xs text-gray-400">Transactions are held in smart contract escrow until verification.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <Star className="w-8 h-8 text-yellow-400 mb-2" />
                            <h3 className="text-white font-bold mb-1">Consensus Rating</h3>
                            <p className="text-xs text-gray-400">Scores are immutable and derived from on-chain performance.</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AgentAnalytics3D agentId={null} />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}