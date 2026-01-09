import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ContextKnowledgeRetrieval({ context, onArticleClick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (context) {
      fetchRelevantKnowledge();
    }
  }, [context]);

  const fetchRelevantKnowledge = async () => {
    setLoading(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this context: "${context}", suggest 2-3 highly relevant knowledge articles from the AI knowledge graph. Focus on actionable insights.`,
      response_json_schema: {
        type: 'object',
        properties: {
          articles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                summary: { type: 'string' },
                relevance: { type: 'number' }
              }
            }
          }
        }
      }
    });
    setSuggestions(response.articles);
    setLoading(false);
  };

  if (!suggestions.length && !loading) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-purple-400 font-semibold text-xs">Knowledge Suggestions</span>
      </div>
      {loading ? (
        <p className="text-white/60 text-xs">Analyzing context...</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onArticleClick?.(article)}
              className="p-2 bg-black/20 rounded cursor-pointer hover:bg-black/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <BookOpen className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-xs mb-1">{article.title}</p>
                  <p className="text-white/60 text-xs line-clamp-2">{article.summary}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          i < article.relevance * 5 ? 'bg-green-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}