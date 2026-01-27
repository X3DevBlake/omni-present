import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function OmniStaking() {
    const [amount, setAmount] = useState('');
    
    const stakeMutation = useMutation({
        mutationFn: async (action) => {
            await base44.functions.invoke('defi/omniStaking', { action, amount });
        }
    });

    return (
        <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Omni Staking Vault
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-gray-400">Total Staked</div>
                        <div className="text-xl font-bold text-white">4.2M OMNI</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                        <div className="text-xs text-gray-400">Current APY</div>
                        <div className="text-xl font-bold text-green-400">14.5%</div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="relative">
                        <Input 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Amount to stake"
                            className="bg-black/40 border-white/10 text-white pr-16"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-purple-400 font-bold">OMNI</span>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            onClick={() => stakeMutation.mutate('stake')}
                            disabled={stakeMutation.isPending}
                        >
                            <Lock className="w-4 h-4 mr-2" /> Stake
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-1 border-purple-500/50 text-purple-300"
                            onClick={() => stakeMutation.mutate('unstake')}
                            disabled={stakeMutation.isPending}
                        >
                            Unstake
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}