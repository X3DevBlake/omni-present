import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Zap, Activity, Globe, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function AutonomousSettings() {
  const queryClient = useQueryClient();
  
  const { data: settings = [] } = useQuery({
    queryKey: ['autonomous-settings'],
    queryFn: () => base44.entities.AutonomousSetting.list()
  });

  const toggleSettingMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      return base44.entities.AutonomousSetting.update(id, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autonomous-settings']);
      toast.success('Autonomy setting updated');
    }
  });

  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          Autonomous Control Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-white font-bold">Global Autonomy Kill-Switch</h3>
              <p className="text-white/60 text-sm">Instantly disable all autonomous agent actions</p>
            </div>
          </div>
          <Switch className="data-[state=checked]:bg-red-500" />
        </div>

        <div className="grid gap-4">
          {settings.map(setting => (
            <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                {setting.category === 'agents' && <Bot className="w-5 h-5 text-purple-400" />}
                {setting.category === 'workflow' && <Activity className="w-5 h-5 text-green-400" />}
                {setting.category === 'trading' && <Zap className="w-5 h-5 text-yellow-400" />}
                <div>
                  <h4 className="text-white font-medium">{setting.setting_name}</h4>
                  <p className="text-white/60 text-xs">{setting.description}</p>
                </div>
              </div>
              <Switch 
                checked={setting.enabled}
                onCheckedChange={(checked) => toggleSettingMutation.mutate({ id: setting.id, enabled: checked })}
              />
            </div>
          ))}
          {settings.length === 0 && (
            <p className="text-white/40 text-center text-sm">No autonomous settings configured yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}