import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Network, Server, UserCheck, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CrossHubResourceBroker({ missionId }) {
  const [selectedHubs, setSelectedHubs] = useState([]);

  // Fetch Hubs
  const { data: hubs } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => base44.entities.Hub.list(),
    initialData: []
  });

  // Broker Resources Mutation
  const brokerMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('brokerResources', {
        mission_id: missionId,
        hub_ids: selectedHubs
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Resources successfully brokered across hubs');
    }
  });

  // AI Assignment Mutation
  const assignmentMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('suggestOptimalAssignments', {
        mission_id: missionId,
        requirements: { skills: ['Strategy', 'Cybersecurity'] } // simplified
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('AI has suggested optimal agent assignments');
    }
  });

  const toggleHub = (id) => {
    setSelectedHubs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ArrowRightLeft className="w-5 h-5 text-purple-400" />
          AI Cross-Hub Orchestration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Hub Selector */}
        <div>
          <h4 className="text-sm text-gray-400 mb-2">Available Resource Hubs</h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {hubs.map(hub => (
              <div 
                key={hub.id}
                onClick={() => toggleHub(hub.id)}
                className={`p-2 rounded cursor-pointer border transition-all ${
                  selectedHubs.includes(hub.id) 
                    ? 'bg-purple-500/20 border-purple-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-3 h-3" />
                  <span className="text-xs truncate">{hub.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={() => brokerMutation.mutate()}
            disabled={brokerMutation.isPending || selectedHubs.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Network className="w-4 h-4 mr-2" />
            {brokerMutation.isPending ? 'Brokering...' : 'Auto-Broker Resources'}
          </Button>

          <Button 
            onClick={() => assignmentMutation.mutate()}
            disabled={assignmentMutation.isPending}
            variant="outline"
            className="border-purple-500/30 text-purple-400"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {assignmentMutation.isPending ? 'Analyzing...' : 'Suggest Agent Assignments'}
          </Button>
        </div>

        {/* Results Preview */}
        {assignmentMutation.data && (
          <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
            <h5 className="text-xs font-bold text-purple-300 mb-2">AI Suggestions</h5>
            <div className="space-y-1">
              {assignmentMutation.data.suggestions.map((agent, i) => (
                <div key={i} className="flex justify-between items-center text-xs text-white">
                  <span>{agent.name}</span>
                  <Badge variant="secondary" className="text-[10px]">Optimal Match</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}