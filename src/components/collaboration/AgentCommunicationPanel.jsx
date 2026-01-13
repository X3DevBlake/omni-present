import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, AlertCircle, CheckCircle, 
  Users, ArrowRight, Sparkles, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AgentCommunicationPanel({ workspaceId }) {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-collab'],
    queryFn: () => base44.entities.Agent.list('-created_date', 50)
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['agent-communications', workspaceId],
    queryFn: () => base44.entities.AgentCommunication.filter(
      { workspace_id: workspaceId },
      '-created_date',
      50
    ),
    refetchInterval: 3000,
    enabled: !!workspaceId
  });

  const { data: helpRequests = [] } = useQuery({
    queryKey: ['help-requests', workspaceId],
    queryFn: () => base44.entities.AgentCollaboration.filter(
      { status: 'help_requested' },
      '-created_date',
      20
    ),
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ fromAgent, toAgent, content, messageType }) => {
      return base44.entities.AgentCommunication.create({
        workspace_id: workspaceId,
        from_agent_id: fromAgent,
        to_agent_id: toAgent,
        message_content: content,
        message_type: messageType,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-communications']);
      setMessage('');
      toast.success('Message sent!');
    }
  });

  const requestHelpMutation = useMutation({
    mutationFn: async ({ requestingAgent, taskContext }) => {
      // AI suggests relevant agents
      const suggestion = await base44.integrations.Core.InvokeLLM({
        prompt: `Given task context: "${taskContext}", suggest the best agent from this list to help: ${JSON.stringify(agents.map(a => ({ id: a.id, name: a.agent_name, capabilities: a.capabilities })))}`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_agent_id: { type: 'string' },
            reason: { type: 'string' },
            confidence: { type: 'number' }
          }
        }
      });

      return base44.entities.AgentCollaboration.create({
        requesting_agent_id: requestingAgent,
        suggested_agent_id: suggestion.suggested_agent_id,
        task_description: taskContext,
        status: 'help_requested',
        ai_suggestion_reason: suggestion.reason,
        confidence_score: suggestion.confidence
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['help-requests']);
      toast.success('Help request sent with AI suggestion!');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedAgent) {
      toast.error('Please select an agent and enter a message');
      return;
    }

    sendMessageMutation.mutate({
      fromAgent: agents[0]?.id,
      toAgent: selectedAgent.id,
      content: message,
      messageType: 'direct'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Message Stream */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              Real-Time Communication Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {communications.map((comm, idx) => (
                  <motion.div
                    key={comm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-cyan-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">
                            {agents.find(a => a.id === comm.from_agent_id)?.agent_name || 'Agent'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white/40" />
                          <span className="text-white/60">
                            {agents.find(a => a.id === comm.to_agent_id)?.agent_name || 'Agent'}
                          </span>
                          <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">
                            {comm.status}
                          </Badge>
                        </div>
                        <p className="text-white/80 text-sm">{comm.message_content}</p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(comm.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {communications.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No communications yet</p>
                </div>
              )}
            </div>

            {/* Send Message */}
            <div className="mt-4 space-y-3">
              <select
                value={selectedAgent?.id || ''}
                onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="">Select recipient agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.agent_name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Requests & AI Suggestions */}
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Help Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {helpRequests.map(request => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm font-medium">
                    {agents.find(a => a.id === request.requesting_agent_id)?.agent_name}
                  </span>
                </div>
                <p className="text-xs text-white/70 mb-2">{request.task_description}</p>
                {request.suggested_agent_id && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <div className="flex-1">
                      <p className="text-xs text-white/80">
                        AI suggests: <span className="font-medium">
                          {agents.find(a => a.id === request.suggested_agent_id)?.agent_name}
                        </span>
                      </p>
                      <p className="text-xs text-white/50">{request.ai_suggestion_reason}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {helpRequests.length === 0 && (
              <div className="text-center py-6 text-white/40">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-xs">No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={() => {
            const context = prompt('Describe the task you need help with:');
            if (context) {
              requestHelpMutation.mutate({
                requestingAgent: agents[0]?.id,
                taskContext: context
              });
            }
          }}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          <Users className="w-4 h-4 mr-2" />
          Request Help
        </Button>
      </div>
    </div>
  );
}