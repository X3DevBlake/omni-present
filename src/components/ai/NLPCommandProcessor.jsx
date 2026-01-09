import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NLPCommandProcessor() {
  const [conversation, setConversation] = useState([
    { role: 'agent', text: 'Hi! I understand complex commands like "rebalance my portfolio when BTC drops 5%" or "send me alerts on large transactions"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const processCommand = async () => {
    if (!input.trim()) return;

    setConversation(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User command: "${input}". Parse and execute this financial command. 
        Understand: portfolio actions, alert settings, conditional trades, spending limits.
        Respond naturally explaining what you understood and what action you'll take.`,
        add_context_from_internet: true
      });

      setConversation(prev => [...prev, { role: 'agent', text: response }]);
      toast.success('Command processed');
    } catch (err) {
      toast.error('Command processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        Natural Language Commands
      </h3>

      <div className="h-48 bg-black/60 rounded-lg p-4 overflow-y-auto space-y-3 text-sm">
        {conversation.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              msg.role === 'user'
                ? 'ml-auto w-fit bg-purple-500/30 text-white rounded-lg rounded-tr-none'
                : 'w-fit bg-white/5 text-white/80 rounded-lg rounded-tl-none'
            } px-4 py-2 max-w-xs`}
          >
            {msg.text}
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-white/60">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Try: 'Sell 50% portfolio if market drops 10%'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && processCommand()}
          disabled={loading}
          className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 disabled:opacity-50"
        />
        <motion.button
          onClick={processCommand}
          disabled={loading || !input.trim()}
          whileHover={{ scale: 1.05 }}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded font-medium text-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}