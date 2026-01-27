import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Lock } from 'lucide-react';

export default function AgentProgressionTracker({ currentLevel = 1, xpToNext = 500, specialization = "Generalist" }) {
    return (
        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white flex justify-between items-center">
                    <span>Agent Specialization</span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {specialization}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center border-4 border-black shadow-lg">
                        <span className="text-2xl font-black text-white">{currentLevel}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Level {currentLevel}</span>
                            <span>Level {currentLevel + 1}</span>
                        </div>
                        <Progress value={(1000 - xpToNext) / 10} className="h-3 bg-white/10" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-600" />
                        <div className="text-right text-xs text-yellow-500 mt-1">{xpToNext} XP to level up</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Unlocked Mastery Perks
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 p-2 rounded text-center border border-white/10 hover:bg-white/10 transition-colors">
                            <Star className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                            <div className="text-[10px] text-gray-300">Rapid Learning</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded text-center border border-white/10 hover:bg-white/10 transition-colors">
                            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                            <div className="text-[10px] text-gray-300">Market Alpha</div>
                        </div>
                        <div className="bg-black/40 p-2 rounded text-center border border-white/5 opacity-50">
                            <Lock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                            <div className="text-[10px] text-gray-500">Locked</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}