import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { suggestWorkflowsFromContext } from '../../functions/orchestration/gemini-orchestrator';

export default function GeminiWorkflowSuggester({ context, onWorkflowCreate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [creating, setCreating] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const workflowSuggestions = await suggestWorkflowsFromContext(context);
      setSuggestions(workflowSuggestions.sort((a, b) => b.score - a.score));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (suggestion) => {
    setCreating(true);
    try {
      const user = await base44.auth.me();
      
      const workflow = await base44.entities.Workflow.create({
        name: suggestion.name,
        description: suggestion.impact,
        user_email: user.email,
        trigger: {
          type: 'manual',
          config: {}
        },
        actions: suggestion.actions.map((action, idx) => ({
          id: `action_${idx}`,
          service: 'zapier',
          type: 'execute',
          config: { description: action }
        })),
        ai_suggested: true,
        enabled: true
      });

      onWorkflowCreate?.(workflow);
      setSelectedSuggestion(null);
      setSuggestions([]);
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generating AI Suggestions...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Get Workflow Suggestions from Gemini
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {suggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all"
                onClick={() => setSelectedSuggestion(idx)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{suggestion.name}</h3>
                    <p className="text-white/60 text-xs">{suggestion.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold text-xs">{suggestion.score}%</p>
                      <p className="text-white/40 text-xs">Relevance</p>
                    </div>
                  </div>
                </div>

                {selectedSuggestion === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-white/10 pt-3 mt-3 space-y-3"
                  >
                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-1">Impact:</p>
                      <p className="text-white/70 text-xs">{suggestion.impact}</p>
                    </div>

                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-2">Actions:</p>
                      <div className="space-y-1">
                        {suggestion.actions.map((action, aIdx) => (
                          <div key={aIdx} className="bg-white/5 rounded p-2">
                            <p className="text-white/70 text-xs">• {action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => createWorkflow(suggestion)}
                      disabled={creating}
                      className="w-full px-3 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded text-xs font-semibold hover:bg-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Create This Workflow
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}