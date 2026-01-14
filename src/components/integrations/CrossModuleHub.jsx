import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Link2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const INTEGRATION_TEMPLATES = [
  {
    name: 'Alert → Pause Workflow',
    source: 'monitoring',
    target: 'orchestration',
    trigger: 'critical_alert',
    description: 'Pause team workflows when critical alert is detected'
  },
  {
    name: 'Marketplace → Orchestration',
    source: 'marketplace',
    target: 'orchestration',
    trigger: 'agent_deployed',
    description: 'Auto-add deployed agents to team workflows'
  },
  {
    name: 'DeFi → Banking Sync',
    source: 'defi',
    target: 'banking',
    trigger: 'transaction_completed',
    description: 'Sync DeFi transactions to banking history'
  }
];

export default function CrossModuleHub() {
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ['cross-module-integrations'],
    queryFn: () => base44.entities.CrossModuleIntegration.list()
  });

  const createIntegration = useMutation({
    mutationFn: (data) => base44.entities.CrossModuleIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-module-integrations'] });
      toast.success('Integration created');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-purple-500" />
            Cross-Module Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Templates */}
          <div>
            <h3 className="font-semibold mb-3">Quick Setup Templates</h3>
            <div className="grid gap-3">
              {INTEGRATION_TEMPLATES.map((template, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{template.source}</Badge>
                        <ArrowRight className="w-3 h-3" />
                        <Badge variant="secondary">{template.target}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createIntegration.mutate({
                        integration_name: template.name,
                        source_module: template.source,
                        target_module: template.target,
                        trigger_event: template.trigger,
                        action_config: {}
                      })}
                    >
                      Enable
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Integrations */}
          <div>
            <h3 className="font-semibold mb-3">Active Integrations</h3>
            <div className="space-y-2">
              {integrations?.map((integration) => (
                <div key={integration.id} className="p-3 rounded border bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{integration.integration_name}</p>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <Badge variant="outline">{integration.source_module}</Badge>
                        <ArrowRight className="w-3 h-3" />
                        <Badge variant="outline">{integration.target_module}</Badge>
                        <span className="text-gray-500">• {integration.execution_count} executions</span>
                      </div>
                    </div>
                    <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}