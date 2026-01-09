import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Volume2 } from 'lucide-react';

export default function ChatMessages({ 
  messages, 
  isTyping, 
  isSpeaking,
  input, 
  setInput, 
  onSendMessage,
  isVoiceEnabled 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickActions = [
    { label: 'Create an agent', question: 'How do I create an AI agent?' },
    { label: 'DeFi pools', question: 'Tell me about the liquidity pools' },
    { label: 'Device setup', question: 'How do I set up a physical device?' },
    { label: 'Agent learning', question: 'How do agents learn and build knowledge?' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {isSpeaking && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="text-pink-400 text-sm">Speaking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="text-white/60 text-xs mb-2">Quick actions:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(action.question)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white hover:bg-white/10 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage(input)}
            placeholder={isVoiceEnabled ? "Voice input active..." : "Ask me anything..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-500/40"
            disabled={isVoiceEnabled}
          />
          <button
            onClick={() => onSendMessage(input)}
            disabled={!input.trim() || isTyping || isVoiceEnabled}
            className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}