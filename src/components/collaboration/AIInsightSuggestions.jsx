import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIInsightSuggestions({ taskContext, groupContext, onApply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [taskContext, groupContext]);

  const generateSuggestions = async () => {
    if (!taskContext && !groupContext) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateCollaborationSuggestions', {
        taskData: taskContext,
        groupData: groupContext
      });

      setSuggestions(response.data?.suggestions || []);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">
            No suggestions available yet. Select a task to get insights.
          </p>
        )}

        {!loading && suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-600/50 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{suggestion.title}</h4>
                <p className="text-slate-300 text-xs mt-1">{suggestion.description}</p>
              </div>
              {suggestion.type === 'agent' && (
                <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Agent
                </Badge>
              )}
              {suggestion.type === 'insight' && (
                <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Insight
                </Badge>
              )}
            </div>

            {suggestion.details && (
              <p className="text-xs text-slate-400 mb-3">{suggestion.details}</p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => onApply?.(suggestion)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Apply
              </Button>
              {suggestion.confidence && (
                <Badge variant="outline" className="text-xs h-8 flex items-center">
                  {Math.round(suggestion.confidence * 100)}% confident
                </Badge>
              )}
            </div>
          </motion.div>
        ))}

        <Button
          onClick={generateSuggestions}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? 'Generating...' : 'Refresh Suggestions'}
        </Button>
      </CardContent>
    </Card>
  );
}