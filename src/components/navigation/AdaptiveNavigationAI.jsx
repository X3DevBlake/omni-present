import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdaptiveNavigationAI() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [sessionData, setSessionData] = useState({
    previous_pages: [],
    session_duration: 0
  });

  const currentPage = location.pathname.split('/').pop() || 'Home';

  const { data: context } = useQuery({
    queryKey: ['nav-context', currentPage],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyze-navigation-context', {
        current_page: currentPage,
        session_data: sessionData
      });
      return response.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  useEffect(() => {
    setSessionData(prev => ({
      previous_pages: [...prev.previous_pages.slice(-9), currentPage],
      session_duration: prev.session_duration + 0.5
    }));
  }, [currentPage]);

  if (!visible || !context?.suggestions?.length) return null;

  const topSuggestion = context.suggestions[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-6 top-24 z-40 w-80"
      >
        <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border-purple-500/50 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-bold text-sm">AI Suggestion</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setVisible(false)}
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>

            <Link to={createPageUrl(topSuggestion.page)}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    {Math.round(topSuggestion.confidence * 100)}% match
                  </Badge>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white font-medium mb-1">
                  {topSuggestion.page.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-slate-300 text-xs mb-2">
                  {topSuggestion.reason}
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Zap className="w-3 h-3" />
                  <span>Quick access</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </div>
              </motion.div>
            </Link>

            {context.suggestions.length > 1 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-300 mb-2">More suggestions:</p>
                <div className="space-y-2">
                  {context.suggestions.slice(1, 3).map((suggestion, idx) => (
                    <Link key={idx} to={createPageUrl(suggestion.page)}>
                      <div className="flex items-center justify-between text-xs hover:bg-white/5 p-2 rounded">
                        <span className="text-white">
                          {suggestion.page.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {context.current_task && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400">
                  Detected activity: <span className="text-purple-300 font-medium">{context.current_task}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}