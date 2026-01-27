import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import NeuralArchitectureExplorer3D from '../components/ailab/NeuralArchitectureExplorer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, FlaskConical, GitBranch } from 'lucide-react';

export default function AILab() {
    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Ultra AI Laboratory</h1>
                        <p className="text-purple-200/60">Advanced Model Training & Neural Architecture Research</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-purple-600 hover:bg-purple-500">
                            <FlaskConical className="w-4 h-4 mr-2" /> New Experiment
                        </Button>
                        <Button variant="outline" className="border-purple-500/50 text-purple-200">
                            <GitBranch className="w-4 h-4 mr-2" /> Fork Model
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <NeuralArchitectureExplorer3D />
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <Cpu className="w-5 h-5" /> Active Training Jobs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-purple-950/20 p-3 rounded border border-purple-500/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-medium">Omega-Model-v{i}.0</span>
                                            <span className="text-xs text-green-400">RUNNING</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500" 
                                                style={{ width: `${Math.random() * 100}%` }} 
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-white/40">
                                            <span>Epoch {Math.floor(Math.random() * 100)}/1000</span>
                                            <span>Loss: 0.0{Math.floor(Math.random() * 99)}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <Brain className="w-5 h-5" /> Research Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-white/70">
                                    Recent analysis suggests increasing parameter density in the decision layers optimizes ethical compliance by 14%.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}