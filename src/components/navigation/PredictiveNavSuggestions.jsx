import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function PredictiveNavSuggestions({ predictions = [] }) {
  if (predictions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="fixed right-6 top-24 z-40 w-80"
      >
        <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-400/30 backdrop-blur-md shadow-2xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-white mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold">Suggested Next Steps</h4>
            </div>
            
            {predictions.slice(0, 3).map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(pred.page_name)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-white hover:bg-white/10 h-auto py-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{pred.page_name?.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-xs text-white/60">{pred.reason}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-cyan-400">{(pred.probability * 100).toFixed(0)}%</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}