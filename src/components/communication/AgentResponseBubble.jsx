import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

export default function AgentResponseBubble({ message, delay }) {
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: message.isUser ? 20 : -20 }}
      transition={{ delay }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-xl flex items-start gap-2 ${
          message.isUser
            ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
            : 'bg-purple-500/30 border border-purple-500/50 text-purple-100'
        }`}
      >
        <div className="flex-1">
          <p className="text-xs font-semibold opacity-70">{message.sender}</p>
          <p className="text-sm mt-1">{message.text}</p>
          <p className="text-xs opacity-50 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {!message.isUser && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleSpeak}
            className="mt-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-all"
          >
            <Volume2 className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}