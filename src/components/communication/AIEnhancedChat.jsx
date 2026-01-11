import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Volume2, Sparkles, Send, Bot } from 'lucide-react';

export default function AIEnhancedChat({ conversationId, userEmail }) {
  const [message, setMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationId ? base44.entities.AIConversation.get(conversationId) : null,
    enabled: !!conversationId
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/ai-enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
          generateVoice: voiceEnabled
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    }
  });

  const messages = conversation?.messages || [];

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI-Enhanced Chat</h3>
            <p className="text-white/60 text-xs">Powered by Gemini + ElevenLabs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className={`w-4 h-4 ${voiceEnabled ? 'text-blue-400' : 'text-white/40'}`} />
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-black/20 rounded-lg">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${msg.sender === userEmail ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender !== userEmail && (
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className="max-w-[70%] space-y-2">
                <div className={`p-3 rounded-lg ${msg.sender === userEmail ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                  <p className="text-white text-sm">{msg.content}</p>
                  {msg.aiEnhanced && (
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">AI Enhanced</span>
                    </div>
                  )}
                  {msg.sentiment && (
                    <span className="text-white/40 text-xs mt-1 block">
                      Sentiment: {msg.sentiment}
                    </span>
                  )}
                </div>
                {msg.audioUrl && (
                  <audio controls className="w-full max-w-xs" src={msg.audioUrl} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !sendMessage.isPending && sendMessage.mutate()}
          placeholder="Type your message..."
          className="bg-white/5 border-white/10"
        />
        <Button
          onClick={() => sendMessage.mutate()}
          disabled={!message.trim() || sendMessage.isPending}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {sendMessage.isPending ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}