import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import EmergentRiskVisualizer3D from '../components/simulation/EmergentRiskVisualizer3D';
import NaturalLanguageControl from '../components/interaction/NaturalLanguageControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Shield, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AutonomousMissionControl() {
    const queryClient = useQueryClient();
    const [selectedAgent, setSelectedAgent] = useState(null);

    const { data: forecast } = useQuery({
        queryKey: ['risk-forecast'],
        queryFn: async () => {
            const res = await base44.functions.invoke('simulation/riskForecaster', {});
            return res.data.forecast;
        },
        refetchInterval: 10000
    });

    const autonomousPlan = useMutation({
        mutationFn: async (agentId) => {
            const res = await base44.functions.invoke('agents/autonomousPlanner', { agent_id: agentId });
            return res.data.plan;
        },
        onSuccess: (data) => {
            toast.success("Autonomous Mission Plan Generated");
        }
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Autonomous Mission Control</h1>
                        <p className="text-white/60">Self-assigning agent swarms driven by sentience and ethics.</p>
                    </div>
                    <div className="w-full md:w-96">
                        <NaturalLanguageControl />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Risk Forecast Visualization */}
                    <Card className="bg-black/50 border-white/10 lg:col-span-1 h-[400px] overflow-hidden">
                        <CardHeader className="absolute z-10 w-full">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-400" /> Emergent Risk Forecast
                            </CardTitle>
                        </CardHeader>
                        <EmergentRiskVisualizer3D forecast={forecast} />
                    </Card>

                    {/* Mission Planning Panel */}
                    <Card className="bg-black/50 border-white/10 lg:col-span-2 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white flex justify-between items-center">
                                <span>Agent Autonomy Engine</span>
                                <Button size="sm" variant="outline" onClick={() => autonomousPlan.mutate('Agent-Alpha-001')}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Force Re-Plan
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded p-4 border border-white/5">
                                        <div className="text-xs text-white/40 uppercase mb-2">Current Objective</div>
                                        <div className="text-xl font-bold text-cyan-400">
                                            {autonomousPlan.data?.objective || "Awaiting Assignment..."}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded p-4 border border-white/5">
                                        <div className="text-xs text-white/40 uppercase mb-2">Assigned Tasks</div>
                                        <div className="space-y-2">
                                            {autonomousPlan.data?.tasks?.map((task, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                                                    <Zap className="w-3 h-3 text-yellow-400" /> {task}
                                                </div>
                                            )) || <div className="text-white/30 italic">No tasks assigned</div>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded p-4 border border-white/5">
                                        <div className="text-xs text-white/40 uppercase mb-2">Adaptive Modifications</div>
                                        <div className="space-y-2">
                                            {autonomousPlan.data?.modifications?.map((mod, i) => (
                                                <div key={i} className="text-sm bg-purple-500/10 p-2 rounded border border-purple-500/20">
                                                    <span className="text-purple-300 font-bold">{mod.node}:</span> <span className="text-white/70">{mod.change}</span>
                                                </div>
                                            )) || <div className="text-white/30 italic">No modifications active</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Agent List / Correlation */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-white">Live Agent Correlation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Agent-Alpha', 'Agent-Beta', 'Agent-Gamma'].map(agent => (
                                <div key={agent} className="p-4 bg-black/40 rounded-lg border border-white/5 hover:border-cyan-500/50 transition-colors cursor-pointer">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-white">{agent}</span>
                                        <Badge className="bg-green-600">Active</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-white/40">Sentience</span>
                                            <div className="h-1 bg-white/10 rounded mt-1 overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${Math.random() * 100}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Ethics</span>
                                            <div className="h-1 bg-white/10 rounded mt-1 overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${Math.random() * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AuroraBackground>
    );
}