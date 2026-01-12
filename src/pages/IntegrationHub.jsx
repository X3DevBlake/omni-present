import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, Plug, Webhook, Flag, Zap, 
  CheckCircle, XCircle, Settings, Brain 
} from 'lucide-react';
import OAuthManager from '../components/integrations/OAuthManager';
import AdvancedWebhookConfig from '../components/integrations/AdvancedWebhookConfig';
import WorkflowAnalytics from '../components/integrations/WorkflowAnalytics';
import DynamicRulesManager from '../components/integrations/DynamicRulesManager';

export default function IntegrationHub() {
  const [activeTab, setActiveTab] = useState('oauth');

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list(),
  });

  const { data: connections } = useQuery({
    queryKey: ['oauth-connections'],
    queryFn: () => base44.entities.OAuthConnection.list(),
  });

  const { data: flags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
  });

  const { data: rules } = useQuery({
    queryKey: ['dynamic-rules'],
    queryFn: () => base44.entities.DynamicRuleSet.list(),
  });

  const queryClient = useQueryClient();

  const runWorkflowAnalysis = useMutation({
    mutationFn: async () => {
      // This would call the workflow analyzer function
      return await base44.integrations.Core.InvokeLLM({
        prompt: 'Analyze current system state and suggest optimizations',
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-rules'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Workflow className="w-10 h-10" />
              Integration Hub
            </h1>
            <p className="text-gray-300">Manage OAuth connections, webhooks, feature flags, and AI-driven workflows</p>
          </div>
          <Button 
            onClick={() => runWorkflowAnalysis.mutate()}
            disabled={runWorkflowAnalysis.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {runWorkflowAnalysis.isPending ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">OAuth Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">
                  {connections?.filter(c => c.connection_status === 'connected').length || 0}
                </span>
                <Plug className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Active connections</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">
                  {webhooks?.filter(w => w.status === 'active').length || 0}
                </span>
                <Webhook className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Active webhooks</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">
                  {flags?.filter(f => f.enabled).length || 0}
                </span>
                <Flag className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Enabled flags</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">AI Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">
                  {rules?.filter(r => r.active).length || 0}
                </span>
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Active automation rules</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="oauth">OAuth Connections</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="rules">AI Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="oauth">
            <OAuthManager connections={connections} />
          </TabsContent>

          <TabsContent value="webhooks">
            <AdvancedWebhookConfig webhooks={webhooks} />
          </TabsContent>

          <TabsContent value="flags">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Feature Flag Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flags?.map(flag => (
                    <div key={flag.id} className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{flag.feature_name}</h3>
                        <p className="text-sm text-gray-400">{flag.feature_key}</p>
                      </div>
                      <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => window.location.href = '/feature-flag-manager'} 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Manage Feature Flags
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <DynamicRulesManager rules={rules} />
          </TabsContent>

          <TabsContent value="analytics">
            <WorkflowAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}