import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lightbulb } from 'lucide-react';

export default function ContextDemo({ color }) {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState([]);

  const contextPatterns = {
    'email': ['Draft email to', 'Schedule meeting with', 'Send reminder about'],
    'meeting': ['Create calendar event', 'Invite attendees', 'Prepare agenda for'],
    'report': ['Generate summary of', 'Analyze data from', 'Export results to'],
    'code': ['Debug function', 'Optimize performance of', 'Add tests for'],
    'design': ['Create mockup for', 'Update branding on', 'Export assets from'],
  };

  const handleInputChange = (value) => {
    setInput(value);
    
    // Simulate context awareness
    const lowercaseValue = value.toLowerCase();
    const matchedPredictions = [];
    
    Object.entries(contextPatterns).forEach(([key, suggestions]) => {
      if (lowercaseValue.includes(key)) {
        matchedPredictions.push(...suggestions.map(s => `${s} ${lowercaseValue}`));
      }
    });

    if (matchedPredictions.length === 0 && value.length > 3) {
      matchedPredictions.push(
        `Search for "${value}"`,
        `Create new document about ${value}`,
        `Find similar to "${value}"`
      );
    }

    setPredictions(matchedPredictions.slice(0, 4));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-6 h-6" style={{ color }} />
        <p className="text-white/80">
          Type naturally - AI understands context and predicts your needs
        </p>
      </div>

      <div className="relative">
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Start typing... (try 'email', 'meeting', 'report')"
          className="bg-white/5 border-white/10 text-white text-lg py-6"
        />
      </div>

      <AnimatePresence>
        {predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" style={{ color }} />
              <span className="text-white/70 text-sm">AI Predictions</span>
            </div>
            {predictions.map((prediction, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                onClick={() => setInput(prediction)}
              >
                <span className="text-white/90">{prediction}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {input && predictions.length === 0 && (
        <div className="text-center text-white/40 py-8">
          Keep typing to see context-aware predictions...
        </div>
      )}
    </div>
  );
}