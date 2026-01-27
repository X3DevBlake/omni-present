import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import UnifiedIntelligenceDashboard3D from '../components/intelligence/UnifiedIntelligenceDashboard3D';
import CrossDomainAnomalyVisualizer3D from '../components/analytics/CrossDomainAnomalyVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UnifiedIntelligenceCenter() {
    const { data: insights } = useQuery({
        queryKey: ['unified-insights'],
        queryFn: async () => {
            const res = await base44.functions.invoke('ai/unifiedOrchestrator', {});
            return res.data.insights;
        },
        refetchInterval: 5000
    });

    const { data: anomalies } = useQuery({
        queryKey: ['anomalies'],
        queryFn: async () => {
            const res = await base44.functions.invoke('analytics/detectEmergentAnomalies', {});
            return res.data.anomalies;
        },
        refetchInterval: 5000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Unified Intelligence Center</h1>
                    <p className="text-white/60">Holistic system orchestration and cross-domain correlation.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <UnifiedIntelligenceDashboard3D insights={insights} />
                        <Card className="bg-black/50 border-red-900/30 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Cross-Domain Anomaly Detection
                                </CardTitle>
                            </CardHeader>
                            <div className="h-[300px]">
                                <CrossDomainAnomalyVisualizer3D anomalies={anomalies} />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4 h-[900px] overflow-y-auto pr-2 custom-scrollbar">
                        <h2 className="text-xl font-bold text-white sticky top-0 bg-black/50 p-2 backdrop-blur z-10">Live AI Insights</h2>
                        {insights?.map((insight, i) => (
                            <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge className={`
                                            ${insight.risk_level === 'Critical' ? 'bg-red-600' : 
                                              insight.risk_level === 'High' ? 'bg-orange-600' : 'bg-blue-600'}
                                        `}>
                                            {insight.risk_level} Risk
                                        </Badge>
                                        <div className="text-xs text-white/40">{new Date(insight.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    
                                    <div className="text-white font-medium text-sm">
                                        {insight.description}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/30 p-2 rounded">
                                        <Link2 className="w-3 h-3" />
                                        <span>{insight.primary_domain} ↔ {insight.secondary_domain}</span>
                                        <span className="ml-auto opacity-60">{Math.round(insight.confidence_score * 100)}% Conf.</span>
                                    </div>

                                    {insight.triggered_actions?.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-white/40 uppercase">Auto-Response</div>
                                            {insight.triggered_actions.map((action, j) => (
                                                <div key={j} className="text-xs text-green-300 flex items-center gap-1">
                                                    <Activity className="w-3 h-3" /> {action}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}