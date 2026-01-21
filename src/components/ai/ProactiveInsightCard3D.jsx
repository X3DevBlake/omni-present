import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, X, Check, Clock } from 'lucide-react';

export default function ProactiveInsightCard3D() {
    const queryClient = useQueryClient();
    const [dismissedIds, setDismissedIds] = useState([]);

    const { data: recommendations = [] } = useQuery({
        queryKey: ['proactive-recommendations'],
        queryFn: async () => {
            const response = await base44.functions.invoke('ai/proactiveRecommender', {});
            return response.data.recommendations || [];
        },
        refetchInterval: 30000
    });

    const updateRecommendation = useMutation({
        mutationFn: async ({ recId, response }) => {
            return await base44.entities.RecommendationHistory.update(recId, {
                user_response: response,
                responded_at: new Date().toISOString(),
                effectiveness_score: response === 'accepted' ? 0.9 : 0.3
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proactive-recommendations'] });
        }
    });

    const handleAccept = (rec) => {
        updateRecommendation.mutate({ recId: rec.recommendation_id, response: 'accepted' });
        if (rec.recommendation_content?.action_url) {
            window.location.href = rec.recommendation_content.action_url;
        }
    };

    const handleDismiss = (rec) => {
        setDismissedIds([...dismissedIds, rec.recommendation_id]);
        updateRecommendation.mutate({ recId: rec.recommendation_id, response: 'dismissed' });
    };

    const activeRecs = recommendations.filter(r => 
        r.user_response === 'not_responded' && !dismissedIds.includes(r.recommendation_id)
    );

    return (
        <div className="fixed bottom-4 right-4 w-96 z-50">
            <AnimatePresence>
                {activeRecs.slice(0, 3).map((rec, index) => (
                    <motion.div
                        key={rec.recommendation_id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-3"
                    >
                        <Card className="bg-gradient-to-br from-cyan-900/90 to-purple-900/90 border-cyan-500/50 backdrop-blur-lg shadow-2xl">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        <Badge className="bg-cyan-500/30 text-cyan-300">
                                            {rec.recommendation_type}
                                        </Badge>
                                        {rec.recommendation_content?.priority_score > 0.8 && (
                                            <Badge className="bg-red-500/30 text-red-300">High Priority</Badge>
                                        )}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-white/60 hover:text-white"
                                        onClick={() => handleDismiss(rec)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <h4 className="text-white font-semibold mb-1">
                                    {rec.recommendation_content?.title}
                                </h4>
                                <p className="text-slate-300 text-sm mb-3">
                                    {rec.recommendation_content?.description}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAccept(rec)}
                                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            updateRecommendation.mutate({ 
                                                recId: rec.recommendation_id, 
                                                response: 'deferred' 
                                            });
                                            setDismissedIds([...dismissedIds, rec.recommendation_id]);
                                        }}
                                        className="border-slate-600 text-slate-300"
                                    >
                                        <Clock className="w-4 h-4 mr-1" />
                                        Later
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}