import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function AgentRoleAssignment() {
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents-capabilities'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents.map(a => ({
        ...a,
        capabilities: a.skills || [],
        suggested_role: 'unassigned',
      }));
    },
  });

  const { data: availableRoles } = useQuery({
    queryKey: ['workflow-roles'],
    queryFn: async () => {
      return [
        { id: 'coordinator', name: 'Coordinator', requirements: ['leadership', 'planning'] },
        { id: 'executor', name: 'Executor', requirements: ['execution', 'reliability'] },
        { id: 'analyst', name: 'Analyst', requirements: ['analysis', 'data_processing'] },
        { id: 'optimizer', name: 'Optimizer', requirements: ['optimization', 'efficiency'] },
      ];
    },
  });

  const autoAssignRoles = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autoAssignAgentRoles', {
        agents: agents?.map(a => ({ id: a.id, capabilities: a.capabilities })),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents-capabilities'] });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Agent Role Assignment</CardTitle>
            <Button
              onClick={() => autoAssignRoles.mutate()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-Assign Roles
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agents?.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{agent.name}</h4>
                    <p className="text-white/60 text-sm">{agent.role}</p>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
                    {agent.suggested_role}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {agent.capabilities?.slice(0, 5).map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableRoles?.map(role => (
              <div key={role.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h4 className="text-white font-medium mb-2">{role.name}</h4>
                <div className="space-y-1">
                  {role.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="capitalize">{req.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}