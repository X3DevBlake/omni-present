import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from './button';

export default function ContextAwareHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [help, setHelp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const getContextualHelp = async () => {
    setLoading(true);
    try {
      const currentPage = location.pathname.split('/').pop() || 'Home';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide helpful, concise guidance for a user currently on the "${currentPage}" page of an AI agent management platform. 
        Include: 
        1. What this page does (2-3 sentences)
        2. Key actions they can take (3-4 bullet points)
        3. One pro tip for power users
        Keep it under 150 words.`,
        add_context_from_internet: false
      });
      setHelp(response);
    } catch (e) {
      setHelp('Unable to load help content at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!help) getContextualHelp();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              className="fixed top-1/2 right-6 transform -translate-y-1/2 w-96 z-50"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-bold">Context Help</h3>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {help}
                  </div>
                )}

                <Button
                  onClick={getContextualHelp}
                  disabled={loading}
                  className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                >
                  Refresh Help
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}