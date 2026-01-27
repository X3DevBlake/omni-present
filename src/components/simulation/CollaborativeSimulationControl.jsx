import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, MessageSquare, AlertCircle } from 'lucide-react';

export default function CollaborativeSimulationControl({ simulationId }) {
  const { data: collaboration } = useQuery({
    queryKey: ['collab-sim', simulationId],
    queryFn: async () => {
      const res = await base44.functions.invoke('collaborativeDirector', { 
        simulation_id: simulationId,
        active_agents: 5 
      });
      return res.data;
    },
    refetchInterval: 10000
  });

  return (
    <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-cyan-400" />
          Collaborative AI Director Council
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {collaboration ? (
          <>
            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/20">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{collaboration.consensus_scenario}</h3>
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  Complexity: {collaboration.complexity_score}
                </Badge>
              </div>
              <p className="text-white/70 text-sm italic">"{collaboration.reasoning}"</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Council Debate Log</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {collaboration.agent_votes?.map((vote, i) => (
                  <div key={i} className="flex gap-3 text-xs bg-white/5 p-2 rounded">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                      AI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-300 font-bold">{vote.ai_name}</span>
                        <span className="text-white/40">voted</span>
                        <Badge className="text-[10px] h-4 bg-white/10">{vote.vote}</Badge>
                      </div>
                      <p className="text-white/60 mt-1">{vote.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-white/40 animate-pulse">
            The AI Council is deliberating...
          </div>
        )}
      </CardContent>
    </Card>
  );
}