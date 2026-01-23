import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, Package, Shield, Activity, Copy } from 'lucide-react';
import DeveloperAPIConsole3D from '../components/developer/DeveloperAPIConsole3D';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DeveloperEcosystemHub() {
  const queryClient = useQueryClient();
  const [newKeyPermissions, setNewKeyPermissions] = useState(['read_agents', 'marketplace_access']);
  const [generatedKey, setGeneratedKey] = useState(null);

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await base44.functions.invoke('apiKeyManager', {
        action: 'get_my_keys'
      });
      return response.data.api_keys || [];
    },
    initialData: []
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['third-party-integrations'],
    queryFn: async () => {
      const response = await base44.functions.invoke('thirdPartyIntegrationManager', {
        action: 'get_integrations',
        approved_only: false
      });
      return response.data.integrations || [];
    },
    initialData: []
  });

  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('apiKeyManager', {
        action: 'generate_key',
        permissions: newKeyPermissions,
        rate_limits: {
          requests_per_minute: 60,
          requests_per_day: 10000,
          concurrent_requests: 10
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedKey(data.api_key);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key generated! Copy it now - it will not be shown again.');
    }
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (apiKeyId) => {
      const response = await base44.functions.invoke('apiKeyManager', {
        action: 'revoke_key',
        api_key_id: apiKeyId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked');
    }
  });

  const endpoints = [
    '/api/agents/list',
    '/api/agents/create',
    '/api/marketplace/listings',
    '/api/augmentations/list',
    '/api/neural/consciousness',
    '/api/biometric/data'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Code className="w-12 h-12 text-cyan-400 animate-pulse" />
            Developer Ecosystem Hub
          </h1>
          <p className="text-white/60 text-lg">
            Secure API access for third-party developers to integrate specialized agents and augmentations
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Key className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white">{apiKeys.length}</div>
              <div className="text-white/60 text-sm">API Keys</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">{integrations.length}</div>
              <div className="text-white/60 text-sm">Integrations</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {integrations.filter(i => i.status === 'approved').length}
              </div>
              <div className="text-white/60 text-sm">Approved</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {apiKeys.reduce((sum, k) => sum + (k.usage_statistics?.total_requests || 0), 0)}
              </div>
              <div className="text-white/60 text-sm">API Calls</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60 border-cyan-500/30">
            <TabsTrigger value="api">API Console</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="mt-6">
            <DeveloperAPIConsole3D apiKeys={apiKeys} endpoints={endpoints} />
          </TabsContent>

          <TabsContent value="keys" className="mt-6">
            <Card className="bg-black/40 border-cyan-500/50 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Generate New API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => generateKeyMutation.mutate()}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>

                {generatedKey && (
                  <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
                    <div className="text-green-400 font-bold mb-2">Your API Key (copy now!):</div>
                    <div className="flex items-center gap-2">
                      <code className="text-white bg-black/60 px-3 py-2 rounded flex-1 text-sm">
                        {generatedKey}
                      </code>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedKey);
                          toast.success('API key copied!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {apiKeys.map((key, idx) => (
                <Card key={key.id} className="bg-black/40 border-cyan-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-bold">API Key #{idx + 1}</div>
                        <div className="text-white/60 text-xs">ID: {key.api_key_id?.slice(0, 16)}...</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={key.is_active ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}>
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                        {key.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeKeyMutation.mutate(key.api_key_id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-white/60">Requests</div>
                        <div className="text-white font-bold">{key.usage_statistics?.total_requests || 0}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Success Rate</div>
                        <div className="text-white font-bold">
                          {key.usage_statistics?.total_requests > 0
                            ? ((key.usage_statistics.successful_requests / key.usage_statistics.total_requests) * 100).toFixed(0)
                            : 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60">Permissions</div>
                        <div className="text-white font-bold">{key.permissions?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <div className="space-y-4">
              {integrations.map((integration, idx) => (
                <Card key={integration.id} className="bg-black/40 border-purple-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-bold text-lg">{integration.integration_name}</div>
                        <Badge className="mt-1 bg-purple-500/30 text-purple-300">
                          {integration.integration_type}
                        </Badge>
                      </div>
                      <Badge className={
                        integration.status === 'approved' ? 'bg-green-500/30 text-green-300' :
                        integration.status === 'active' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-orange-500/30 text-orange-300'
                      }>
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-xs mt-4">
                      <div>
                        <div className="text-white/60">Security Score</div>
                        <div className="text-white font-bold">
                          {((integration.security_audit?.security_score || 0) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60">Installs</div>
                        <div className="text-white font-bold">{integration.installation_count || 0}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Rating</div>
                        <div className="text-white font-bold">{integration.rating?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Capabilities</div>
                        <div className="text-white font-bold">{integration.capabilities?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}