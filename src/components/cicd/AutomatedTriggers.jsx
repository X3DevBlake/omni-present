import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomatedTriggers({ deploymentId, monitorId }) {
  const queryClient = useQueryClient();

  const autoRetrain = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autoRetrain', {
        monitor_id: monitorId,
        deployment_id: deploymentId
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cicd-pipelines'] });
      if (data.action === 'retraining_initiated') {
        toast.success(`Auto-retraining started! Est. improvement: ${data.improvement_estimate}%`);
      } else {
        toast.info('Model health is good, no retraining needed');
      }
    }
  });

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Automated Triggers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-white text-sm font-medium">Drift Detection</div>
                <div className="text-white/60 text-xs">Retrain when drift &gt; 20%</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-white text-sm font-medium">Performance Drop</div>
                <div className="text-white/60 text-xs">Retrain when accuracy drops &gt; 5%</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-white text-sm font-medium">Scheduled Retrain</div>
                <div className="text-white/60 text-xs">Weekly model refresh</div>
              </div>
            </div>
            <Switch />
          </div>
        </div>

        <Button
          onClick={() => autoRetrain.mutate()}
          disabled={autoRetrain.isPending || !monitorId}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {autoRetrain.isPending ? 'Analyzing...' : 'Check & Auto-Retrain'}
        </Button>
      </CardContent>
    </Card>
  );
}