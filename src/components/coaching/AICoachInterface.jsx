import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AICoachInterface({ agentId }) {
    const [coaching, setCoaching] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateFeedback = async () => {
        setLoading(true);
        try {
            const res = await base44.functions.invoke('coaching/generateCoachingInsights', { agentId });
            setCoaching(res.data.coaching);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/30 text-white">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-full">
                                <Brain className="w-6 h-6 text-indigo-300" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">AI Agent Coach</CardTitle>
                                <p className="text-sm text-indigo-300">Personalized Evolution Guidance</p>
                            </div>
                        </div>
                        <Button 
                            onClick={generateFeedback} 
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500"
                        >
                            {loading ? "Analyzing..." : "Generate Analysis"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!coaching ? (
                        <div className="text-center py-10 text-slate-400">
                            Run analysis to receive personalized coaching insights.
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-400 mb-1">Success Rate</div>
                                    <div className="text-2xl font-bold text-green-400">{(coaching.performance_metrics.avg_success_rate * 100).toFixed(0)}%</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-400 mb-1">Collaboration</div>
                                    <div className="text-2xl font-bold text-blue-400">{(coaching.performance_metrics.collaboration_score * 100).toFixed(0)}%</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-400 mb-1">Adaptability</div>
                                    <div className="text-2xl font-bold text-purple-400">{(coaching.performance_metrics.adaptability_index * 100).toFixed(0)}%</div>
                                </div>
                            </div>

                            {/* Insight */}
                            <div className="bg-indigo-900/20 p-4 rounded-lg border-l-4 border-indigo-500">
                                <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Strategic Feedback
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {coaching.feedback}
                                </p>
                            </div>

                            {/* Skills Path */}
                            <div>
                                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-400" /> Recommended Evolution Path
                                </h4>
                                <div className="space-y-2">
                                    {coaching.recommended_skills.map((skill, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30">
                                                    Rec
                                                </Badge>
                                                <span className="text-sm font-medium">{skill}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Next Milestone */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Progress to: {coaching.next_evolution_milestone}</span>
                                    <span>85%</span>
                                </div>
                                <Progress value={85} className="h-2 bg-slate-800" />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}