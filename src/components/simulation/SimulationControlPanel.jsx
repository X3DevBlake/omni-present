import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Cpu, Shield, Zap } from 'lucide-react';

export default function SimulationControlPanel({ onUpdate }) {
    const [params, setParams] = useState({
        speed: 1,
        resources: 50,
        ethics: 80,
        entropy: 20
    });

    const handleChange = (key, value) => {
        const newParams = { ...params, [key]: value[0] };
        setParams(newParams);
        onUpdate(newParams);
    };

    return (
        <Card className="bg-black/80 border-white/10 backdrop-blur-xl absolute top-24 right-6 w-80 z-20">
            <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4 text-cyan-400" /> Simulation Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Time Dilation</span>
                        <span>{params.speed}x</span>
                    </div>
                    <Slider value={[params.speed]} min={0.1} max={10} step={0.1} onValueChange={(v) => handleChange('speed', v)} className="py-1" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-400" /> Compute Allocation</span>
                        <span>{params.resources}%</span>
                    </div>
                    <Slider value={[params.resources]} min={0} max={100} step={1} onValueChange={(v) => handleChange('resources', v)} className="py-1" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Ethical Constraints</span>
                        <span>{params.ethics}%</span>
                    </div>
                    <Slider value={[params.ethics]} min={0} max={100} step={1} onValueChange={(v) => handleChange('ethics', v)} className="py-1" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white">
                        <span>Entropy Injection</span>
                        <span>{params.entropy}%</span>
                    </div>
                    <Slider value={[params.entropy]} min={0} max={100} step={1} onValueChange={(v) => handleChange('entropy', v)} className="py-1" />
                </div>
                
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30">System Nominal</Badge>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </CardContent>
        </Card>
    );
}