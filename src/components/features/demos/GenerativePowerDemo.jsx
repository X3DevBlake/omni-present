import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GenerativePowerDemo({ color }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a creative content generator. Based on this input: "${input}", create engaging, creative content. Be detailed and imaginative.`,
      });
      setOutput(result);
    } catch (error) {
      setOutput('Error generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-white font-medium mb-2 block">Your Idea</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="min-h-[200px] bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={generateContent}
            disabled={loading || !input.trim()}
            className="w-full mt-4"
            style={{ background: color }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        <div>
          <label className="text-white font-medium mb-2 block">AI-Generated Output</label>
          {loading ? (
            <div className="h-[200px] bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : output ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[200px] bg-black/40 border rounded-lg p-6 text-white/90 whitespace-pre-wrap"
              style={{ borderColor: `${color}40` }}
            >
              {output}
            </motion.div>
          ) : (
            <div className="h-[200px] bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/40">
              Generated content will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}