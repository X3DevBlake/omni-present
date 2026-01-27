import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Target, Zap, Activity, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionControlPanel({ activeMission, onStartMission, onAbortMission }) {
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [threatData, setThreatData] = useState(null);

    const checkThreats = async () => {
        // const res = await base44.functions.invoke('missions/analyzeThreatResponse', { network_state: "simulated" });
        // setThreatData(res.data);
        // Mocking for immediate UI feedback
        setThreatData({
            threat_level: "ELEVATED",
            detected_threats: [
                { id: 1, type: "Anomaly", location: "Sector 4", severity: "Medium" }
            ],
            suggested_protocols: [
                { id: 1, name: "Isolate Node", action: "Deploy Containment" }
            ]
        });
    };

    const suggestAssignments = async () => {
        // const res = await base44.functions.invoke('missions/suggestAssignments', { mission_id: activeMission.id });
        // setSuggestions(res.data.suggestions);
        setSuggestions([
            { id: "alpha", agent: "Agent Alpha", score: 98, role: "Infiltration" },
            { id: "beta", agent: "Agent Bravo", score: 92, role: "Surveillance" },
            { id: "gamma", agent: "Agent Gamma", score: 87, role: "Support" }
        ]);
    };

    const generateReport = async () => {
        // In a real app, call backend
        // const res = await base44.functions.invoke('missions/generateReport', { mission_id: activeMission.id, mission_data: activeMission });
        // setReportData(res.data.report);
        setReportData({
            outcome: "SUCCESS",
            lessons: ["Optimized pathing reduced latency by 15%.", "Swarm cohesion maintained above 90%."],
            utilization: { compute: "85%", bandwidth: "12TB" }
        });
        setShowReport(true);
    };

    if (showReport && reportData) {
        return (
            <Card className="bg-black/90 backdrop-blur-xl border-white/20 w-[400px]">
                <CardHeader>
                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                        <Brain className="w-5 h-5" /> Mission Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded text-green-400 text-center font-bold">
                        OUTCOME: {reportData.outcome}
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-400">LESSONS LEARNED</div>
                        <ul className="text-xs text-gray-300 list-disc list-inside">
                            {reportData.lessons.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 p-2 rounded">
                            <div className="text-gray-500">Compute</div>
                            <div className="text-white">{reportData.utilization.compute}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                            <div className="text-gray-500">Bandwidth</div>
                            <div className="text-white">{reportData.utilization.bandwidth}</div>
                        </div>
                    </div>
                    <Button onClick={() => setShowReport(false)} variant="outline" className="w-full mt-2">Close Report</Button>
                </CardContent>
            </Card>
        );
    }

    if (!activeMission) {
        return (
            <Card className="bg-black/80 backdrop-blur-xl border-white/20 w-[350px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Target className="w-5 h-5" /> Mission Command
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-400 mb-4">No active missions. Initialize a new operation to assign agents.</p>
                    <Button 
                        onClick={onStartMission} 
                        className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/50"
                    >
                        Initialize Operation
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-black/80 backdrop-blur-xl border-white/20 w-[400px]">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-400" /> 
                        {activeMission.title}
                    </CardTitle>
                    <Badge variant={activeMission.status === 'active' ? 'default' : 'outline'} className="uppercase text-[10px]">
                        {activeMission.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Mission Progress</span>
                        <span>{Math.round(activeMission.progress)}%</span>
                    </div>
                    <Progress value={activeMission.progress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-amber-500 to-red-500" />
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Agents</div>
                        <div className="text-lg font-bold text-white">{activeMission.agents?.length || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Threats</div>
                        <div className="text-lg font-bold text-red-400">{activeMission.threats || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded p-2 text-center border border-white/5">
                        <div className="text-xs text-gray-500">Efficiency</div>
                        <div className="text-lg font-bold text-green-400">94%</div>
                    </div>
                </div>

                {/* Dynamic Intel */}
                <div className="bg-black/40 rounded p-3 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-white/10 pb-1">
                        <Brain className="w-3 h-3" /> Live Intelligence
                    </div>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto">
                        <div className="flex gap-2 items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Sector 7 Secure. Path optimized.</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Activity className="w-3 h-3 text-amber-500 mt-0.5" />
                            <span className="text-gray-300">Rerouting Squad Alpha due to congestion.</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                            <span className="text-gray-300">Anomaly detected in Node X-Ray.</span>
                        </div>
                    </div>
                </div>

                {/* AI Threat Response Module */}
                <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Threat Monitor
                        </div>
                        <Button size="sm" variant="ghost" className="h-5 text-[10px]" onClick={checkThreats}>Scan</Button>
                    </div>
                    
                    {threatData ? (
                        <div className="bg-red-900/10 rounded p-2 border border-red-500/20 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-red-300">Level: {threatData.threat_level}</span>
                                <span className="text-red-500 font-bold">{threatData.detected_threats.length} Active</span>
                            </div>
                            <div className="space-y-1 mt-2">
                                {threatData.suggested_protocols.map(p => (
                                    <div key={p.id} className="bg-red-500/10 p-1 rounded flex justify-between items-center">
                                        <span className="text-gray-300">{p.name}</span>
                                        <Button size="sm" className="h-4 text-[9px] bg-red-600 hover:bg-red-700">Deploy</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-500 italic text-center">System Secure. No active threats.</div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/5">
                        Update Parameters
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onAbortMission}
                        className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-900/50"
                    >
                        Abort Mission
                    </Button>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                    {!suggestions ? (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs text-cyan-500 hover:text-cyan-300 bg-cyan-900/10"
                            onClick={suggestAssignments}
                        >
                            <Brain className="w-3 h-3 mr-2" /> AI: Suggest Agent Assignments
                        </Button>
                    ) : (
                        <div className="bg-cyan-900/20 p-2 rounded text-xs border border-cyan-500/20 mb-2">
                            <div className="font-bold text-cyan-400 mb-1">AI Recommendations</div>
                            {suggestions.map(s => (
                                <div key={s.id} className="flex justify-between items-center py-0.5">
                                    <span className="text-gray-300">{s.agent}</span>
                                    <Badge variant="outline" className="text-[9px] bg-cyan-500/10 border-cyan-500/30">{s.score}% Match</Badge>
                                </div>
                            ))}
                            <Button size="sm" className="w-full h-6 mt-2 text-[10px]" onClick={() => setSuggestions(null)}>Apply Assignments</Button>
                        </div>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-gray-500 hover:text-white"
                        onClick={generateReport}
                    >
                        View Mission Debrief
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}