import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, Bot, User, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentChat({ agents = [] }) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id);
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: chatHistory } = useQuery({
    queryKey: ['agentChat', selectedAgentId],
    queryFn: () => base44.entities.AgentChatMessage.filter({ agent_id: selectedAgentId }, { sort: { timestamp: 1 } }),
    enabled: !!selectedAgentId,
    initialData: []
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ agentId, msg }) => {
      // Optimistic update handled by query invalidation for now
      return base44.functions.invoke('chatWithAgent', { agentId, message: msg });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['agentChat', selectedAgentId]);
      setMessage('');
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim() || !selectedAgentId) return;
    sendMessageMutation.mutate({ agentId: selectedAgentId, msg: message });
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Agent Selector */}
      <div className="lg:col-span-1 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" /> Neural Link
          </h3>
        </div>
        <ScrollArea className="flex-1 p-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-all flex items-center gap-3 ${
                selectedAgentId === agent.id 
                  ? 'bg-purple-600/20 border border-purple-500/50 text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedAgentId === agent.id ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
              <div className="truncate font-medium">{agent.name}</div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col relative">
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a consciousness to initiate link...
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedAgent.name}</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online • Neural Link Stable
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatHistory.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-[10px] opacity-50 block mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {sendMessageMutation.isPending && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </motion.div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Message ${selectedAgent.name}...`}
                  className="bg-black/20 border-white/10 focus:border-purple-500"
                />
                <Button onClick={handleSend} disabled={sendMessageMutation.isPending} className="bg-purple-600 hover:bg-purple-500">
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}