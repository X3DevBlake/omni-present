import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HapticCustomizer({ agentId }) {
  const [patterns, setPatterns] = useState([]);
  const [newPattern, setNewPattern] = useState([{ intensity: 50, duration_ms: 200 }]);

  useEffect(() => {
    loadPatterns();
  }, [agentId]);

  const loadPatterns = async () => {
    const pats = await base44.entities.CustomHapticPattern.list({ agent_id: agentId });
    setPatterns(pats);
  };

  const getSuggestion = async () => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: 'Suggest optimal haptic pattern for button press with satisfying feedback',
      response_json_schema: {
        type: 'object',
        properties: { pattern: { type: 'array' } }
      }
    });
    setNewPattern(result.pattern);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">Haptic Customization</h3>
      
      <button onClick={getSuggestion} className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        AI Suggest Pattern
      </button>

      <div className="space-y-2">
        {patterns.slice(0, 3).map(pattern => (
          <div key={pattern.id} className="bg-white/5 rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold text-sm">{pattern.pattern_name}</p>
                <p className="text-white/60 text-xs">{pattern.use_case}</p>
              </div>
              {pattern.ai_suggested && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">AI</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}