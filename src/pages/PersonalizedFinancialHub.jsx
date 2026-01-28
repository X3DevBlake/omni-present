import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedFinancialGalaxy3D from '../components/financial/EnhancedFinancialGalaxy3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function PersonalizedFinancialHub() {
    const { data: portfolio } = useQuery({
        queryKey: ['conscious-portfolio'],
        queryFn: async () => {
            const res = await base44.entities.ConsciousPortfolio.list({ limit: 1 });
            return res[0] || null;
        }
    });

    const { data: insights } = useQuery({
        queryKey: ['financial-insights'],
        queryFn: () => base44.entities.UnifiedSystemInsight.filter({ primary_domain: 'Marketplace' }, { limit: 5 }),
        initialData: []
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Brain className="w-10 h-10 text-purple-400" />
                            Sentient Wealth Manager
                        </h1>
                        <p className="text-purple-200/60">Autonomous AI-driven financial orchestration</p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        <Zap className="w-4 h-4 mr-2" /> Auto-Optimize Portfolio
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <EnhancedFinancialGalaxy3D portfolioData={portfolio} />
                        
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6">
                                    <div className="text-sm text-gray-400">Total Valuation</div>
                                    <div className="text-2xl font-bold text-white">$1,245,392.00</div>
                                    <div className="text-xs text-green-400 flex items-center mt-1">
                                        <TrendingUp className="w-3 h-3 mr-1" /> +12.4% (24h)
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6">
                                    <div className="text-sm text-gray-400">Ethical Alignment</div>
                                    <div className="text-2xl font-bold text-white">98.2%</div>
                                    <div className="text-xs text-purple-400 flex items-center mt-1">
                                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6">
                                    <div className="text-sm text-gray-400">Active Agents</div>
                                    <div className="text-2xl font-bold text-white">4</div>
                                    <div className="text-xs text-blue-400 flex items-center mt-1">
                                        <Brain className="w-3 h-3 mr-1" /> Trading
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-black/60 border-white/10 backdrop-blur-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-purple-300">Sentient Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {insights.map((insight, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded ${
                                                insight.risk_level === 'Critical' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                                            }`}>
                                                {insight.risk_level} Risk
                                            </span>
                                            <span className="text-[10px] text-gray-500">{new Date(insight.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-200">{insight.description}</p>
                                    </div>
                                ))}
                                {insights.length === 0 && (
                                    <div className="text-center text-gray-500 py-8">
                                        No critical insights detected.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}