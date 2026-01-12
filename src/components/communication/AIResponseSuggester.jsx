import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Loader, Copy } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIResponseSuggester({ message, onSelectResponse }) {
  const [suggestions, setSuggestions] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generateResponses = async () => {
    setGenerating(true);
    try {
      const responses = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 professional response suggestions for this Slack message:

Message: "${message}"

Provide:
1. A brief/casual response
2. A detailed/professional response  
3. A question/clarifying response

Consider context and tone. Return as JSON array.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  text: { type: 'string' },
                  tone: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSuggestions(responses.suggestions || []);
    } catch (error) {
      console.error('Error generating responses:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Response copied!');
  };

  return (
    <div className="space-y-3">
      <button
        onClick={generateResponses}
        disabled={generating}
        className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded font-semibold hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate AI Responses
          </>
        )}
      </button>

      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 text-xs font-semibold">{suggestion.type}</span>
              <span className="text-white/40 text-xs">{suggestion.tone}</span>
            </div>
            <p className="text-white/80 text-sm mb-2">{suggestion.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectResponse?.(suggestion.text)}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs hover:bg-cyan-500/30"
              >
                Use This
              </button>
              <button
                onClick={() => copyToClipboard(suggestion.text)}
                className="px-3 py-1 bg-white/5 text-white/60 rounded text-xs hover:bg-white/10 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}