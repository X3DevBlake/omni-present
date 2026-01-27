import React, { useState } from 'react';
import CollaborationNetwork3D from '../components/collaboration/CollaborationNetwork3D';
import AdaptiveMissionControl from '../components/mission/AdaptiveMissionControl';
import AgentTrainingCenter3D from '../components/learning/AgentTrainingCenter3D';
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
            await base44.functions.invoke('formDynamicTeam', { missionId: 'OPS-ALPHA' });
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
                    <div className="lg:col-span-1 h-[500px]">
                        <AdaptiveMissionControl />
                    </div>
                </div>

                {/* Lower Section - Learning & Evolution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-black/50 border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-pink-400" />
                            <h2 className="text-xl font-bold">Neural Training Center</h2>
                        </div>
                        <AgentTrainingCenter3D />
                    </Card>

                    <Card className="bg-black/50 border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-green-400" />
                            <h2 className="text-xl font-bold">Consensus & Strategy Logs</h2>
                        </div>
                        <div className="space-y-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="p-3 bg-white/5 rounded border border-white/5 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white">Strategy Consensus Reached: Protocol Delta</div>
                                        <div className="text-xs text-gray-400">Team Alpha • 98% Agreement</div>
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-300">Executed</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}