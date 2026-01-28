import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import MultiAgentLearningArena3D from '../components/training/MultiAgentLearningArena3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Swords, Trophy, Zap, Activity } from 'lucide-react';

export default function AgentTrainingArena() {
    const { data: trainingSessions } = useQuery({
        queryKey: ['active-training-sessions'],
        queryFn: () => base44.entities.AgentTrainingSession.list({ limit: 5 }), // Assuming entity exists or simulated
        initialData: []
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Swords className="w-10 h-10 text-orange-500" />
                            Multi-Agent Training Arena
                        </h1>
                        <p className="text-orange-200/60">Collaborative & Competitive Reinforcement Learning Environment</p>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                        <Zap className="w-4 h-4 mr-2" /> Start New Simulation
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <MultiAgentLearningArena3D />
                        
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <Card className="bg-black/60 border-orange-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6 text-center">
                                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">Gen-9</div>
                                    <div className="text-xs text-gray-400">Current Iteration</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/60 border-orange-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6 text-center">
                                    <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">94.5%</div>
                                    <div className="text-xs text-gray-400">Survival Rate</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/60 border-orange-500/30 backdrop-blur-xl">
                                <CardContent className="pt-6 text-center">
                                    <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">12.4M</div>
                                    <div className="text-xs text-gray-400">Training Steps</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-black/60 border-white/10 backdrop-blur-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-orange-300">Live Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="font-bold text-gray-500">#{i}</div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-white">Agent-Alpha-{i*23}</div>
                                            <div className="text-xs text-gray-400">Score: {1000 - i * 50}</div>
                                        </div>
                                        {i === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}