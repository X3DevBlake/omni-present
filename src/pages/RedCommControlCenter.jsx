import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HolographicDeviceBlueprint3D from '../components/redcomm/HolographicDeviceBlueprint3D';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Cpu, Wifi, Shield } from 'lucide-react';

export default function RedCommControlCenter() {
    const [selectedBlueprintId, setSelectedBlueprintId] = useState(null);

    const { data: blueprints = [] } = useQuery({
        queryKey: ['redcomm-blueprints'],
        queryFn: () => base44.entities.RedCommDeviceBlueprint.list({ limit: 10 }),
        initialData: []
    });

    const selectedBlueprint = blueprints.find(b => b.id === selectedBlueprintId) || blueprints[0];

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Radio className="w-10 h-10 text-cyan-400" />
                            RedComm Control Center
                        </h1>
                        <p className="text-cyan-200/60">Interplanetary Communication Mesh & Device Orchestration</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
                    {/* Device List */}
                    <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl h-full flex flex-col">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-cyan-300 font-bold uppercase tracking-wider text-sm">Active Blueprints</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {blueprints.map(bp => (
                                <div 
                                    key={bp.id}
                                    onClick={() => setSelectedBlueprintId(bp.id)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedBlueprint?.id === bp.id 
                                        ? 'bg-cyan-900/30 border-cyan-500' 
                                        : 'bg-black/40 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-white">{bp.device_name}</span>
                                        <Badge variant="outline" className="text-xs border-cyan-500/50 text-cyan-400">{bp.model_series}</Badge>
                                    </div>
                                    <div className="flex gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {bp.specs?.processing_power} TF</span>
                                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {bp.specs?.bandwidth_capacity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* 3D Visualization */}
                    <div className="lg:col-span-2 h-full">
                        <HolographicDeviceBlueprint3D blueprint={selectedBlueprint} />
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}