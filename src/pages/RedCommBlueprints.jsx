import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // Added import
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedRedCommBlueprint3D from '../components/redcomm/EnhancedRedCommBlueprint3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RedCommBlueprints() {
    const [optimizing, setOptimizing] = useState(false);

    const { data: capabilities } = useQuery({ // Removed useQuery import to keep consistent with find/replace block, assume it's imported at top
        queryKey: ['redcomm-caps'],
        queryFn: async () => {
            const res = await base44.functions.invoke('redcomm/xgCapabilities', {});
            return res.data.capabilities;
        }
    });

    const handleOptimize = async () => {
        setOptimizing(true);
        try {
            const res = await base44.functions.invoke('redcomm/adaptiveController', { device_id: 'XG-Omega' });
            toast.success(`Optimized: ${res.data.optimization.action_taken}`);
        } catch (e) {
            console.error(e);
            toast.error("Optimization failed");
        } finally {
            setOptimizing(false);
        }
    };

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-red-500 font-mono tracking-tighter mb-2">RedComm XG Blueprints</h1>
                        <p className="text-red-200/60 font-mono text-sm">Next-Gen Communication Infrastructure Visualizer</p>
                    </div>
                    <Button 
                        onClick={handleOptimize} 
                        disabled={optimizing}
                        className="bg-red-900/50 hover:bg-red-800 border border-red-500 text-red-100 shadow-[0_0_15px_rgba(255,0,0,0.4)]"
                    >
                        {optimizing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Radio className="w-4 h-4 mr-2" />}
                        Run Adaptive Optimization
                    </Button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-black/80 rounded-2xl overflow-hidden border border-red-900/30 shadow-2xl shadow-red-900/20 relative">
                        <EnhancedRedCommBlueprint3D />
                        
                        {/* Floating HUD Elements */}
                        <div className="absolute bottom-6 left-6 w-64 space-y-2">
                            <div className="bg-black/60 backdrop-blur border border-red-500/20 p-3 rounded">
                                <div className="text-[10px] text-red-500 font-bold mb-1">MODULE STATUS</div>
                                <div className="flex justify-between text-xs text-white font-mono">
                                    <span>AI Core</span> <span className="text-green-500">ONLINE</span>
                                </div>
                                <div className="flex justify-between text-xs text-white font-mono">
                                    <span>Quantum Link</span> <span className="text-green-500">STABLE</span>
                                </div>
                                <div className="flex justify-between text-xs text-white font-mono">
                                    <span>Stealth Mode</span> <span className="text-yellow-500">STANDBY</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-black/60 border-red-900/30 backdrop-blur-xl h-full overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="text-red-500 font-mono text-lg">XG Capabilities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {capabilities ? (
                                <>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-red-400/60 uppercase">Neural Bandwidth</div>
                                        <div className="text-xl text-white font-mono font-bold">{capabilities.neural_bandwidth}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-red-400/60 uppercase">Holographic Res</div>
                                        <div className="text-white font-mono">{capabilities.holographic_resolution}</div>
                                    </div>
                                    <div className="h-px bg-red-900/30 my-2" />
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-red-400/60 uppercase">Active Links</div>
                                        {capabilities.active_links.map((link, i) => (
                                            <div key={i} className="bg-red-950/20 p-2 rounded border border-red-900/30">
                                                <div className="text-xs text-red-300 font-bold">{link.target}</div>
                                                <div className="text-[10px] text-red-400/70">{link.latency}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-red-900/50 text-center animate-pulse">Initializing XG Protocol...</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuroraBackground>
    );
}