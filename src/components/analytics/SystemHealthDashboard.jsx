import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Cpu, HeartPulse, AlertCircle, CheckCircle } from 'lucide-react';

export default function SystemHealthDashboard({ healthData }) {
    const { score, status, last_updated } = healthData || { score: 100, status: 'OPTIMAL', last_updated: new Date().toISOString() };

    return (
        <Card className="bg-black/60 border-green-500/30 backdrop-blur-xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5" /> Holistic System Health
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-4xl font-bold text-white mb-1">{Math.round(score)}%</div>
                        <div className={`text-sm font-bold tracking-widest ${
                            status === 'OPTIMAL' ? 'text-green-400' : 
                            status === 'STABLE' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {status}
                        </div>
                    </div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                            <circle 
                                cx="40" cy="40" r="36" 
                                stroke={score > 80 ? '#22c55e' : score > 60 ? '#eab308' : '#ef4444'} 
                                strokeWidth="8" 
                                fill="none" 
                                strokeDasharray={226}
                                strokeDashoffset={226 - (226 * score) / 100}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <Activity className="absolute w-8 h-8 text-white/80" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Shield className="w-4 h-4 text-blue-400" /> Ethics Compliance
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Cpu className="w-4 h-4 text-purple-400" /> Sentience Stability
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <AlertCircle className="w-4 h-4 text-orange-400" /> Anomaly Risk
                        </div>
                        <span className="text-xs text-green-400">Low</span>
                    </div>
                </div>
                
                <div className="mt-4 text-[10px] text-white/30 text-center">
                    Last synced: {new Date(last_updated).toLocaleTimeString()}
                </div>
            </CardContent>
        </Card>
    );
}