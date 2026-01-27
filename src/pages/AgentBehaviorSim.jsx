import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AdaptiveBehaviorTreeEditor3D from '../components/agents/AdaptiveBehaviorTreeEditor3D';
import NaturalLanguageControl from '../components/interaction/NaturalLanguageControl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Edit2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentBehaviorSim() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [treeData, setTreeData] = useState(null);
    const [editingNode, setEditingNode] = useState(null);

    const handleTick = async () => {
        setIsPlaying(true);
        try {
            await base44.functions.invoke('agents/behaviorTreeEngine', { agent_id: 'sim-agent', action: 'tick' });
        } catch(e) { console.error(e); }
    };

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Adaptive Behavior Simulator</h1>
                        <p className="text-white/60">Edit, simulate, and optimize agent decision logic with AI.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <NaturalLanguageControl onCommandProcessed={() => toast.success("Simulation parameters updated via AI")} />
                        <div className="flex gap-2 justify-end">
                            <Button 
                                onClick={handleTick}
                                className={`gap-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isPlaying ? 'Pause' : 'Simulate'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsPlaying(false)}>
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    <div className="lg:col-span-2 h-full rounded-xl overflow-hidden shadow-2xl">
                        <AdaptiveBehaviorTreeEditor3D 
                            treeData={treeData} 
                            onNodeEdit={(node) => setEditingNode(node)} 
                        />
                    </div>
                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                        <CardContent className="p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Edit2 className="w-4 h-4 text-cyan-400" /> Node Inspector
                            </h3>
                            {editingNode ? (
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-3 rounded">
                                        <div className="text-xs text-white/40 uppercase mb-1">Selected Node</div>
                                        <div className="text-xl font-bold text-white">{editingNode.label}</div>
                                        <div className="text-sm text-cyan-400">{editingNode.type}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/60">Parameters</label>
                                        <div className="p-2 bg-black/40 rounded border border-white/5 text-sm font-mono text-white/80">
                                            {JSON.stringify({ weight: 0.8, timeout: 2000 }, null, 2)}
                                        </div>
                                    </div>
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Apply Changes</Button>
                                </div>
                            ) : (
                                <div className="text-center text-white/40 py-8">
                                    Click a node in the 3D view to inspect and edit properties.
                                </div>
                            )}
                            
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h4 className="text-xs font-bold text-white mb-2 uppercase">Live Telemetry</h4>
                                <div className="space-y-1 font-mono text-xs text-white/60">
                                    <div className="flex justify-between"><span>Execution Time:</span> <span className="text-green-400">12ms</span></div>
                                    <div className="flex justify-between"><span>Tree Depth:</span> <span>4</span></div>
                                    <div className="flex justify-between"><span>Active Agents:</span> <span>1</span></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuroraBackground>
    );
}