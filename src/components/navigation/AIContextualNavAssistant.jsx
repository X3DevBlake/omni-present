import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function AIContextualNavAssistant() {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const currentPage = location.pathname.split('/').pop() || 'Home';

    const { data: suggestions = [] } = useQuery({
        queryKey: ['ai-nav-assistant', currentPage],
        queryFn: async () => {
            const response = await base44.functions.invoke('getAdaptiveNavSuggestions', {
                current_page: currentPage
            });
            return response.data.suggestions || [];
        },
        refetchInterval: 45000,
        enabled: !dismissed
    });

    useEffect(() => {
        if (suggestions.length > 0 && !dismissed) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [suggestions, dismissed]);

    if (!isVisible || suggestions.length === 0 || dismissed) return null;

    const topSuggestion = suggestions[0];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-24 left-6 z-50 w-80"
            >
                <div className="bg-gradient-to-br from-purple-900/95 via-cyan-900/95 to-blue-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-500/20 rounded-full p-2">
                                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                            </div>
                            <span className="text-sm font-semibold text-white">
                                Omega Navigation AI
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setDismissed(true);
                                setIsVisible(false);
                            }}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-slate-300 mb-1">Suggested next destination:</p>
                            <h4 className="text-white font-bold text-base mb-2">
                                {topSuggestion.page_name}
                            </h4>
                            <p className="text-xs text-slate-400 mb-3">
                                {topSuggestion.reason}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${topSuggestion.probability * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                />
                            </div>
                            <span className="text-xs text-cyan-400 font-semibold">
                                {(topSuggestion.probability * 100).toFixed(0)}%
                            </span>
                        </div>

                        <Button
                            onClick={() => window.location.href = createPageUrl(topSuggestion.page_name)}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                            size="sm"
                        >
                            Navigate
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                        <div className="text-xs text-slate-500 text-center">
                            Optimal timing: {topSuggestion.optimal_timing}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}