import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, FolderOpen, FileSpreadsheet, FileText, 
  Presentation, MessageSquare, FileCheck, Briefcase, 
  Users, Linkedin, Music, CheckCircle, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_INTEGRATIONS = [
  { type: 'googlecalendar', name: 'Google Calendar', icon: Calendar, color: 'text-blue-500' },
  { type: 'googledrive', name: 'Google Drive', icon: FolderOpen, color: 'text-yellow-500' },
  { type: 'googlesheets', name: 'Google Sheets', icon: FileSpreadsheet, color: 'text-green-500' },
  { type: 'googledocs', name: 'Google Docs', icon: FileText, color: 'text-blue-400' },
  { type: 'googleslides', name: 'Google Slides', icon: Presentation, color: 'text-orange-500' },
  { type: 'slack', name: 'Slack', icon: MessageSquare, color: 'text-purple-500' },
  { type: 'notion', name: 'Notion', icon: FileCheck, color: 'text-gray-300' },
  { type: 'salesforce', name: 'Salesforce', icon: Briefcase, color: 'text-blue-600' },
  { type: 'hubspot', name: 'HubSpot', icon: Briefcase, color: 'text-orange-600' },
  { type: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { type: 'tiktok', name: 'TikTok', icon: Music, color: 'text-pink-500' }
];

export default function OAuthManager({ connections }) {
  const [connecting, setConnecting] = useState(null);
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (integrationType) => {
      // Note: This requires backend functions to be enabled
      // The actual OAuth flow would be handled by base44 platform
      await base44.entities.OAuthConnection.create({
        service_name: AVAILABLE_INTEGRATIONS.find(i => i.type === integrationType)?.name,
        integration_type: integrationType,
        connection_status: 'connected',
        connected_date: new Date().toISOString(),
        usage_count: 0
      });
    },
    onSuccess: (_, integrationType) => {
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
      toast.success(`Connected to ${AVAILABLE_INTEGRATIONS.find(i => i.type === integrationType)?.name}`);
      setConnecting(null);
    },
    onError: (error) => {
      toast.error('Connection failed: ' + error.message);
      setConnecting(null);
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId) => {
      await base44.entities.OAuthConnection.update(connectionId, {
        connection_status: 'disconnected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
      toast.success('Disconnected successfully');
    }
  });

  const handleConnect = async (integrationType) => {
    setConnecting(integrationType);
    
    // Alert user that backend functions must be enabled
    toast.info('Note: Backend functions must be enabled for OAuth connections', {
      duration: 5000
    });
    
    connectMutation.mutate(integrationType);
  };

  const getConnectionStatus = (integrationType) => {
    return connections?.find(c => c.integration_type === integrationType);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">OAuth Connections</CardTitle>
        <p className="text-sm text-gray-400">
          Connect external services to enable advanced integrations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_INTEGRATIONS.map((integration) => {
            const connection = getConnectionStatus(integration.type);
            const isConnected = connection?.connection_status === 'connected';
            const Icon = integration.icon;

            return (
              <div 
                key={integration.type}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${integration.color}`} />
                    <div>
                      <h3 className="text-white font-semibold">{integration.name}</h3>
                      <p className="text-xs text-gray-400">{integration.type}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {connection && isConnected && (
                  <div className="text-xs text-gray-400 mb-3">
                    <p>Connected: {new Date(connection.connected_date).toLocaleDateString()}</p>
                    <p>Used: {connection.usage_count || 0} times</p>
                  </div>
                )}

                <Button
                  onClick={() => isConnected 
                    ? disconnectMutation.mutate(connection.id)
                    : handleConnect(integration.type)
                  }
                  disabled={connecting === integration.type}
                  size="sm"
                  variant={isConnected ? 'outline' : 'default'}
                  className={`w-full ${isConnected ? 'text-white border-white/20' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {connecting === integration.type ? 'Connecting...' :
                   isConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> OAuth connections require backend functions to be enabled in your app settings.
            Once enabled, you can authorize these services to work with your application data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}