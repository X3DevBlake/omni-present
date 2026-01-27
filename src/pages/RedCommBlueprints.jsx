import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedRedCommBlueprint3D from '../components/redcomm/EnhancedRedCommBlueprint3D';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RedCommBlueprints() {
    const [optimizing, setOptimizing] = useState(false);

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
                        className="bg-red-900/50 hover:bg-red-800 border border-red-500 text-red-100"
                    >
                        {optimizing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Radio className="w-4 h-4 mr-2" />}
                        Run Adaptive Optimization
                    </Button>
                </div>

                <div className="flex-1 bg-black/80 rounded-2xl overflow-hidden border border-red-900/30 shadow-2xl shadow-red-900/20 relative">
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
            </div>
        </AuroraBackground>
    );
}