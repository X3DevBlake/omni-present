import React, { useState, useEffect } from 'react';
import CollaborationNetwork3D from '../components/collaboration/CollaborationNetwork3D';
import AdaptiveMissionControl from '../components/mission/AdaptiveMissionControl';
import AgentTrainingCenter3D from '../components/learning/AgentTrainingCenter3D';
import TeamChatInterface from '../components/collaboration/TeamChatInterface';
import MissionDebriefView from '../components/mission/MissionDebriefView';
import CrossHubVisualizer3D from '../components/orchestration/CrossHubVisualizer3D';
import SwarmIntelligence3D from '../components/swarm/SwarmIntelligence3D';
import SentientOracle3D from '../components/simulation/SentientOracle3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Brain, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function AgentCollaborationHub() {
    const [isSimulating, setIsSimulating] = useState(false);

    const handleFormTeam = async () => {
        setIsSimulating(true);
        try {
            await base44.functions.invoke('agents/formDynamicTeam', { missionId: 'OPS-ALPHA' });
        } catch(e) { console.error(e); }
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="relative min-h-screen w-full bg-black overflow-y-auto pt-20 pb-12">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="w-full h-full" />
            </div>
            <div className="container relative z-10 mx-auto px-6 space-y-8 pb-24">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                            Omega Swarm Nexus
                        </h1>
                        <p className="text-xl text-white/60">
                            Sentient Orchestration & Autonomous Hive Minds
                        </p>
                    </div>
                    <Button 
                        onClick={handleFormTeam} 
                        disabled={isSimulating}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-6 px-8 shadow-lg shadow-cyan-500/20"
                    >
                        {isSimulating ? <Zap className="w-5 h-5 mr-2 animate-spin" /> : <Users className="w-5 h-5 mr-2" />}
                        Initialize Omega Swarm
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Visualizer - Collaboration Network */}
                    <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <SwarmIntelligence3D active={true} />
                    </div>

                    {/* Mission Control Side Panel */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-[600px]">
                        <div className="h-64 rounded-xl overflow-hidden shadow-lg">
                            <SentientOracle3D isActive={true} currentThought="Optimizing swarm coherence protocols..." />
                        </div>
                        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                            <AdaptiveMissionControl />
                        </div>
                        <div className="h-48 overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                            <TeamChatInterface teamId="OPS-ALPHA" />
                        </div>
                    </div>
                </div>

                {/* Cross-Hub Orchestration */}
                <div className="mb-6">
                     <Card className="bg-black/50 border-white/10 overflow-hidden backdrop-blur-md">
                        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-purple-300">
                                <Zap className="w-5 h-5" /> Cross-Hub Orchestration Layer
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-[400px]">
                                <CrossHubVisualizer3D />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Multi-Hub Missions</h3>
                                <div className="space-y-3">
                                    {[
                                        { title: "Operation Golden Shield", hubs: ["Security", "Finance"], status: "Active" },
                                        { title: "Project Neural Link", hubs: ["Academy", "R&D"], status: "Planning" }
                                    ].map((m, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="font-bold text-sm text-white">{m.title}</div>
                                            <div className="flex gap-2 mt-2">
                                                {m.hubs.map(h => (
                                                    <Badge key={h} variant="secondary" className="text-[10px] h-5">{h}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Lower Section - Learning & Evolution & Debriefs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-black/50 border-white/10 p-6 lg:col-span-1 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-pink-400" />
                            <h2 className="text-xl font-bold text-white">Neural Training</h2>
                        </div>
                        <AgentTrainingCenter3D />
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-black/50 border-white/10 p-6 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-green-400" />
                                    <h2 className="text-xl font-bold text-white">Recent Mission Debriefs</h2>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => {
                                    // Trigger a mock debrief for demo
                                    base44.functions.invoke('missions/missionDebrief', { missionId: 'OPS-ALPHA-' + Date.now() })
                                        .then(() => alert('Debrief Generated'));
                                }}>Generate Report</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MissionDebriefView report={{
                                    mission_id: "OPS-ALPHA-001",
                                    outcome: "Success",
                                    anomalies_detected: 2,
                                    lessons_learned: "Swarm cohesion dropped during high-latency events.",
                                    agent_performance: { "Alpha-1": { score: 0.9, status: "Excellent" }, "Beta-2": { score: 0.7, status: "Normal" } },
                                    strategy_adjustments: ["Enabled local caching for sub-swarms."]
                                }} />
                                <MissionDebriefView report={{
                                    mission_id: "RECON-ZETA-009",
                                    outcome: "Partial Success",
                                    anomalies_detected: 5,
                                    lessons_learned: "Unexpected firewall density encountered.",
                                    agent_performance: { "Recon-X": { score: 0.85, status: "Promoted" } },
                                    strategy_adjustments: ["Stealth protocols upgraded to v2.1."]
                                }} />
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}