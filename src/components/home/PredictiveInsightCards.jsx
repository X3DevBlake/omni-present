import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    AlertCircle,
    Sparkles,
    Lightbulb,
    Target,
    Zap
} from 'lucide-react';

export default function PredictiveInsightCards() {
    const { data: ecosystem } = useQuery({
        queryKey: ['predictive-insights'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 30000
    });

    const insights = [
        {
            type: 'optimization',
            title: 'Agent Team Formation Opportunity',
            description: 'AI detected 3 agents with complementary skills. Suggest team formation for 40% efficiency boost.',
            confidence: 0.89,
            icon: Target,
            color: 'purple',
            action: 'Form Team'
        },
        {
            type: 'prediction',
            title: 'Health Trajectory Improving',
            description: `Your unified health score is trending upward. Predicted to reach ${(ecosystem?.health_summary?.unified_health_score || 85) + 5} within 7 days.`,
            confidence: 0.92,
            icon: TrendingUp,
            color: 'green',
            action: 'View Details'
        },
        {
            type: 'alert',
            title: 'Device Optimization Recommended',
            description: 'Smart projector #3 shows degraded performance. AI suggests parameter adjustment to restore 100% efficiency.',
            confidence: 0.85,
            icon: AlertCircle,
            color: 'yellow',
            action: 'Optimize Now'
        },
        {
            type: 'insight',
            title: 'Companion Learning Milestone',
            description: 'Your AI companion has developed advanced empathy patterns. Emotional resonance improved by 18% this week.',
            confidence: 0.94,
            icon: Sparkles,
            color: 'pink',
            action: 'View Progress'
        },
        {
            type: 'suggestion',
            title: 'Financial Strategy Opportunity',
            description: 'Omega AI identified arbitrage opportunity with 95% confidence. Estimated 12% returns in 48 hours.',
            confidence: 0.95,
            icon: Lightbulb,
            color: 'cyan',
            action: 'Execute'
        },
        {
            type: 'proactive',
            title: 'Skill Transfer Suggestion',
            description: 'Agent Alpha has mastered navigation. Recommend sharing with Beta team for collaborative efficiency.',
            confidence: 0.87,
            icon: Zap,
            color: 'blue',
            action: 'Transfer Skill'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className={`bg-gradient-to-br from-${insight.color}-500/10 to-${insight.color}-500/5 border-${insight.color}-500/30 hover:border-${insight.color}-500/50 transition-all cursor-pointer`}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`bg-${insight.color}-500/20 rounded-lg p-2`}>
                                    <insight.icon className={`w-5 h-5 text-${insight.color}-400`} />
                                </div>
                                <Badge className={`bg-${insight.color}-500/20 text-${insight.color}-400 text-xs`}>
                                    {(insight.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                            </div>
                            <h4 className="text-white font-semibold text-sm mb-2">
                                {insight.title}
                            </h4>
                            <p className="text-slate-400 text-xs mb-3">
                                {insight.description}
                            </p>
                            <div className={`text-${insight.color}-400 text-xs font-semibold hover:underline`}>
                                {insight.action} →
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}