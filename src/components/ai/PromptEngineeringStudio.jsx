import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function PromptEngineeringStudio() {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given this AI prompt: "${prompt}", suggest 3 improved versions that are more specific, clear, and effective. Return as JSON array with field 'suggestion'.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "object", properties: { suggestion: { type: "string" } } }
            }
          }
        }
      });
      setSuggestions(response.suggestions || []);
    } catch (err) {
      console.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Wand2 className="w-6 h-6 text-violet-400" />
        Prompt Engineering Studio
      </h3>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your AI prompt..."
        className="bg-white/10 border-white/20 text-white placeholder-white/40 mb-4 h-32"
      />

      <Button 
        onClick={generateSuggestions} 
        disabled={loading}
        className="w-full mb-6 bg-gradient-to-r from-violet-500 to-fuchsia-500"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Optimizing...' : 'Optimize Prompt'}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-2">Optimized Suggestions</h4>
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/20 rounded-lg p-4"
            >
              <div className="text-white text-sm mb-2">{s.suggestion}</div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(s.suggestion);
                }}
                size="sm"
                variant="ghost"
                className="text-violet-400"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}