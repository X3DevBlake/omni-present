import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function LiquidityPoolsPanel() {
    const { data } = useQuery({
        queryKey: ['liquidity-pools'],
        queryFn: async () => {
            const res = await base44.functions.invoke('defi/dexOperations', { action: 'get_pools' });
            return res.data.pools;
        }
    });

    return (
        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Droplets className="w-5 h-5" /> Liquidity Pools
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data?.map((pool) => (
                    <div key={pool.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-center hover:border-cyan-500/50 transition-colors">
                        <div>
                            <div className="font-bold text-white flex items-center gap-2">
                                {pool.pair}
                                <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                                    {pool.apy} APY
                                </Badge>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                TVL: {pool.liquidity} • Vol: {pool.volume}
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}