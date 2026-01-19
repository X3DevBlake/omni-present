import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Workflow, Zap, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CrossPlatformConnector from '../components/platform/CrossPlatformConnector';

export default function CrossPlatformIntegrationHub() {
  const queryClient = useQueryClient();
  const [agentId, setAgentId] = useState('');
  const [platformType, setPlatformType] = useState('slack');

  const { data: connectors } = useQuery({
    queryKey: ['all-connectors'],
    queryFn: () => base44.entities.AgentConnector.list('', 100),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 50),
  });

  const createConnector = useMutation({
    mutationFn: async () => {
      const connector = await base44.entities.AgentConnector.create({
        agent_id: agentId,
        platform_type: platformType,
        connection_status: 'pending',
        sync_config: {
          auto_sync: true,
          sync_interval_minutes: 30,
          sync_direction: 'bidirectional'
        },
        messages_synced: 0,
        permissions: ['read', 'write']
      });
      return connector;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-connectors'] });
    }
  });

  const syncAll = useMutation({
    mutationFn: async () => {
      const results = [];
      for (const connector of connectors || []) {
        if (connector.connection_status === 'connected') {
          const response = await base44.functions.invoke('platform/crossPlatformAgentSync', {
            agent_id: connector.agent_id,
            platform_type: connector.platform_type
          });
          results.push(response.data);
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-connectors'] });
    }
  });

  const connectedCount = connectors?.filter(c => c.connection_status === 'connected').length || 0;
  const totalSynced = connectors?.reduce((sum, c) => sum + (c.messages_synced || 0), 0) || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Cross-Platform Integration Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Connect agents across Slack, Telegram, Discord, Teams, and more
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Globe className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{connectors?.length || 0}</p>
            <p className="text-white/60 text-sm">Total Connectors</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <Zap className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{connectedCount}</p>
            <p className="text-white/60 text-sm">Active Connections</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <RefreshCw className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{totalSynced}</p>
            <p className="text-white/60 text-sm">Messages Synced</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <Workflow className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{agents?.length || 0}</p>
            <p className="text-white/60 text-sm">Available Agents</p>
          </Card>
        </div>

        <Tabs defaultValue="connectors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 p-1">
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="sync">Sync All</TabsTrigger>
          </TabsList>

          <TabsContent value="connectors">
            {agents?.slice(0, 5).map((agent) => (
              <Card key={agent.id} className="bg-black/40 border-white/10 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">
                    Agent {agent.id?.slice(-6)} - Cross-Platform Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CrossPlatformConnector agentId={agent.id} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Create Platform Connector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Agent ID</label>
                  <Input
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter agent ID"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Platform</label>
                  <Select value={platformType} onValueChange={setPlatformType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createConnector.mutate()}
                  disabled={createConnector.isPending || !agentId}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Create Connector
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Sync All Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/60">
                  Synchronize all connected agents across all platforms. This will fetch latest messages and updates.
                </p>
                <Button
                  onClick={() => syncAll.mutate()}
                  disabled={syncAll.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncAll.isPending ? 'animate-spin' : ''}`} />
                  Sync All Platforms
                </Button>
              </CardContent>
            </Card>

            {syncAll.data && (
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="p-6">
                  <h3 className="text-green-300 font-bold mb-4">Sync Complete</h3>
                  <div className="space-y-2">
                    {syncAll.data.map((result, i) => (
                      <div key={i} className="bg-black/30 rounded p-3 flex items-center justify-between">
                        <span className="text-white">{result.platform}</span>
                        <Badge className={result.status === 'synced' ? 'bg-green-500' : 'bg-red-500'}>
                          {result.messages_synced} messages
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}