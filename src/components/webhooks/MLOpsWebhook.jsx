import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Webhook, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function MLOpsWebhook() {
  const queryClient = useQueryClient();

  const setupWebhook = useMutation({
    mutationFn: async () => {
      const webhook = await base44.entities.WebhookConfiguration.create({
        webhook_name: 'Model_Drift_Alert',
        target_url: 'https://api.mlops.io/drift-webhook',
        trigger_entity: 'MLOpsMonitor',
        trigger_events: ['update'],
        filter_conditions: {
          drift_detection: { data_drift_score: { $gt: 0.2 } }
        },
        payload_template: {
          alert_type: 'model_drift',
          severity: 'high'
        },
        is_active: true
      });
      
      toast.success('Drift detection webhook configured');
      return webhook;
    }
  });

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          MLOps Webhooks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-white/70 text-sm">
          Configure webhooks for automated alerts and pipeline triggers
        </div>
        
        <Button
          onClick={() => setupWebhook.mutate()}
          disabled={setupWebhook.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Bell className="w-4 h-4 mr-2" />
          Setup Drift Alert Webhook
        </Button>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/60">Trigger</div>
            <div className="text-white font-medium">Model Drift</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/60">Threshold</div>
            <div className="text-white font-medium">&gt; 20%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}