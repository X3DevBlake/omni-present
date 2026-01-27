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
      if (response.data.intervention?.type) {
        setLastAction(response.data);
        toast.info(`AI Director: ${response.data.intervention.event}`);
      }
      return response.data;
    },
    enabled: isActive,
    refetchInterval: 5000 // Poll every 5s when active
  });

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5 text-purple-400" />
          Autonomous AI Director
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-white font-medium">
              {isActive ? 'AI Control Active' : 'AI Standby'}
            </span>
          </div>
          <Button 
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
            className={isActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-purple-600 hover:bg-purple-700"}
          >
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Disengage' : 'Engage Autonomy'}
          </Button>
        </div>

        {/* AI Thinking Visualization */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-white/60">
            <span>Analysis Cycle</span>
            <span>{isActive ? 'Processing...' : 'Idle'}</span>
          </div>
          <Progress value={isActive ? 66 : 0} className="h-1" />
        </div>

        {/* Last Action Log */}
        <div className="space-y-2">
          <h4 className="text-sm text-purple-300 font-bold flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Decision Log
          </h4>
          
          <div className="h-32 overflow-y-auto bg-black/40 rounded-md p-3 border border-white/5 space-y-3">
            {lastAction ? (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                    {lastAction.intervention.type.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-white/40">Just now</span>
                </div>
                <p className="text-sm text-white font-medium mb-1">
                  {lastAction.intervention.event}
                </p>
                <p className="text-xs text-white/60 italic">
                  "{lastAction.reasoning}"
                </p>
                <div className="mt-2 text-xs text-purple-400">
                  Adjusted {lastAction.intervention.parameter} to {lastAction.intervention.value}
                </div>
              </div>
            ) : (
              <div className="text-white/30 text-xs text-center py-8">
                Waiting for AI intervention...
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}