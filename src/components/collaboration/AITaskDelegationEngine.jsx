import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaskDelegationEngine({ collaborationId, agents = [] }) {
  const [optimizing, setOptimizing] = useState(false);
  const queryClient = useQueryClient();

  const { data: performanceData } = useQuery({
    queryKey: ['agent-performance', agents.map(a => a.id)],
    queryFn: async () => {
      const kpis = await base44.entities.AgentKPI.list('-created_date', 100);
      return agents.map(agent => {
        const agentKpis = kpis.filter(k => k.agent_id === agent.id);
        const avgPerformance = agentKpis.reduce((sum, k) => sum + (k.kpi_value || 0), 0) / (agentKpis.length || 1);
        return {
          ...agent,
          performance: avgPerformance,
          taskCount: agentKpis.length
        };
      });
    },
    enabled: agents.length > 0
  });

  const delegateTask = useMutation({
    mutationFn: async (taskData) => {
      // Use AI to determine optimal agent
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze agent performance and delegate this task optimally:
        
Task: ${taskData.description}
Available agents: ${JSON.stringify(performanceData)}

Determine:
1. Best agent for this task
2. Estimated completion time
3. Task priority
4. Dependencies`,
        response_json_schema: {
          type: 'object',
          properties: {
            assigned_agent_id: { type: 'string' },
            estimated_hours: { type: 'number' },
            priority: { type: 'string' },
            reasoning: { type: 'string' }
          }
        }
      });

      // Create the delegation record
      return await base44.entities.AgentCommunication.create({
        collaboration_id: collaborationId,
        from_agent_id: 'system',
        to_agent_id: result.assigned_agent_id,
        message_type: 'task_delegation',
        message_content: taskData.description,
        metadata: result
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Task delegated successfully!');
    }
  });

  const optimizeWorkload = useMutation({
    mutationFn: async () => {
      setOptimizing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze current agent workload and suggest optimizations:
        
Agents: ${JSON.stringify(performanceData)}
Collaboration: ${collaborationId}

Provide recommendations for:
1. Load balancing
2. Task reassignments
3. Agent pairings for efficiency
4. Potential bottlenecks`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent_id: { type: 'string' },
                  action: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            optimal_pairings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent1: { type: 'string' },
                  agent2: { type: 'string' },
                  synergy_score: { type: 'number' }
                }
              }
            }
          }
        }
      });
      setOptimizing(false);
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.optimal_pairings?.length || 0} optimal pairings`);
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            AI Task Delegation
          </span>
          <Button
            size="sm"
            onClick={() => optimizeWorkload.mutate()}
            disabled={optimizing || !performanceData}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimize
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceData?.map(agent => (
            <div key={agent.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">{agent.name}</span>
                </div>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Performance</span>
                    <span>{agent.performance?.toFixed(0)}%</span>
                  </div>
                  <Progress value={agent.performance || 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Active Tasks</span>
                  <Badge variant="outline" className="text-white">
                    {agent.taskCount || 0}
                  </Badge>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3"
                onClick={() => delegateTask.mutate({ 
                  description: 'New collaborative task',
                  agent_id: agent.id 
                })}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Delegate Task
              </Button>
            </div>
          ))}

          {optimizeWorkload.data?.optimal_pairings && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Optimal Pairings</h4>
              <div className="space-y-2">
                {optimizeWorkload.data.optimal_pairings.map((pairing, idx) => (
                  <div key={idx} className="text-xs text-gray-300 flex items-center justify-between">
                    <span>{pairing.agent1} + {pairing.agent2}</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {pairing.synergy_score}% synergy
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}