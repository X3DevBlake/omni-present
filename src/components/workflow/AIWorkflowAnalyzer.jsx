import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Brain, TrendingUp, Zap, Users, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWorkflowAnalyzer({ onCreateWorkflow }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [automationSuggestions, setAutomationSuggestions] = useState([]);
  const [agentPairings, setAgentPairings] = useState([]);

  const { data: activityLogs } = useQuery({
    queryKey: ['activity-logs-analysis'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200)
  });

  const { data: workflows } = useQuery({
    queryKey: ['workflows-analysis'],
    queryFn: () => base44.entities.Workflow.list()
  });

  const { data: agentKPIs } = useQuery({
    queryKey: ['agent-kpis-analysis'],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 200)
  });

  const { data: collaborations } = useQuery({
    queryKey: ['collaborations-analysis'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 100)
  });

  const analyzePatterns = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze user activity patterns and identify automation opportunities:

Activity Logs: ${JSON.stringify(activityLogs?.slice(0, 50))}
Existing Workflows: ${JSON.stringify(workflows?.map(w => ({ name: w.workflow_name, type: w.trigger_type })))}
Agent Performance: ${JSON.stringify(agentKPIs?.slice(0, 30))}
Collaboration History: ${JSON.stringify(collaborations?.slice(0, 20))}

Identify:
1. Recurring task patterns that could be automated (5 suggestions)
2. Complex tasks suitable for workflow automation
3. Optimal agent pairings based on performance and synergy
4. Bottlenecks in current processes

Provide actionable workflow suggestions with:
- Workflow name
- Description
- Suggested triggers
- Agent requirements
- Estimated time savings
- Complexity level`,
        response_json_schema: {
          type: 'object',
          properties: {
            automation_opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  workflow_name: { type: 'string' },
                  description: { type: 'string' },
                  trigger_type: { type: 'string' },
                  required_agents: { type: 'array', items: { type: 'string' } },
                  time_savings_hours: { type: 'number' },
                  complexity: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            optimal_pairings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent1_type: { type: 'string' },
                  agent2_type: { type: 'string' },
                  synergy_score: { type: 'number' },
                  best_for_tasks: { type: 'array', items: { type: 'string' } },
                  historical_success_rate: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setAnalyzing(false);
      setAutomationSuggestions(result.automation_opportunities || []);
      setAgentPairings(result.optimal_pairings || []);
      
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.automation_opportunities?.length || 0} automation opportunities!`);
    },
    onError: () => {
      setAnalyzing(false);
      toast.error('Analysis failed');
    }
  });

  const complexityColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Workflow Analyzer
            </span>
            <Button
              onClick={() => analyzePatterns.mutate()}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyzing && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white/60">Analyzing activity patterns and performance data...</p>
            </div>
          )}

          {!analyzing && automationSuggestions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Click "Analyze Patterns" to discover automation opportunities</p>
            </div>
          )}

          {automationSuggestions.length > 0 && (
            <div className="space-y-6">
              {/* Automation Opportunities */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Automation Opportunities ({automationSuggestions.length})
                </h3>
                <div className="space-y-3">
                  {automationSuggestions.map((suggestion, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{suggestion.workflow_name}</h4>
                            <p className="text-sm text-gray-400 mb-2">{suggestion.description}</p>
                          </div>
                          <Badge className={complexityColors[suggestion.complexity] || 'bg-gray-500/20 text-gray-400'}>
                            {suggestion.complexity}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Time Savings</div>
                            <div className="text-white font-semibold">{suggestion.time_savings_hours}h/week</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Trigger Type</div>
                            <Badge variant="outline">{suggestion.trigger_type}</Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-2">Required Agents</div>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.required_agents?.map((agent, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => onCreateWorkflow?.(suggestion)}
                        >
                          Create Workflow <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Optimal Agent Pairings */}
              {agentPairings.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Optimal Agent Pairings ({agentPairings.length})
                  </h3>
                  <div className="space-y-3">
                    {agentPairings.map((pairing, idx) => (
                      <Card key={idx} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500/20 text-blue-400">{pairing.agent1_type}</Badge>
                                <span className="text-white">+</span>
                                <Badge className="bg-purple-500/20 text-purple-400">{pairing.agent2_type}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">{pairing.synergy_score}%</div>
                              <div className="text-xs text-gray-500">Synergy</div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <Progress value={pairing.historical_success_rate || 0} className="mb-1" />
                            <div className="text-xs text-gray-400">
                              {pairing.historical_success_rate}% Success Rate
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-2">Best For:</div>
                            <div className="flex flex-wrap gap-2">
                              {pairing.best_for_tasks?.map((task, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {task}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}