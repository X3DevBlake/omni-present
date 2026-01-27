import React, { useState } from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import NeuralArchitectureExplorer3D from '../components/ailab/NeuralArchitectureExplorer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, FlaskConical, GitBranch, Play, RefreshCw, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AILab() {
    const [training, setTraining] = useState(false);
    const [progress, setProgress] = useState(0);

    const startTraining = () => {
        setTraining(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTraining(false);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);
    };

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Ultra AI Laboratory</h1>
                        <p className="text-purple-200/60">Advanced Model Training & Neural Architecture Research</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-purple-600 hover:bg-purple-500" onClick={startTraining} disabled={training}>
                            {training ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            {training ? 'Training...' : 'Start Training Run'}
                        </Button>
                        <Button variant="outline" className="border-purple-500/50 text-purple-200">
                            <GitBranch className="w-4 h-4 mr-2" /> Fork Model
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-black/80 border-purple-500/30 overflow-hidden shadow-2xl shadow-purple-900/20">
                            <NeuralArchitectureExplorer3D training={training} />
                        </Card>
                        
                        {training && (
                            <Card className="bg-purple-900/20 border-purple-500/30">
                                <CardContent className="p-6">
                                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                                        <span>Training Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-purple-950" indicatorClassName="bg-purple-400" />
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-xs font-mono text-purple-300">
                                        <div>Loss: {(Math.exp(-progress/20)).toFixed(4)}</div>
                                        <div>Accuracy: {(0.5 + progress/200).toFixed(4)}</div>
                                        <div>Epoch: {Math.floor(progress * 1.5)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <Cpu className="w-5 h-5" /> Active Models
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-purple-950/20 p-3 rounded border border-purple-500/20 hover:bg-purple-900/30 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-medium group-hover:text-purple-300">Omega-Model-v{i}.0</span>
                                            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">READY</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500" 
                                                style={{ width: `${Math.random() * 40 + 60}%` }} 
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-white/40">
                                            <span>Params: {Math.floor(Math.random() * 100)}B</span>
                                            <span>Efficiency: {Math.floor(Math.random() * 20 + 80)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <BarChart className="w-5 h-5" /> Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-white/5 rounded">
                                    <div className="text-xs text-white/50 mb-1">Compute Usage</div>
                                    <div className="text-xl font-bold text-white">45.2 PetaFLOPS</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded">
                                    <div className="text-xs text-white/50 mb-1">Global Knowledge Graph</div>
                                    <div className="text-xl font-bold text-white">8.2 Trillion Nodes</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}