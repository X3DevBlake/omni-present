import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Activity, BrainCircuit, Play, Pause, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AutonomousDirectorPanel({ simulationId }) {
  const [isActive, setIsActive] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Poll for AI updates
  useQuery({
    queryKey: ['ai-director', simulationId],
    queryFn: async () => {
      if (!isActive) return null;
      const response = await base44.functions.invoke('autonomousDirector', { simulation_id: simulationId });
      if (response.data.intervention?.event_name) {
        setLastAction(response.data);
        toast.info(`AI Director: ${response.data.intervention.event_name}`);
      }
      return response.data;
    },
    enabled: isActive,
    refetchInterval: 8000 // Longer poll for LLM
  });

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5 text-purple-400" />
          Autonomous AI Director
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-white font-medium">
              {isActive ? 'Omega AI Active' : 'AI Offline'}
            </span>
          </div>
          <Button 
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
            className={isActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-purple-600 hover:bg-purple-700"}
          >
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Disengage' : 'Engage Sentience'}
          </Button>
        </div>

        {/* Narrative Log */}
        <div className="space-y-2 flex-1">
          <h4 className="text-sm text-purple-300 font-bold flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Neural Decision Stream
          </h4>
          
          <div className="h-64 overflow-y-auto bg-black/40 rounded-md p-4 border border-white/5 space-y-4">
            {lastAction ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
                 <div className="flex justify-between items-center">
                    <Badge className="bg-purple-900 text-purple-100 hover:bg-purple-800">
                      {lastAction.intervention.event_name}
                    </Badge>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                      {lastAction.intervention.intervention_type}
                    </span>
                 </div>
                 
                 <p className="text-sm text-white/90 leading-relaxed font-light border-l-2 border-purple-500 pl-3">
                   "{lastAction.intervention.narrative_description}"
                 </p>

                 <div className="bg-white/5 rounded p-2 text-xs text-white/60">
                   <span className="text-purple-400 font-bold">Reasoning:</span> {lastAction.intervention.ai_reasoning || lastAction.intervention.reasoning}
                 </div>

                 <div className="flex items-center gap-2 text-[10px] text-white/40 pt-2 border-t border-white/5">
                   <Zap className="w-3 h-3 text-yellow-500" />
                   Action: Adjusted {lastAction.intervention.parameter} to {lastAction.intervention.value}%
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs gap-2">
                <BrainCircuit className="w-8 h-8 opacity-20" />
                <span>Waiting for neural output...</span>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}