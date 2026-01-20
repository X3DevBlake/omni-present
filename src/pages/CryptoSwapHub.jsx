import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import CryptoSwapVisualizer3D from '../components/defi/CryptoSwapVisualizer3D';
import { toast } from 'sonner';

export default function CryptoSwapHub() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const queryClient = useQueryClient();

  const tokens = ['ETH', 'BTC', 'USDT', 'USDC', 'OMNI', 'DAI'];

  const { data: holdings = [] } = useQuery({
    queryKey: ['crypto-holdings'],
    queryFn: () => base44.entities.CryptoToken.filter({}).limit(50),
    initialData: []
  });

  const { data: recentSwaps = [] } = useQuery({
    queryKey: ['recent-swaps'],
    queryFn: () => base44.entities.CryptoSwap.filter({}).limit(20).sort('-created_date'),
    initialData: []
  });

  const swapMutation = useMutation({
    mutationFn: async (swapData) => {
      const response = await base44.functions.invoke('execute-swap', swapData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['crypto-holdings']);
      queryClient.invalidateQueries(['recent-swaps']);
      toast.success(`Swap completed! Received ${data.to_amount} ${toToken}`);
      setAmount('');
    },
    onError: (error) => {
      toast.error(error.message || 'Swap failed');
    }
  });

  const handleSwap = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    swapMutation.mutate({
      from_token: fromToken,
      to_token: toToken,
      from_amount: parseFloat(amount),
      slippage_tolerance: slippage
    });
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const fromHolding = holdings.find(h => h.symbol === fromToken);
  const estimatedRate = 2500; // Simplified - would come from real API

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Crypto Swap</h1>
          <p className="text-slate-400">Exchange tokens with AI-optimized routing</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Swap Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Instant Swap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* From Token */}
                <div>
                  <Label className="text-slate-400 mb-2 block">From</Label>
                  <div className="flex gap-3">
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map(token => (
                          <SelectItem key={token} value={token}>{token}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  {fromHolding && (
                    <p className="text-xs text-slate-400 mt-1">
                      Balance: {fromHolding.balance} {fromToken}
                    </p>
                  )}
                </div>

                {/* Switch Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={switchTokens}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <ArrowDownUp className="w-5 h-5" />
                  </Button>
                </div>

                {/* To Token */}
                <div>
                  <Label className="text-slate-400 mb-2 block">To</Label>
                  <div className="flex gap-3">
                    <Select value={toToken} onValueChange={setToToken}>
                      <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.filter(t => t !== fromToken).map(token => (
                          <SelectItem key={token} value={token}>{token}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount ? (parseFloat(amount) * estimatedRate).toFixed(4) : ''}
                      readOnly
                      className="flex-1 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Slippage */}
                <div>
                  <Label className="text-slate-400 mb-2 block">Slippage Tolerance</Label>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map(value => (
                      <Button
                        key={value}
                        onClick={() => setSlippage(value)}
                        variant={slippage === value ? 'default' : 'outline'}
                        size="sm"
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Rate</span>
                    <span className="text-white">1 {fromToken} = {estimatedRate} {toToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Est. Gas Fee</span>
                    <span className="text-white">~$5.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Price Impact</span>
                    <span className="text-green-400">&lt; 0.1%</span>
                  </div>
                </div>

                <Button
                  onClick={handleSwap}
                  disabled={swapMutation.isPending || !amount}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  size="lg"
                >
                  {swapMutation.isPending ? 'Swapping...' : 'Swap Now'}
                </Button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>AI-optimized routing for best rates</span>
                </div>
              </CardContent>
            </Card>

            {/* 3D Visualizer */}
            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="p-0">
                <div className="h-[400px]">
                  <CryptoSwapVisualizer3D
                    fromToken={fromToken}
                    toToken={toToken}
                    swaps={recentSwaps}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Swaps */}
          <div>
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Swaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSwaps.slice(0, 10).map(swap => (
                    <div
                      key={swap.id}
                      className="bg-slate-800/50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">
                          {swap.from_token} → {swap.to_token}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          swap.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          swap.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {swap.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Amount: {swap.from_amount} {swap.from_token}</div>
                        <div>Received: {swap.to_amount?.toFixed(4)} {swap.to_token}</div>
                        {swap.ai_optimized && (
                          <div className="text-purple-400">🤖 AI Optimized</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}