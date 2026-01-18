import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Brain, Lightbulb, X, ArrowRight } from 'lucide-react';

export default function ProactiveAIAssistant() {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    try {
      const mockSuggestions = [
        {
          id: 1,
          title: 'Optimize Agent Performance',
          description: 'Agent-Alpha shows 15% performance drop. Consider reallocating resources.',
          action: 'View Details',
          priority: 'high'
        },
        {
          id: 2,
          title: 'New Workflow Opportunity',
          description: 'Based on your recent activities, a new automation workflow could save 2 hours daily.',
          action: 'Create Workflow',
          priority: 'medium'
        },
        {
          id: 3,
          title: 'Knowledge Update Available',
          description: 'New market insights available that match your agent specialties.',
          action: 'Review Updates',
          priority: 'low'
        }
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl hover:shadow-pink-500/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-8 h-8 text-white" />
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-40 w-96"
          >
            <Card className="bg-black/90 border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-bold">AI Assistant</h3>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-white/40 hover:text-white" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {suggestions.map(suggestion => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.priority === 'high' ? 'bg-red-500/10 border-red-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                      'bg-blue-500/10 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm">{suggestion.title}</h4>
                        <p className="text-white/60 text-xs mt-1">{suggestion.description}</p>
                        <button className="mt-3 text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300">
                          {suggestion.action}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={generateSuggestions}
                className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                size="sm"
              >
                Refresh Suggestions
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}