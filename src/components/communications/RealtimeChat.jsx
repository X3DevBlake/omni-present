import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';

export default function RealtimeChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Agent-1', content: 'Market analysis complete. Bullish signals detected.', timestamp: '14:32:15', type: 'agent' },
    { id: 2, sender: 'You', content: 'What about the risk factors?', timestamp: '14:32:45', type: 'user' },
    { id: 3, sender: 'Agent-2', content: 'Risk assessment: High volatility in tech sector. Recommend hedging.', timestamp: '14:33:10', type: 'agent' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          content: input,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          type: 'user',
        },
      ]);
      setInput('');

      // Simulate agent response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'Agent-3',
            content: 'Processing your request. Analyzing market conditions...',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
            type: 'agent',
          },
        ]);
      }, 1000);
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.type === 'user'
                    ? 'bg-cyan-600/30 border border-cyan-500/50'
                    : 'bg-purple-600/30 border border-purple-500/50'
                }`}
              >
                <p className="text-white/60 text-xs mb-1 font-semibold">{msg.sender}</p>
                <p className="text-white text-sm">{msg.content}</p>
                <p className="text-white/40 text-xs mt-1">{msg.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500"
          />
          <Button onClick={handleSendMessage} className="bg-cyan-600 hover:bg-cyan-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}