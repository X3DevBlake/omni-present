import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

export default function PredictiveNavigationSuggestions() {
    const location = useLocation();
    const currentPage = location.pathname.split('/').pop() || 'Home';

    const { data: suggestions = [] } = useQuery({
        queryKey: ['nav-suggestions', currentPage],
        queryFn: async () => {
            const response = await base44.functions.invoke('getAdaptiveNavSuggestions', {
                current_page: currentPage
            });
            return response.data.suggestions || [];
        },
        refetchInterval: 60000,
        enabled: true
    });

    if (!suggestions || suggestions.length === 0) return null;

    return (
        <Card className="fixed bottom-6 right-6 z-40 w-80 bg-black/90 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">AI Navigation Suggestions</span>
                </div>
                <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                        <Link key={index} to={createPageUrl(suggestion.page_name)}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-800/50 p-3 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <span className="text-xs font-semibold text-white">
                                        {suggestion.page_name}
                                    </span>
                                    <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                                        {(suggestion.probability * 100).toFixed(0)}%
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-400 mb-2">
                                    {suggestion.reason}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {suggestion.optimal_timing}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}