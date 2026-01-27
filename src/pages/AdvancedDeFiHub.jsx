import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniTokenEcosystem3D from '../components/defi/OmniTokenEcosystem3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, DollarSign, Layers, Zap } from 'lucide-react';

export default function AdvancedDeFiHub() {
    const { data: finance } = useQuery({
        queryKey: ['financial-sim'],
        queryFn: async () => {
            const res = await base44.functions.invoke('banking/financialSimulation', {});
            return res.data.simulation;
        },
        refetchInterval: 3000
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <OmniTokenEcosystem3D price={finance?.omni_token_price} />
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
                                <h3 className="text-xl font-bold text-white mb-2">Yield Farming 2.0</h3>
                                <p className="text-sm text-white/60 mb-4">AI-optimized liquidity pools providing maximum returns with minimal impermanent loss.</p>
                                <Button variant="outline" className="w-full border-purple-500 text-purple-300 hover:bg-purple-900/50">
                                    <Layers className="w-4 h-4 mr-2" /> Explore Pools
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}