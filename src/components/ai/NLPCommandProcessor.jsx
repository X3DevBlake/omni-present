import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NLPCommandProcessor() {
  const [commands, setCommands] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const processCommand = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse this command and extract intent, entities, and suggested action: "${input}"
        Return JSON with {intent, entities: {}, action, confidence: 0-100}`,
        response_json_schema: {
          type: 'object',
          properties: {
            intent: { type: 'string' },
            entities: { type: 'object' },
            action: { type: 'string' },
            confidence: { type: 'number' }
          }
        }
      });

      setCommands(prev => [{
        id: Date.now(),
        input,
        result,
        status: 'processed',
        timestamp: new Date()
      }, ...prev]);

      setInput('');
      toast.success('Command processed successfully');
    } catch (err) {
      toast.error('NLP processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Brain className="w-5 h-5 text-cyan-400" />
        Natural Language Command Processor
      </h3>

      <div className="space-y-3">
        <textarea
          placeholder="Describe what you want agents to do in natural language... e.g., 'Increase BTC position when volatility drops below 20%'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && processCommand()}
          className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/40 h-24 resize-none"
        />
        <motion.button
          onClick={processCommand}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          className="w-full py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Process Command'}
        </motion.button>
      </div>

      {commands.length > 0 && (
        <div className="border-t border-white/10 pt-4 space-y-2">
          <p className="text-white/70 text-sm font-bold">Processed Commands ({commands.length})</p>
          {commands.slice(0, 5).map(cmd => (
            <motion.div
              key={cmd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-cyan-500/20 rounded p-3 text-xs space-y-2"
            >
              <p className="text-white/80"><strong>Input:</strong> {cmd.input}</p>
              <div className="space-y-1 text-white/60">
                <p><strong>Intent:</strong> {cmd.result?.intent}</p>
                <p><strong>Action:</strong> {cmd.result?.action}</p>
                <p className={cmd.result?.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}>
                  <strong>Confidence:</strong> {cmd.result?.confidence}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}