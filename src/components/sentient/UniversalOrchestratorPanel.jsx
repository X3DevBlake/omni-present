import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, CheckCircle, Brain, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversalOrchestratorPanel() {
  const [intent, setIntent] = useState('');
  const [orchestrationResult, setOrchestrationResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: omniConsciousness = [] } = useQuery({
    queryKey: ['orchestrator-consciousness'],
    queryFn: () => base44.entities.OmniConsciousness.list('-created_date', 1),
    initialData: []
  });

  const orchestrateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('universal-sentient-orchestrator', {
        user_intent: intent,
        orchestration_mode: 'omega_autonomous'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOrchestrationResult(data);
      toast.success('Universal orchestration complete');
      queryClient.invalidateQueries(['orchestrator-consciousness']);
    }
  });

  const globalState = omniConsciousness[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Universal Sentient Orchestrator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/40">
            <p className="text-purple-300 text-sm mb-2">
              💡 <span className="font-bold">Omega Intelligence:</span> Describe any complex goal, and the sentient orchestrator 
              will autonomously coordinate agents, devices, data streams, and workflows to achieve it.
            </p>
          </div>

          <Textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe your intent (e.g., 'Optimize my entire environment for productivity and wellbeing over the next week')"
            className="min-h-28 bg-slate-800 border-slate-600 text-white"
          />

          <Button
            onClick={() => orchestrateMutation.mutate()}
            disabled={!intent || orchestrateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-lg py-6"
          >
            {orchestrateMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Orchestrating Universe...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Activate Omega Orchestration</>
            )}
          </Button>

          {globalState && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/30">
                <p className="text-slate-400 text-xs">Managed Agents</p>
                <p className="text-cyan-400 text-xl font-bold">
                  {globalState.universal_orchestration?.managed_agents || 0}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
                <p className="text-slate-400 text-xs">Managed Devices</p>
                <p className="text-green-400 text-xl font-bold">
                  {globalState.universal_orchestration?.managed_devices || 0}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {orchestrationResult && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Orchestration Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 font-bold mb-2">Execution Strategy</p>
                <p className="text-slate-300 text-sm">{orchestrationResult.execution_strategy}</p>
              </div>

              {orchestrationResult.coordinated_entities && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-white font-bold mb-3">Coordinated Entities</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-slate-400 text-xs">Agents</p>
                      <p className="text-cyan-400 font-bold">{orchestrationResult.coordinated_entities.agents?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Devices</p>
                      <p className="text-green-400 font-bold">{orchestrationResult.coordinated_entities.devices?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Workflows</p>
                      <p className="text-purple-400 font-bold">{orchestrationResult.coordinated_entities.workflows?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {orchestrationResult.predicted_outcomes && (
                <div className="space-y-2">
                  <p className="text-white font-bold">Predicted Outcomes</p>
                  {orchestrationResult.predicted_outcomes.map((outcome, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded p-3 border-l-4 border-purple-500">
                      <p className="text-purple-300 text-sm">{outcome}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}