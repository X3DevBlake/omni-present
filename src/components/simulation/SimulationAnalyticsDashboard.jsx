import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Zap, Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function SimulationAnalyticsDashboard({ data }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-purple-400 text-sm">Emergent Behaviors</CardTitle></CardHeader>
                    <CardContent>
                        {data.emergent_behaviors?.map((behavior, i) => (
                            <div key={i} className="mb-4 last:mb-0">
                                <div className="flex justify-between text-white text-sm font-bold mb-1">
                                    <span>{behavior.name}</span>
                                    <span>{Math.round(behavior.probability * 100)}%</span>
                                </div>
                                <Progress value={behavior.probability * 100} className="h-1 bg-white/10" indicatorClassName="bg-purple-500" />
                                <div className="text-[10px] text-gray-400 mt-1">{behavior.description}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-black/60 border-red-500/30 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-red-400 text-sm">Ethical Risk Forecast</CardTitle></CardHeader>
                    <CardContent>
                        {data.ethical_risks?.map((risk, i) => (
                            <div key={i} className="bg-red-900/20 p-3 rounded border border-red-500/20 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldAlert className="w-4 h-4 text-red-500" />
                                    <span className="text-white text-sm font-bold">{risk.risk}</span>
                                </div>
                                <div className="text-[10px] text-red-200 mb-2">Severity: {risk.severity}</div>
                                <div className="text-[10px] text-white/60">Mitigation: {risk.mitigation_strategy}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-black/60 border-orange-500/30 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-orange-400 text-sm">Predictive Failure Analysis</CardTitle></CardHeader>
                    <CardContent>
                        {data.predictive_failures?.map((fail, i) => (
                            <div key={i} className="mb-3 p-2 bg-orange-900/10 rounded border border-orange-500/10">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white text-xs font-bold">{fail.component}</span>
                                    <Badge variant="outline" className="text-orange-400 border-orange-500/50 text-[10px]">
                                        {Math.round(fail.failure_probability * 100)}% Risk
                                    </Badge>
                                </div>
                                <div className="text-[10px] text-gray-400">Est. Time: {fail.estimated_time}</div>
                                <div className="text-[10px] text-orange-200 mt-1">Fix: {fail.recommendation}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-black/60 border-blue-500/30 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-blue-400 text-sm">Dynamic Optimization Parameters</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded text-center">
                                <div className="text-xs text-gray-400">Sim Speed</div>
                                <div className="text-xl font-bold text-white">{data.optimization_parameters?.simulation_speed}x</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded text-center">
                                <div className="text-xs text-gray-400">Entropy</div>
                                <div className="text-xl font-bold text-white">{data.optimization_parameters?.entropy_injection}</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded text-center">
                                <div className="text-xs text-gray-400">Ethical Dampening</div>
                                <div className="text-xl font-bold text-white">{data.optimization_parameters?.ethical_dampening}</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded text-center">
                                <div className="text-xs text-gray-400">Allocation</div>
                                <div className="text-xl font-bold text-white">{data.optimization_parameters?.resource_allocation}</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-blue-300 text-center">
                            Last Adjustment: {data.dynamic_optimization?.last_adjustment}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/60 border-green-500/30 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-green-400 text-sm">Agent Influence Metrics</CardTitle></CardHeader>
                    <CardContent>
                        {data.agent_influence_metrics?.map((agent, i) => (
                            <div key={i} className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Cpu className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-white mb-1">
                                        <span>{agent.agent_id}</span>
                                        <span>{agent.parameter_affected}</span>
                                    </div>
                                    <Progress value={agent.influence_score * 100} className="h-1.5 bg-white/10" indicatorClassName="bg-green-500" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}