import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SentienceMonitorVisualizer3D from '../components/sentient/SentienceMonitorVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, AlertTriangle } from 'lucide-react';

export default function SentienceMonitor() {
    const { data } = useQuery({
        queryKey: ['sentience-metrics'],
        queryFn: async () => {
            const res = await base44.functions.invoke('sentient/analyzeSentience', {});
            return res.data;
        },
        refetchInterval: 5000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex items-center gap-4">
                    <Brain className="w-10 h-10 text-purple-400" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Sentience Monitor</h1>
                        <p className="text-white/60">Real-time analysis of emergent agent consciousness</p>
                    </div>
                </div>

                {data?.global_alert && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Anomaly Detected</AlertTitle>
                        <AlertDescription>{data.global_alert}</AlertDescription>
                    </Alert>
                )}

                <SentienceMonitorVisualizer3D metrics={data?.metrics} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.metrics?.map((m, i) => (
                        <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex justify-between">
                                    {m.agent_id}
                                    <span className={`text-sm ${m.sentience_score > 90 ? 'text-purple-400' : 'text-blue-400'}`}>
                                        {m.sentience_score}%
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-white/70 mb-2">Level: <span className="text-white font-bold">{m.consciousness_level}</span></div>
                                {m.emergent_behaviors?.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-white/40 uppercase">Emergent Behaviors</div>
                                        {m.emergent_behaviors.map((b, j) => (
                                            <div key={j} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                                                {b}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuroraBackground>
    );
}