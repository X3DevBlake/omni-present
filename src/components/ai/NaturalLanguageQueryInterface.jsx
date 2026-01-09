import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, Database } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NaturalLanguageQueryInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([
    "What's the highest performing asset this week?",
    "Show me agents with >80% success rate",
    "Compare market sentiment trends across crypto assets"
  ]);

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setQueryHistory(prev => [query, ...prev.slice(0, 4)]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User asked: "${query}". Generate a detailed, structured response with insights and visualizable data points. Format as JSON with sections for summary, data points, and insights.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            dataPoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  value: { type: 'number' },
                  unit: { type: 'string' }
                }
              }
            },
            insights: {
              type: 'array',
              items: { type: 'string' }
            },
            recommendation: { type: 'string' }
          }
        }
      });

      setResults(prev => [{
        id: Date.now(),
        query: query,
        timestamp: new Date().toLocaleTimeString(),
        data: response
      }, ...prev]);

      setQuery('');
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Query Input */}
      <div className="lg:col-span-2 space-y-6">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Natural Language Query Engine
          </h3>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.ctrlKey && e.key === 'Enter' && executeQuery()}
            placeholder="Ask anything about your data, agents, or market trends... (Ctrl+Enter to search)"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none h-24 mb-4"
          />

          <button
            onClick={executeQuery}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Processing...' : 'Execute Query'}
          </button>
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {results.map((result, idx) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6"
              >
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-1">{result.query}</h4>
                  <p className="text-xs text-white/50">{result.timestamp}</p>
                </div>

                {result.data && (
                  <div className="space-y-4">
                    {/* Summary */}
                    {result.data.summary && (
                      <div>
                        <h5 className="text-cyan-400 font-semibold text-sm mb-2">Summary</h5>
                        <p className="text-white/70 text-sm">{result.data.summary}</p>
                      </div>
                    )}

                    {/* Data Points */}
                    {result.data.dataPoints && result.data.dataPoints.length > 0 && (
                      <div>
                        <h5 className="text-cyan-400 font-semibold text-sm mb-2">Data Points</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {result.data.dataPoints.map((point, i) => (
                            <div key={i} className="bg-black/30 rounded p-2">
                              <div className="text-xs text-white/60">{point.label}</div>
                              <div className="text-lg font-bold text-cyan-400">
                                {point.value}{point.unit ? ` ${point.unit}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {result.data.insights && result.data.insights.length > 0 && (
                      <div>
                        <h5 className="text-cyan-400 font-semibold text-sm mb-2">Insights</h5>
                        <ul className="space-y-1">
                          {result.data.insights.map((insight, i) => (
                            <li key={i} className="text-xs text-white/70 flex gap-2">
                              <TrendingUp className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    {result.data.recommendation && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-3">
                        <h5 className="text-cyan-400 font-semibold text-sm mb-1">Recommendation</h5>
                        <p className="text-white/70 text-sm">{result.data.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Query Suggestions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 h-fit"
      >
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Quick Queries
        </h3>

        <div className="space-y-2">
          {queryHistory.map((hist, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setQuery(hist);
                setTimeout(() => executeQuery(), 100);
              }}
              whileHover={{ x: 5 }}
              className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg transition-all text-sm text-white/70 hover:text-white"
            >
              {hist}
            </motion.button>
          ))}
        </div>

        {/* Query Tips */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-white/80 font-semibold text-xs mb-3">Query Tips</h4>
          <ul className="text-xs text-white/50 space-y-2">
            <li>• Use specific metrics (ROI, performance, volume)</li>
            <li>• Mention time periods (this week, last month)</li>
            <li>• Ask for comparisons and rankings</li>
            <li>• Request predictions and trends</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}