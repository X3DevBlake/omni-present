import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const sendMessage = useMutation({
    mutationFn: async (msg) => {
      const response = await fetch('/api/functions/gemini-personal-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: {
            currentPage: location.pathname,
            timestamp: new Date().toISOString()
          },
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages([...messages, 
        { role: 'user', text: message },
        { role: 'assistant', text: data.response.message, actions: data.response.suggested_actions, tips: data.response.tips }
      ]);
      setMessage('');
    }
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-96"
          >
            <Card className="bg-black/95 backdrop-blur-xl border-cyan-500/50 shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Gemini Assistant</h3>
                    <p className="text-white/60 text-xs">Always here to help</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">Hi! I'm Gemini</p>
                    <p className="text-white/60 text-sm">Ask me anything about the platform</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}
                  >
                    <div className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/20 border border-cyan-500/50' 
                        : 'bg-purple-500/20 border border-purple-500/50'
                    }`}>
                      <p className="text-white text-sm">{msg.text}</p>
                      
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.actions.map((action, j) => (
                            <button
                              key={j}
                              onClick={() => action.path && navigate(action.path)}
                              className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center justify-between text-xs text-white"
                            >
                              <span>{action.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.tips && msg.tips.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.tips.map((tip, j) => (
                            <p key={j} className="text-xs text-cyan-300 flex items-start gap-1">
                              <Zap className="w-3 h-3 mt-0.5" />
                              {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {sendMessage.isPending && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Gemini is thinking...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask Gemini..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessage.isPending}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}