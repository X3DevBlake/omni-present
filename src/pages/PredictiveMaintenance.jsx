import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import PredictiveMaintenanceVisualizer3D from '../components/infrastructure/PredictiveMaintenanceVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PredictiveMaintenance() {
    const { data } = useQuery({
        queryKey: ['maintenance-predictions'],
        queryFn: async () => {
            const res = await base44.functions.invoke('infrastructure/predictMaintenance', {});
            return res.data;
        },
        refetchInterval: 10000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex items-center gap-4">
                    <Activity className="w-10 h-10 text-green-400" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Infrastructure AI Guardian</h1>
                        <p className="text-white/60">Predictive maintenance and system health forecasting</p>
                    </div>
                </div>

                <PredictiveMaintenanceVisualizer3D predictions={data?.predictions} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data?.predictions?.map((pred, i) => (
                        <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Server className="w-4 h-4 text-gray-400" />
                                    {pred.component_id}
                                </CardTitle>
                                <Badge className={pred.urgency === 'High' ? 'bg-red-600' : 'bg-green-600'}>
                                    {pred.urgency} Priority
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-3 rounded">
                                        <div className="text-xs text-white/40">Failure Probability</div>
                                        <div className="text-xl font-bold text-white">{(pred.predicted_failure_probability * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded">
                                        <div className="text-xs text-white/40">Est. Time to Failure</div>
                                        <div className="text-xl font-bold text-white flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {pred.estimated_time_to_failure}h
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded border border-white/5">
                                    <div className="text-xs text-white/40 uppercase mb-1">AI Recommendation</div>
                                    <div className="text-sm text-cyan-300">{pred.recommended_action}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuroraBackground>
    );
}