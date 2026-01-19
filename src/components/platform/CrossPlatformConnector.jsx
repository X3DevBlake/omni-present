import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Mail, 
  Smartphone,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function CrossPlatformConnector({ agentId }) {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const { data: connectors } = useQuery({
    queryKey: ['agent-connectors', agentId],
    queryFn: () => base44.entities.AgentConnector.filter({ agent_id: agentId }),
  });

  const syncPlatform = useMutation({
    mutationFn: async (platformType) => {
      const response = await base44.functions.invoke('platform/crossPlatformAgentSync', {
        agent_id: agentId,
        platform_type: platformType
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-connectors'] });
    }
  });

  const platforms = [
    { type: 'slack', name: 'Slack', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { type: 'telegram', name: 'Telegram', icon: Send, color: 'from-blue-500 to-cyan-500' },
    { type: 'discord', name: 'Discord', icon: Users, color: 'from-indigo-500 to-purple-500' },
    { type: 'teams', name: 'Microsoft Teams', icon: Users, color: 'from-blue-600 to-indigo-600' },
    { type: 'whatsapp', name: 'WhatsApp', icon: Smartphone, color: 'from-green-500 to-emerald-500' },
    { type: 'email', name: 'Email', icon: Mail, color: 'from-red-500 to-orange-500' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectorForPlatform = (platformType) => {
    return connectors?.find(c => c.platform_type === platformType);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const connector = getConnectorForPlatform(platform.type);
        const isConnected = connector?.connection_status === 'connected';

        return (
          <Card 
            key={platform.type} 
            className={`bg-gradient-to-br ${platform.color} bg-opacity-10 border-white/10 cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => setSelectedPlatform(platform)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white" />
                {getStatusIcon(connector?.connection_status)}
              </div>
              <h3 className="text-white font-bold mb-2">{platform.name}</h3>
              {connector && (
                <div className="space-y-2">
                  <Badge className={
                    isConnected ? 'bg-green-500' : 'bg-gray-500'
                  }>
                    {connector.connection_status}
                  </Badge>
                  {isConnected && (
                    <>
                      <div className="text-white/60 text-xs">
                        Messages: {connector.messages_synced || 0}
                      </div>
                      <div className="text-white/60 text-xs">
                        Last sync: {connector.last_sync ? new Date(connector.last_sync).toLocaleString() : 'Never'}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          syncPlatform.mutate(platform.type);
                        }}
                        disabled={syncPlatform.isPending}
                        className="w-full bg-white/20 hover:bg-white/30"
                      >
                        Sync Now
                      </Button>
                    </>
                  )}
                </div>
              )}
              {!connector && (
                <Button
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30"
                >
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}