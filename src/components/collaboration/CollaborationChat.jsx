import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborationChat({ groupId, taskId, title }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = base44.entities.CollaborationTask?.subscribe?.((event) => {
      if ((event.data?.working_group_id === groupId || event.data?.id === taskId)) {
        // Reload messages on task updates
        loadMessages();
      }
    });
    return () => unsubscribe?.();
  }, [groupId, taskId]);

  const loadMessages = async () => {
    try {
      const chats = await base44.entities.CollaborationChat?.list?.() || [];
      const filtered = chats.filter(c => 
        (c.group_id === groupId || c.task_id === taskId)
      );
      setMessages(filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupId, taskId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      await base44.entities.CollaborationChat?.create?.({
        group_id: groupId,
        task_id: taskId,
        content: input,
        message_type: 'user'
      });
      setInput('');
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.created_by ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.created_by
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="bg-slate-800 border-slate-600 text-white"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}