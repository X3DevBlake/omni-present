import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function StakingLeaderboard() {
    const { data } = useQuery({
        queryKey: ['staking-leaderboard'],
        queryFn: async () => {
            const res = await base44.functions.invoke('defi/dexOperations', { action: 'get_leaderboard' });
            return res.data.leaderboard;
        }
    });

    const getIcon = (rank) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-500">{rank}</span>;
    };

    return (
        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Staking Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data?.map((entry) => (
                        <div key={entry.rank} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/10 to-transparent border border-white/5">
                            <div className="flex items-center gap-3">
                                {getIcon(entry.rank)}
                                <div>
                                    <div className="font-mono text-sm text-white">{entry.user}</div>
                                    <div className="text-xs text-purple-300">{entry.tier} Tier</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-white">{entry.score} XP</div>
                                <div className="text-xs text-green-400">+{entry.reward}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}