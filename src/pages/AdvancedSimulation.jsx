import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import DynamicScenarioGenerator3D from '../components/simulation/DynamicScenarioGenerator3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedSimulation() {
    const [scenario, setScenario] = useState(null);

    const generateScenario = useMutation({
        mutationFn: async () => {
            const res = await base44.functions.invoke('simulation/autoScenarioGenerator', {});
            return res.data.scenario;
        },
        onSuccess: (data) => {
            setScenario(data);
            toast.success("New Scenario Generated from Real-World Risks");
        }
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Advanced Simulation Lab</h1>
                        <p className="text-white/60">AI-driven procedural scenario generation and testing.</p>
                    </div>
                    <Button 
                        size="lg" 
                        onClick={() => generateScenario.mutate()} 
                        disabled={generateScenario.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Wand2 className="w-5 h-5 mr-2" />
                        {generateScenario.isPending ? 'Generating...' : 'Generate Adaptive Scenario'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DynamicScenarioGenerator3D scenario={scenario} />
                    </div>

                    <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2">Scenario Parameters</h3>
                                <p className="text-sm text-white/50 mb-4">
                                    Parameters are dynamically tuned based on recent ethical audits and system risks.
                                </p>
                            </div>

                            {scenario ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-xs text-white/40 uppercase">Target Objectives</div>
                                        {scenario.target_objectives.map((obj, i) => (
                                            <div key={i} className="text-sm text-green-300 bg-green-900/20 p-2 rounded border border-green-500/20">
                                                {obj}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-white/40 uppercase">Ethical Dilemmas</div>
                                        {scenario.ethical_dilemmas.map((d, i) => (
                                            <div key={i} className="text-sm text-orange-300 bg-orange-900/20 p-2 rounded border border-orange-500/20">
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-4">
                                        <Play className="w-4 h-4 mr-2" /> Initialize Simulation
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/30">
                                    Awaiting Generation...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuroraBackground>
    );
}