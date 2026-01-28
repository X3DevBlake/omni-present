import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EmergentRiskVisualizer3D from '../components/simulation/EmergentRiskVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';

export default function AutonomousMissionControl() {
    const { data: forecasts } = useQuery({
        queryKey: ['risk-forecasts'],
        queryFn: () => base44.entities.EmergentRiskForecast.list({ limit: 20, sort: { risk_score: -1 } }),
        initialData: []
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                            Autonomous Mission Control
                        </h1>
                        <p className="text-red-200/60">Emergent Threat Detection & Autonomous Response</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-red-500/30 text-red-300">
                            <RefreshCw className="w-4 h-4 mr-2" /> Recalibrate Sensors
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                            <Play className="w-4 h-4 mr-2" /> Run Simulation
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <EmergentRiskVisualizer3D forecasts={forecasts} />
                    </div>
                    
                    <div className="space-y-4">
                        <Card className="bg-black/60 border-red-900/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-red-400 text-sm uppercase tracking-widest">Active Threats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {forecasts.slice(0, 5).map((forecast, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-red-950/20 border border-red-900/30">
                                        <div className="text-sm text-gray-300">
                                            Sim ID: {forecast.simulation_id.substring(0,6)}...
                                        </div>
                                        <div className="font-bold text-red-400">
                                            {forecast.risk_score}%
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white text-sm uppercase tracking-widest">System Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Sentience Correlation</span>
                                            <span>87%</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 w-[87%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Ethical Compliance</span>
                                            <span>99.9%</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[99.9%]" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}