import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, MessageSquare, Workflow, Bot, Zap, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';

export default function VertexAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createAgentMutation = useMutation({
    mutationFn: (agentData) => base44.entities.Agent.create(agentData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (workflowData) => base44.entities.TeamOrchestration.create(workflowData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const createWebhookMutation = useMutation({
    mutationFn: (webhookData) => base44.entities.WebhookConfiguration.create(webhookData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const executeAction = async (action) => {
    setIsLoading(true);
    try {
      if (action.type === 'create_agent') {
        const agent = await createAgentMutation.mutateAsync(action.data);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Created trading agent "${action.data.name}"! Click below to view it.`,
          action: { type: 'navigate', url: createPageUrl('AgentDetail') + `?id=${agent.id}`, label: 'View Agent' }
        }]);
      } else if (action.type === 'create_workflow') {
        const workflow = await createWorkflowMutation.mutateAsync(action.data);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Created workflow "${action.data.name}"! Click below to configure it.`,
          action: { type: 'navigate', url: createPageUrl('TeamOrchestration'), label: 'View Workflow' }
        }]);
      } else if (action.type === 'create_webhook') {
        await createWebhookMutation.mutateAsync(action.data);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Created webhook integration! Your automation is ready.`,
          action: { type: 'navigate', url: createPageUrl('AdvancedWebhooks'), label: 'Manage Webhooks' }
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to execute action. Please try again or provide more details.'
      }]);
    } finally {
      setIsLoading(false);
      setSuggestedActions([]);
    }
  };

  const sendToVertexAI = async (userMessage) => {
    setIsLoading(true);
    
    try {
      const systemPrompt = `You are Omni's AI Copilot - a workflow automation assistant that helps users:
1. Build automation workflows (webhooks, triggers, actions)
2. Create and configure AI agents (trading agents, monitoring agents, etc.)
3. Set up team orchestration flows
4. Discover automation opportunities
5. Work with Canvas, Tables, and other Omni products

Analyze the user's request and determine if they want to:
- Create a trading agent
- Build an automation workflow
- Set up webhooks
- Configure team orchestration
- Get suggestions for automations

Respond conversationally and offer to create the automation. If creating something, provide a JSON schema with the action.

User request: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            intent: { 
              type: 'string', 
              enum: ['create_agent', 'create_workflow', 'create_webhook', 'suggest', 'chat', 'clarify']
            },
            suggested_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  type: { type: 'string' },
                  data: { type: 'object' }
                }
              }
            }
          }
        }
      });

      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.message }
      ]);

      if (response.suggested_actions && response.suggested_actions.length > 0) {
        setSuggestedActions(response.suggested_actions);
      }
    } catch (error) {
      // Fallback to simple response
      const fallbackResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Omni's AI Copilot for workflow automation. Help the user with: ${userMessage}`,
      });
      
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: fallbackResponse }
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendToVertexAI(input);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? {} : { 
          boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(168, 85, 247, 0.6)', '0 0 20px rgba(168, 85, 247, 0.4)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Zap className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-black/90 backdrop-blur-xl border-purple-500/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">Omni Copilot</h3>
                    <p className="text-white/60 text-xs">Build automations with AI</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Beta</Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <Workflow className="w-16 h-16 text-purple-400/50" />
                    <div>
                      <p className="text-white font-semibold mb-2">Build Anything with AI</p>
                      <p className="text-white/60 text-xs mb-4">
                        Try saying:<br />
                        "Create a trading agent"<br />
                        "Build a workflow to save emails to Drive"<br />
                        "Set up alerts when stock price changes"
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-purple-500/30 text-white/80 hover:bg-white/10"
                        onClick={() => setInput("Create a trading agent that monitors crypto prices")}
                      >
                        <Bot className="w-3 h-3 mr-1" />
                        Trading Agent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-purple-500/30 text-white/80 hover:bg-white/10"
                        onClick={() => setInput("Build a workflow to automate my daily reports")}
                      >
                        <Workflow className="w-3 h-3 mr-1" />
                        Automation
                      </Button>
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white/90'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.action && (
                      <Button
                        size="sm"
                        className="mt-2 bg-purple-500 hover:bg-purple-600"
                        onClick={() => navigate(msg.action.url)}
                      >
                        {msg.action.label}
                      </Button>
                    )}
                  </motion.div>
                ))}

                {suggestedActions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-white/60 text-xs">Suggested actions:</p>
                    {suggestedActions.map((action, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        className="bg-purple-500/10 border-purple-500/30 text-white hover:bg-purple-500/20 justify-start"
                        onClick={() => executeAction(action)}
                      >
                        <Check className="w-3 h-3 mr-2" />
                        {action.label}
                      </Button>
                    ))}
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 rounded-lg p-3">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t border-purple-500/30 p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Vertex AI..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}