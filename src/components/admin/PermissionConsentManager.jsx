import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PermissionConsentManager() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data: consents = [] } = useQuery({
    queryKey: ['permissionConsents'],
    queryFn: () => base44.entities.UserPermissionConsent?.list?.('-created_date', 100) || [],
    initialData: []
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => base44.entities.UserPermissionConsent?.update?.(id, { status: 'revoked', revoked_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissionConsents'] })
  });

  const getPermissionIcon = (type) => {
    const icons = {
      location_access: '📍',
      notification_access: '🔔',
      camera_access: '📷',
      microphone_access: '🎤',
      contact_access: '👥',
      calendar_access: '📅',
      files_access: '📁',
      health_data_access: '❤️'
    };
    return icons[type] || '🔒';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      granted: 'bg-green-500/20 text-green-300',
      denied: 'bg-red-500/20 text-red-300',
      revoked: 'bg-slate-500/20 text-slate-300'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300';
  };

  const groupedConsents = consents.reduce((acc, consent) => {
    if (!acc[consent.user_email]) acc[consent.user_email] = [];
    acc[consent.user_email].push(consent);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Permission Types Overview */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Permission Consent Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['location_access', 'notification_access', 'camera_access', 'microphone_access', 'contact_access', 'calendar_access', 'files_access', 'health_data_access'].map(type => {
              const granted = consents.filter(c => c.permission_type === type && c.status === 'granted').length;
              const total = consents.filter(c => c.permission_type === type).length;
              return (
                <div key={type} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-lg mb-1">{getPermissionIcon(type)}</p>
                  <p className="text-xs text-slate-400 capitalize mb-2">{type.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-white">
                    {granted}/{total}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Permissions */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">User Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
          {Object.entries(groupedConsents).map(([userEmail, userConsents]) => (
            <div key={userEmail} className="space-y-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="font-medium text-white text-sm">{userEmail}</p>
              <div className="space-y-2 ml-2">
                {userConsents.map(consent => (
                  <motion.div
                    key={consent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 bg-slate-900/50 rounded flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getPermissionIcon(consent.permission_type)}</span>
                        <span className="text-sm text-slate-300 capitalize">
                          {consent.permission_type.replace(/_/g, ' ')}
                        </span>
                        <Badge className={getStatusColor(consent.status)}>
                          {consent.status}
                        </Badge>
                      </div>
                      {consent.context && (
                        <p className="text-xs text-slate-400">Context: {consent.context}</p>
                      )}
                      {consent.retention_period && (
                        <p className="text-xs text-slate-400">Retained for: {consent.retention_period} days</p>
                      )}
                      {consent.third_party_sharing && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                          <AlertCircle className="w-3 h-3" />
                          Shared with third parties
                        </div>
                      )}
                    </div>

                    {consent.status === 'granted' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeMutation.mutate(consent.id)}
                        disabled={revokeMutation.isPending}
                        className="text-red-400 hover:text-red-300 whitespace-nowrap"
                      >
                        Revoke
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Info */}
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl border-blue-500/30 bg-blue-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-blue-300">Privacy & Data Protection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-300 space-y-2">
            <p>✓ All permission requests require explicit user consent</p>
            <p>✓ Users can revoke permissions at any time</p>
            <p>✓ Data usage is limited to stated context only</p>
            <p>✓ Automatic deletion after retention period</p>
            <p>✓ Full audit trail for all permission changes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}