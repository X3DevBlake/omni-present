import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, AlertCircle, CheckCircle, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICodeReviewAssistant({ blueprint, onApplyFix }) {
  const [isOpen, setIsOpen] = useState(false);
  const [review, setReview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (blueprint && isOpen) {
      analyzeCode();
    }
  }, [blueprint, isOpen]);

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Perform comprehensive code review for blueprint.
          
          Blueprint: ${JSON.stringify(blueprint)}
          
          Analyze:
          1. CODE QUALITY: Maintainability, readability, complexity
          2. BUGS: Potential bugs, edge cases, error handling
          3. PERFORMANCE: Optimization opportunities, bottlenecks
          4. SECURITY: Vulnerabilities, best practices
          5. STANDARDS: Coding standards compliance
          
          Provide:
          - Severity (critical/high/medium/low)
          - Specific line/component
          - Issue description
          - Fix suggestion with code
          - Auto-fix eligibility
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            overallScore: { type: 'number' },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  category: { type: 'string' },
                  location: { type: 'string' },
                  description: { type: 'string' },
                  fixSuggestion: { type: 'string' },
                  autoFixAvailable: { type: 'boolean' }
                }
              }
            },
            suggestions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setReview(result);
    } catch (error) {
      console.error('Code review failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-36 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/40"
        whileHover={{ scale: 1.05 }}
      >
        <Code className="w-6 h-6 text-cyan-400" />
        {review?.issues?.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {review.issues.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-6 top-24 bottom-24 z-40 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">Code Review</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isAnalyzing ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <div className="text-white/70 text-sm">Analyzing code...</div>
                </div>
              ) : review ? (
                <>
                  <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <div className="text-white/60 text-xs mb-1">Overall Score</div>
                    <div className="text-2xl font-bold text-cyan-400">{review.overallScore}/100</div>
                  </div>

                  <div className="space-y-3">
                    {review.issues?.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                          issue.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                          issue.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-blue-500/10 border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-white/60 text-xs">{issue.category}</span>
                        </div>
                        <div className="text-white text-sm mb-1">{issue.location}</div>
                        <div className="text-white/70 text-xs mb-2">{issue.description}</div>
                        <div className="p-2 rounded bg-black/30 text-cyan-400 text-xs mb-2">
                          {issue.fixSuggestion}
                        </div>
                        {issue.autoFixAvailable && (
                          <button
                            onClick={() => {
                              onApplyFix?.(issue);
                              toast.success('Fix applied');
                            }}
                            className="w-full py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs"
                          >
                            Apply Auto-Fix
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {review.suggestions?.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="text-purple-400 text-sm mb-2">💡 Suggestions</div>
                      {review.suggestions.map((suggestion, i) => (
                        <div key={i} className="text-white/70 text-xs mb-1">• {suggestion}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <div className="text-white/50 text-sm">No blueprint to review</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}