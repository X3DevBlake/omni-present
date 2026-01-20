import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, MessageSquare, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function AIContextualAssistant({ currentPage, userActivity }) {
  const [isVisible, setIsVisible] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage && userActivity) {
      generateContextualHelp();
    }
  }, [currentPage, userActivity]);

  const generateContextualHelp = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User is on the ${currentPage} page. Recent activity: ${JSON.stringify(userActivity?.slice(0, 3))}. Provide 3 brief, actionable suggestions to help them be more productive. Format as JSON array with {action, benefit} objects.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
    setLoading(false);
  };

  if (!isVisible) {
    return (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-14 h-14 shadow-2xl"
        onClick={() => setIsVisible(true)}
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-96"
      >
        <Card className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-400/50 backdrop-blur-md shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h4 className="text-white font-semibold">AI Assistant</h4>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white/60 hover:text-white"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="text-white/60 text-sm">Analyzing your context...</div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-medium">{suggestion.action}</p>
                        <p className="text-white/60 text-xs mt-1">{suggestion.benefit}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-4 text-white/70 hover:text-white hover:bg-white/10"
              onClick={generateContextualHelp}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Refresh Suggestions
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}