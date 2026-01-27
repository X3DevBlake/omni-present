import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, RefreshCw, Wallet } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DEXSwapPanel() {
    const [fromToken, setFromToken] = useState('OMNI');
    const [toToken, setToToken] = useState('ETH');
    const [amount, setAmount] = useState('');

    const swapMutation = useMutation({
        mutationFn: async () => {
            const res = await base44.functions.invoke('defi/dexOperations', {
                action: 'swap',
                tokenA: fromToken,
                tokenB: toToken,
                amount: parseFloat(amount)
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(`Swapped ${amount} ${fromToken} for ${data.received.toFixed(4)} ${toToken}`);
        }
    });

    return (
        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <ArrowDownUp className="w-5 h-5" /> Omni DEX
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Pay</span>
                        <span>Balance: 1,240.50</span>
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            placeholder="0.0" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-black/40 border-cyan-500/20 text-white"
                        />
                        <Select value={fromToken} onValueChange={setFromToken}>
                            <SelectTrigger className="w-[100px] bg-cyan-900/20 border-cyan-500/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OMNI">OMNI</SelectItem>
                                <SelectItem value="ETH">ETH</SelectItem>
                                <SelectItem value="USDT">USDT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-cyan-500/10 text-cyan-400">
                        <ArrowDownUp className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Receive</span>
                        <span>(Estimated)</span>
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            disabled 
                            placeholder="0.0" 
                            value={amount ? (parseFloat(amount) * 1.5).toFixed(4) : ''}
                            className="bg-black/40 border-cyan-500/20 text-white opacity-50"
                        />
                        <Select value={toToken} onValueChange={setToToken}>
                            <SelectTrigger className="w-[100px] bg-purple-900/20 border-purple-500/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OMNI">OMNI</SelectItem>
                                <SelectItem value="ETH">ETH</SelectItem>
                                <SelectItem value="USDT">USDT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 font-bold"
                    onClick={() => swapMutation.mutate()}
                    disabled={!amount || swapMutation.isPending}
                >
                    {swapMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                    Swap Tokens
                </Button>
            </CardContent>
        </Card>
    );
}