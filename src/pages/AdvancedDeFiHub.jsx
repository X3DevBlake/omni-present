import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniTokenEcosystem3D from '../components/defi/OmniTokenEcosystem3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, Layers, Zap, ArrowRightLeft, TrendingUp, Brain, ShieldAlert, Bot } from 'lucide-react';

export default function AdvancedDeFiHub() {
    const [swapAmount, setSwapAmount] = useState('');
    
    const { data: finance } = useQuery({
        queryKey: ['financial-sim'],
        queryFn: async () => {
            const res = await base44.functions.invoke('banking/financialSimulation', {});
            return res.data.simulation;
        },
        refetchInterval: 3000
    });

    const { data: advisor } = useQuery({
        queryKey: ['sentient-advisor'],
        queryFn: async () => {
            const res = await base44.functions.invoke('financial/sentientAdvisor', {});
            return res.data;
        },
        refetchInterval: 10000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 font-mono tracking-tighter">Advanced DeFi Protocol</h1>
                        <p className="text-cyan-200/60 font-mono">Next-Gen Decentralized Finance & Omni Token Ecosystem</p>
                    </div>
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                        <Zap className="w-4 h-4 mr-2" /> Connect Wallet
                    </Button>
                </div>

                {/* Sentient Advisor Section */}
                {advisor && (
                    <Card className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-purple-500/50 backdrop-blur-xl mb-8">
                        <CardContent className="p-6 flex items-start gap-6">
                            <div className="bg-black/50 p-4 rounded-full border border-purple-500/50">
                                <Bot className="w-8 h-8 text-purple-400 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">Sentient Financial Advisor</h3>
                                <p className="text-gray-300 italic mb-4">"{advisor.personal_message}"</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-black/30 p-3 rounded border border-white/10">
                                        <div className="text-xs text-gray-400 mb-1">Market Sentiment</div>
                                        <div className="text-lg font-bold text-green-400 flex items-center gap-2">
                                            {advisor.market_sentiment} <TrendingUp className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded border border-white/10">
                                        <div className="text-xs text-gray-400 mb-1">Risk Score</div>
                                        <div className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                                            {advisor.risk_assessment.score}/10 <ShieldAlert className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded border border-white/10">
                                        <div className="text-xs text-gray-400 mb-1">Proposed Action</div>
                                        <div className="text-sm font-semibold text-cyan-300">
                                            {advisor.automated_actions[0]?.type}: {advisor.automated_actions[0]?.description}
                                        </div>
                                        <Button size="sm" className="mt-2 w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200">Approve</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <OmniTokenEcosystem3D price={finance?.omni_token_price} />
                        
                        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-cyan-400 font-mono">Omni Swap</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs text-cyan-200">From (USDT)</label>
                                        <Input 
                                            value={swapAmount}
                                            onChange={(e) => setSwapAmount(e.target.value)}
                                            className="bg-black/50 border-cyan-500/30 text-white font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <Button size="icon" variant="ghost" className="mt-6 text-cyan-400">
                                        <ArrowRightLeft className="w-6 h-6" />
                                    </Button>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs text-cyan-200">To (OMNI)</label>
                                        <Input 
                                            value={swapAmount ? (parseFloat(swapAmount) / (finance?.omni_token_price || 124)).toFixed(4) : ''}
                                            readOnly
                                            className="bg-black/50 border-cyan-500/30 text-white font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <Button className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold">
                                    Swap Tokens
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="space-y-6">
                        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
                                    <Activity className="w-5 h-5" /> Market Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60">TVL</span>
                                    <span className="text-2xl font-bold text-white font-mono">
                                        ${(finance?.total_value_locked / 1000000000)?.toFixed(2)}B
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60">APY</span>
                                    <span className="text-xl font-bold text-green-400 font-mono">
                                        {finance?.staking_apy?.toFixed(2)}%
                                    </span>
                                </div>
                                
                                {/* Predictive Analytics Widget */}
                                <div className="p-3 bg-white/5 rounded border border-white/5">
                                    <h4 className="text-xs text-cyan-500 uppercase mb-2 flex items-center gap-1">
                                        <Brain className="w-3 h-3" /> Predictive Trends (1w)
                                    </h4>
                                    {advisor?.predictive_trends.map((trend, i) => (
                                        <div key={i} className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{trend.asset}</span>
                                            <span className={`${trend.prediction === 'UP' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {trend.prediction} ({Math.round(trend.confidence * 100)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-cyan-900/50 my-2" />
                                <div className="space-y-2">
                                    <div className="text-xs text-cyan-500 uppercase tracking-widest">Recent Activity</div>
                                    {finance?.recent_transactions.slice(0, 3).map((tx, i) => (
                                        <div key={i} className="flex justify-between text-sm text-white/80">
                                            <span>{tx.type} {tx.token}</span>
                                            <span className="font-mono">{tx.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Layers className="w-5 h-5" /> Yield Farming 2.0
                                </h3>
                                <p className="text-sm text-white/60 mb-4">AI-optimized liquidity pools providing maximum returns with minimal impermanent loss.</p>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between bg-black/30 p-2 rounded">
                                        <span className="text-purple-300 text-sm">OMNI-ETH LP</span>
                                        <span className="text-green-400 font-mono text-sm">142% APR</span>
                                    </div>
                                    <div className="flex justify-between bg-black/30 p-2 rounded">
                                        <span className="text-purple-300 text-sm">OMNI-USDT LP</span>
                                        <span className="text-green-400 font-mono text-sm">98% APR</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full border-purple-500 text-purple-300 hover:bg-purple-900/50">
                                    Stake & Earn
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}