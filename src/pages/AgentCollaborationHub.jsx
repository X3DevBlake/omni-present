import React, { useState } from 'react';
import CollaborationNetwork3D from '../components/collaboration/CollaborationNetwork3D';
import AdaptiveMissionControl from '../components/mission/AdaptiveMissionControl';
import AgentTrainingCenter3D from '../components/learning/AgentTrainingCenter3D';
import TeamChatInterface from '../components/collaboration/TeamChatInterface';
import MissionDebriefView from '../components/mission/MissionDebriefView';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Brain, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AgentCollaborationHub() {
    const [isSimulating, setIsSimulating] = useState(false);

    const handleFormTeam = async () => {
        setIsSimulating(true);
        // Simulate backend call
        try {
            await base44.functions.invoke('agents/formDynamicTeam', { missionId: 'OPS-ALPHA' });
        } catch(e) { console.error(e); }
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-20">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Agent Collaboration & Intelligence Hub
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Orchestrating autonomous swarms, adaptive missions, and continuous learning.
                        </p>
                    </div>
                    <Button 
                        onClick={handleFormTeam} 
                        disabled={isSimulating}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isSimulating ? <Zap className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                        Initialize Swarm Protocol
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Visualizer - Collaboration Network */}
                    <Card className="lg:col-span-2 bg-black/50 border-white/10 overflow-hidden min-h-[500px]">
                        <CollaborationNetwork3D />
                    </Card>

                    {/* Mission Control Side Panel */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-[600px]">
                        <div className="flex-1">
                            <AdaptiveMissionControl />
                        </div>
                        <div className="flex-1">
                            <TeamChatInterface teamId="OPS-ALPHA" />
                        </div>
                    </div>
                </div>

                {/* Lower Section - Learning & Evolution & Debriefs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-black/50 border-white/10 p-6 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-pink-400" />
                            <h2 className="text-xl font-bold">Neural Training</h2>
                        </div>
                        <AgentTrainingCenter3D />
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-black/50 border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-green-400" />
                                    <h2 className="text-xl font-bold">Recent Mission Debriefs</h2>
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