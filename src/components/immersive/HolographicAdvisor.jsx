import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, MessageCircle, TrendingUp, AlertCircle } from 'lucide-react';

export default function HolographicAdvisor() {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'advisor', text: 'Your portfolio needs rebalancing. Would you like recommendations?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { type: 'user', text: input }]);
      setInput('');
      // Simulate advisor response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'advisor',
          text: 'Based on your risk profile, I recommend shifting 15% to stable assets and 10% to growth opportunities.'
        }]);
      }, 500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-24 right-0 w-96 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Hologram Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-white font-bold">Omni Financial Advisor</h3>
              </div>
              <p className="text-white/60 text-sm">AI-powered holographic assistant</p>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-400/30 text-white'
                        : 'bg-purple-500/20 border border-purple-400/30 text-white/80'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-white/10 p-3 grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 transition-all border border-white/10"
              >
                <TrendingUp className="w-3 h-3" />
                Rebalance
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 transition-all border border-white/10"
              >
                <AlertCircle className="w-3 h-3" />
                Alerts
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 transition-all border border-white/10"
              >
                <MessageCircle className="w-3 h-3" />
                Chat
              </motion.button>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-lg text-white transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <MessageCircle className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsActive(!isActive)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-2xl shadow-cyan-500/50 flex items-center justify-center text-white border border-white/20 hover:border-white/50 transition-all hover:shadow-cyan-500/70"
      >
        <motion.div
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          <Wand2 className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}