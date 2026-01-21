import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Brain, CheckCircle, XCircle, RefreshCw, Loader2, TrendingUp, Share2 } from 'lucide-react';

export default function AgentFeedbackLearningPanel({ agents = [] }) {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  const { data: feedbackRecords = [] } = useQuery({
    queryKey: ['agent-feedback', selectedAgent?.agent_id],
    queryFn: () => base44.entities.AgentLearningFeedback.filter(
      selectedAgent?.agent_id ? { agent_id: selectedAgent.agent_id } : {}
    ).limit(20),
    initialData: [],
    enabled: !!selectedAgent
  });

  const { data: knowledgeTransfers = [] } = useQuery({
    queryKey: ['knowledge-transfers'],
    queryFn: () => base44.entities.KnowledgeTransfer.list('-created_date', 10),
    initialData: []
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ agent_id, feedback_type, outcome_data, corrections }) => {
      const response = await base44.functions.invoke('process-agent-feedback', {
        agent_id,
        feedback_type,
        outcome_data,
        corrections,
        source: 'user'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Feedback processed! ${data.patterns_learned} patterns learned`);
      queryClient.invalidateQueries(['agent-feedback']);
      queryClient.invalidateQueries(['knowledge-transfers']);
    }
  });

  const handleQuickFeedback = (type, success) => {
    if (!selectedAgent) return;
    submitFeedbackMutation.mutate({
      agent_id: selectedAgent.agent_id || selectedAgent.id,
      feedback_type: type,
      outcome_data: {
        success,
        user_satisfaction: success ? 0.9 : 0.3
      }
    });
  };

  const feedbackStats = {
    total: feedbackRecords.length,
    successful: feedbackRecords.filter(f => f.outcome_data?.success).length,
    patternsLearned: feedbackRecords.reduce((acc, f) => acc + (f.learned_patterns?.length || 0), 0),
    adjustments: feedbackRecords.reduce((acc, f) => acc + (f.behavioral_adjustments?.length || 0), 0)
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            Agent Learning & Feedback System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedAgent?.id || ''}
              onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.agent_id?.slice(0, 12) || `Agent ${agent.id?.slice(0, 8)}`}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <Button
                onClick={() => handleQuickFeedback('task_success', true)}
                disabled={submitFeedbackMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Task Success
              </Button>
              <Button
                onClick={() => handleQuickFeedback('task_failure', false)}
                disabled={submitFeedbackMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" /> Task Failed
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Total Feedback</p>
              <p className="text-white text-xl font-bold">{feedbackStats.total}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Success Rate</p>
              <p className="text-white text-xl font-bold">
                {feedbackStats.total > 0 ? ((feedbackStats.successful / feedbackStats.total) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Patterns Learned</p>
              <p className="text-white text-xl font-bold">{feedbackStats.patternsLearned}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Adjustments Made</p>
              <p className="text-white text-xl font-bold">{feedbackStats.adjustments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="feedback">Feedback History</TabsTrigger>
          <TabsTrigger value="patterns">Learned Patterns</TabsTrigger>
          <TabsTrigger value="transfers">Knowledge Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {feedbackRecords.map((record, idx) => (
                  <div key={record.id || idx} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        record.outcome_data?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }>
                        {record.feedback_type}
                      </Badge>
                      <Badge>{record.source}</Badge>
                    </div>

                    {record.outcome_data && (
                      <div className="flex gap-4 text-sm text-slate-400">
                        {record.outcome_data.completion_time_ms && (
                          <span>Time: {record.outcome_data.completion_time_ms}ms</span>
                        )}
                        {record.outcome_data.accuracy_score && (
                          <span>Accuracy: {(record.outcome_data.accuracy_score * 100).toFixed(0)}%</span>
                        )}
                        {record.outcome_data.user_satisfaction && (
                          <span>Satisfaction: {(record.outcome_data.user_satisfaction * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    )}

                    {record.learned_patterns?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-emerald-400 mb-1">Patterns Learned:</p>
                        <div className="flex flex-wrap gap-1">
                          {record.learned_patterns.slice(0, 3).map((p, i) => (
                            <span key={i} className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">
                              {p.pattern_type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Badge className={
                      record.integration_status === 'integrated' ? 'bg-cyan-500/20 text-cyan-400' :
                      record.integration_status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-700 text-slate-400'
                    } style={{ marginTop: '8px' }}>
                      {record.integration_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Learned Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackRecords.flatMap(r => r.learned_patterns || []).slice(0, 10).map((pattern, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{pattern.pattern_type}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {((pattern.confidence || 0.8) * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{pattern.pattern_description}</p>
                    {pattern.applicable_contexts?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pattern.applicable_contexts.map((ctx, i) => (
                          <span key={i} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">
                            {ctx}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                Knowledge Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {knowledgeTransfers.map((transfer, idx) => (
                  <div key={transfer.id || idx} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">{transfer.source_agent_id?.slice(0, 8)}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-purple-400">{transfer.target_agents?.length} agents</span>
                      </div>
                      <Badge className={
                        transfer.transfer_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        transfer.transfer_status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-slate-700 text-slate-400'
                      }>
                        {transfer.transfer_status}
                      </Badge>
                    </div>
                    <p className="text-white">{transfer.knowledge_type}</p>
                    <p className="text-slate-400 text-sm">{transfer.transfer_method} transfer</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}