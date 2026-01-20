import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link, useLocation } from 'react-router-dom';

export default function AdaptiveNavigationAI() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const page = location.pathname.split('/').pop() || 'Home';
    setCurrentPage(page);
  }, [location]);

  const { data: aiNavData } = useQuery({
    queryKey: ['ai-navigation', currentPage],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeNavigationIntelligence', {
        current_page: currentPage
      });
      return response.data;
    },
    enabled: !!currentPage,
    refetchInterval: 30000
  });

  const predictions = aiNavData?.predictions || [];
  const segments = aiNavData?.segments || [];

  if (predictions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-40 w-80"
    >
      <Card className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-indigo-400/50 backdrop-blur-md shadow-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h4 className="text-white font-semibold">AI Navigator</h4>
            {segments.length > 0 && (
              <div className="ml-auto text-xs text-white/60">
                {segments[0]}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {predictions.slice(0, 3).map((pred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(pred.page_name)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-white hover:bg-white/10 h-auto py-3 px-3"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-3 h-3 text-cyan-400" />
                        {pred.page_name?.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs text-white/50 mt-1">{pred.reason}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-xs text-cyan-400 font-semibold">
                        {(pred.probability * 100).toFixed(0)}%
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-white/40 text-center">
            AI-powered based on your usage patterns
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}