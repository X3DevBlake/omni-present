import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BehaviorTreeVisualizer3D from '../components/agents/BehaviorTreeVisualizer3D';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentBehaviorSim() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [treeData, setTreeData] = useState(null);

    const handleTick = async () => {
        setIsPlaying(true);
        // Simulate fetch/update
        try {
            const res = await base44.functions.invoke('agents/behaviorTreeEngine', { agent_id: 'sim-agent', action: 'tick' });
            // In a real app, update treeData based on res
        } catch(e) { console.error(e); }
    };

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Agent Behavior Simulator</h1>
                        <p className="text-white/60">Visualize and debug autonomous decision trees.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleTick}
                            className={`gap-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? 'Pause Simulation' : 'Run Simulation'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsPlaying(false)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    <div className="lg:col-span-2 h-full">
                        <BehaviorTreeVisualizer3D treeData={treeData} />
                    </div>
                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                        <CardContent className="p-6">
                            <h3 className="text-white font-bold mb-4">Tree Inspector</h3>
                            <div className="space-y-4">
                                <div className="bg-white/5 p-3 rounded">
                                    <div className="text-xs text-white/40 uppercase mb-1">Active Node</div>
                                    <div className="text-green-400 font-mono">Selector_Combat_01</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded">
                                    <div className="text-xs text-white/40 uppercase mb-1">Variables</div>
                                    <div className="space-y-1 font-mono text-sm text-white/80">
                                        <div className="flex justify-between"><span>TargetDist:</span> <span>14.2m</span></div>
                                        <div className="flex justify-between"><span>Ammo:</span> <span>85%</span></div>
                                        <div className="flex justify-between"><span>Health:</span> <span>100%</span></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuroraBackground>
    );
}