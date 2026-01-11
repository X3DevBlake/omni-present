import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Bot, User } from 'lucide-react';

export default function GeminiChatInterface({ userEmail }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const { data: interactions } = useQuery({
    queryKey: ['geminiInteractions', userEmail],
    queryFn: () => base44.entities.GeminiInteraction.filter({ user_email: userEmail, autonomous: false }),
    initialData: []
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/invoke-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });

      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      setChatHistory([...chatHistory, { role: 'user', content: message }, { role: 'assistant', content: data.response }]);
      setMessage('');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Gemini Chat</h3>
          <p className="text-white/60 text-sm">Ask anything</p>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto space-y-4 mb-4 p-4 bg-black/20 rounded-lg">
        {chatHistory.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
              <p className="text-white text-sm">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Gemini anything..."
          className="bg-white/5 border-white/10 resize-none"
          rows={3}
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