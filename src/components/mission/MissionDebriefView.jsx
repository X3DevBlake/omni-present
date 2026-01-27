import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Brain, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MissionDebriefView({ report }) {
    if (!report) return null;

    return (
        <Card className="bg-black/80 backdrop-blur-xl border-white/10 text-white">
            <CardHeader className="border-b border-white/10 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">Mission Debrief: {report.mission_id}</CardTitle>
                        <p className="text-xs text-gray-400">Automated Post-Mission Analysis</p>
                    </div>
                    <Badge variant={report.outcome.includes('Success') ? 'default' : 'destructive'}>
                        {report.outcome}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded border border-white/5">
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Agent Performance
                        </div>
                        <div className="space-y-2">
                            {report.agent_performance && Object.entries(report.agent_performance).map(([agent, stats], i) => (
                                <div key={i} className="text-xs">
                                    <div className="flex justify-between mb-0.5">
                                        <span>{agent}</span>
                                        <span className={stats.score > 0.8 ? 'text-green-400' : 'text-yellow-400'}>
                                            {(stats.score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress value={stats.score * 100} className="h-1" />
                                    <div className="text-[9px] text-gray-500 mt-0.5">{stats.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded border border-white/5">
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Anomalies & Threats
                        </div>
                        <div className="text-2xl font-bold text-red-400">{report.anomalies_detected}</div>
                        <div className="text-xs text-gray-500">Events Flagged</div>
                        <div className="mt-2 text-xs text-red-300 bg-red-900/20 p-1 rounded">
                            Crit: Firewall spike at T+200
                        </div>
                    </div>
                </div>

                {/* Lessons & Strategy */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Strategy Evolution
                    </h4>
                    <div className="bg-purple-900/10 border border-purple-500/20 rounded p-3 text-xs space-y-2">
                        <p className="font-semibold text-purple-200">Lessons Learned:</p>
                        <p className="text-gray-300">{report.lessons_learned}</p>
                        
                        <div className="mt-2 pt-2 border-t border-purple-500/20">
                            <p className="font-semibold text-purple-200 mb-1">Adaptive Updates:</p>
                            <ul className="list-disc pl-4 space-y-1 text-gray-400">
                                {report.strategy_adjustments?.map((adj, i) => (
                                    <li key={i}>{adj}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}