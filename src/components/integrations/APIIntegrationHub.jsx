import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Zap, Cloud, Database, MessageSquare, CheckCircle, 
  Plus, Search, Settings, Link as LinkIcon, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const popularIntegrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    category: 'communication',
    fields: ['webhook_url', 'channel']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows across 5000+ apps',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    category: 'automation',
    fields: ['api_key', 'zap_id']
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Cloud storage and file management',
    icon: Cloud,
    color: 'from-blue-500 to-cyan-500',
    category: 'storage',
    fields: ['client_id', 'client_secret']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Knowledge base and documentation',
    icon: Database,
    color: 'from-gray-500 to-slate-500',
    category: 'productivity',
    fields: ['api_token', 'database_id']
  }
];

export default function APIIntegrationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configData, setConfigData] = useState({});
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['oauth-connections'],
    queryFn: () => base44.entities.OAuthConnection.list('-created_date', 50)
  });

  const connectMutation = useMutation({
    mutationFn: async (integration) => {
      return base44.entities.OAuthConnection.create({
        service_name: integration.name,
        integration_type: integration.id,
        connection_status: 'connected',
        scopes: integration.fields,
        connected_date: new Date().toISOString(),
        configuration: configData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oauth-connections']);
      toast.success('Integration connected successfully!');
      setSelectedIntegration(null);
      setConfigData({});
    }
  });

  const filteredIntegrations = popularIntegrations.filter(int =>
    int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    int.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isConnected = (integrationId) => {
    return connections.some(c => c.integration_type === integrationId && c.connection_status === 'connected');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">API Integration Hub</h2>
          <p className="text-white/60">Connect your AI agents to external services</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-400">
            {connections.filter(c => c.connection_status === 'connected').length} Active
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search integrations..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration, idx) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`bg-gradient-to-br ${integration.color} bg-opacity-10 border-white/10 hover:scale-105 transition-transform cursor-pointer`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <integration.icon className="w-8 h-8 text-white" />
                      {isConnected(integration.id) && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white">{integration.name}</CardTitle>
                    <CardDescription className="text-white/60">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setSelectedIntegration(integration)}
                      className={`w-full ${isConnected(integration.id) ? 'bg-white/10' : 'bg-gradient-to-r ' + integration.color}`}
                      disabled={isConnected(integration.id)}
                    >
                      {isConnected(integration.id) ? (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {['communication', 'automation', 'storage', 'productivity'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations
                .filter(int => int.category === category)
                .map((integration, idx) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`bg-gradient-to-br ${integration.color} bg-opacity-10 border-white/10`}>
                      <CardHeader>
                        <integration.icon className="w-8 h-8 text-white mb-2" />
                        <CardTitle className="text-white">{integration.name}</CardTitle>
                        <CardDescription className="text-white/60">
                          {integration.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => setSelectedIntegration(integration)}
                          className={`w-full bg-gradient-to-r ${integration.color}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Connection Modal */}
      {selectedIntegration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIntegration(null)}
        >
          <Card
            className="bg-slate-900 border-white/20 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <selectedIntegration.icon className="w-6 h-6" />
                Connect {selectedIntegration.name}
              </CardTitle>
              <CardDescription className="text-white/60">
                Configure your {selectedIntegration.name} integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIntegration.fields.map(field => (
                <div key={field}>
                  <label className="text-white text-sm mb-2 block capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <Input
                    value={configData[field] || ''}
                    onChange={(e) => setConfigData({ ...configData, [field]: e.target.value })}
                    placeholder={`Enter ${field.replace('_', ' ')}`}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedIntegration(null)}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 bg-gradient-to-r ${selectedIntegration.color}`}
                  onClick={() => connectMutation.mutate(selectedIntegration)}
                  disabled={connectMutation.isLoading}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Connections */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Active Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connections.filter(c => c.connection_status === 'connected').map(conn => (
              <div key={conn.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{conn.service_name}</p>
                  <p className="text-xs text-white/60">
                    Connected {new Date(conn.connected_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
            ))}
            {connections.filter(c => c.connection_status === 'connected').length === 0 && (
              <p className="text-white/40 text-center py-8">No active connections yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}