import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Minimize2, X, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function EnhancedGeminiHome() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Welcome to your AI Lab! I\'m your Gemini Copilot. Ask me anything about your agents, simulations, or insights. What would you like to explore?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (userMessage) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI assistant for an AI Lab platform. Context: The user is on the home page of their AI Lab ecosystem. Be concise, helpful, and proactive in suggesting actions. User message: ${userMessage}`,
        add_context_from_internet: false,
      });
      return response;
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: response,
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: 'I encountered an issue processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    },
  });

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        text: userMessage,
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setLoading(true);
    sendMessage.mutate(userMessage);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 flex items-center justify-center"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 w-96 h-96 bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-white font-semibold text-sm">Gemini Copilot</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                            : 'bg-purple-500/20 border border-purple-500/30 text-white/90'
                        } text-sm`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-cyan-500/20 p-4 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Gemini..."
                    className="flex-1 bg-white/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}