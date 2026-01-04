import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, TrendingUp, MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIKnowledgeBase({ userContext, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    generateContextualSuggestions();
  }, [userContext]);

  const generateContextualSuggestions = async () => {
    try {
      const prompt = `
        Based on user activity context, suggest relevant documentation:
        
        Context: ${JSON.stringify(userContext)}
        
        Provide:
        1. Relevant blueprint patterns
        2. Common issues and solutions
        3. Best practices documentation
        4. Popular marketplace templates
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  relevance: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Suggestion generation failed:', error);
    }
  };

  const searchKnowledgeBase = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const prompt = `
        Search knowledge base for: "${query}"
        
        Context: ${JSON.stringify(userContext)}
        
        Provide:
        1. DIRECT ANSWERS: Clear, concise answers to the query
        2. RELEVANT DOCS: Documentation references
        3. CODE EXAMPLES: Practical implementation examples
        4. RELATED BLUEPRINTS: Similar marketplace templates
        5. COMMON ISSUES: Known problems and solutions
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            documentation: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                  url: { type: 'string' }
                }
              }
            },
            codeExamples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  code: { type: 'string' },
                  language: { type: 'string' }
                }
              }
            },
            relatedBlueprints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  popularity: { type: 'number' }
                }
              }
            },
            commonIssues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  issue: { type: 'string' },
                  solution: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setResults(result);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Knowledge Base</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchKnowledgeBase()}
              placeholder="Ask anything about blueprints, AI models, or best practices..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/40"
            />
            <button
              onClick={searchKnowledgeBase}
              disabled={isSearching}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {suggestions.length > 0 && !results && (
          <div className="mb-6">
            <h3 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Suggested for You
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(suggestion.title);
                    searchKnowledgeBase();
                  }}
                  className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 cursor-pointer hover:bg-purple-500/20 transition-all"
                >
                  <div className="text-white font-medium text-sm mb-1">{suggestion.title}</div>
                  <div className="text-white/60 text-xs mb-2">{suggestion.description}</div>
                  <div className="text-purple-400 text-xs">Relevance: {suggestion.relevance}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Answer
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{results.answer}</p>
            </div>

            {results.documentation?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Documentation</h3>
                <div className="space-y-2">
                  {results.documentation.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-white font-medium text-sm mb-1">{doc.title}</div>
                      <div className="text-white/60 text-xs mb-2">{doc.summary}</div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs hover:underline">
                        View documentation →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.codeExamples?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Code Examples</h3>
                <div className="space-y-3">
                  {results.codeExamples.map((example, idx) => (
                    <div key={idx} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                      <div className="px-4 py-2 bg-white/5 text-white/70 text-sm">{example.title}</div>
                      <pre className="p-4 text-xs text-white/80 overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.relatedBlueprints?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Related Blueprints</h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.relatedBlueprints.map((blueprint, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="text-white font-medium text-sm mb-1">{blueprint.name}</div>
                      <div className="text-white/60 text-xs mb-2">{blueprint.description}</div>
                      <div className="text-purple-400 text-xs">
                        ⭐ Popularity: {(blueprint.popularity * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.commonIssues?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Common Issues & Solutions</h3>
                <div className="space-y-2">
                  {results.commonIssues.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="text-yellow-400 font-medium text-sm mb-1">Issue: {item.issue}</div>
                      <div className="text-white/70 text-xs">Solution: {item.solution}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}