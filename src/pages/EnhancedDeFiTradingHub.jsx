import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import CryptoMarketTrends3D from '@/components/defi/CryptoMarketTrends3D';
import LiquidityPoolOcean3D from '@/components/defi/LiquidityPoolOcean3D';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

export default function EnhancedDeFiTradingHub() {
  const queryClient = useQueryClient();

  const { data: cryptoAssets = [] } = useQuery({
    queryKey: ['crypto-assets'],
    queryFn: () => base44.entities.CryptoAssetData.list()
  });

  const { data: liquidityPools = [] } = useQuery({
    queryKey: ['liquidity-pools'],
    queryFn: () => base44.entities.EnhancedLiquidityPool.list()
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['trading-strategies'],
    queryFn: () => base44.entities.TradingStrategy.list()
  });

  const scanArbitrageMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('scanArbitrageOpportunities', {
        token_pairs: ['ETH/USDT', 'BTC/USDT'],
        min_profit_threshold: 1.0
      });
      return response.data;
    }
  });

  const totalMarketCap = cryptoAssets.reduce((sum, a) => sum + (a.market_cap || 0), 0);
  const totalTVL = liquidityPools.reduce((sum, p) => sum + (p.tvl_usd || 0), 0);
  const activeStrategies = strategies.filter(s => s.is_active).length;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <TrendingUp className="w-12 h-12 text-cyan-400" />
            Enhanced DeFi Trading Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered crypto trading and liquidity management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">${(totalMarketCap / 1e9).toFixed(2)}B</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total TVL</p>
                  <p className="text-2xl font-bold text-white">${(totalTVL / 1e6).toFixed(2)}M</p>
                </div>
                <Activity className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Strategies</p>
                  <p className="text-3xl font-bold text-white">{activeStrategies}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tracked Assets</p>
                  <p className="text-3xl font-bold text-white">{cryptoAssets.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="market" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="market">Market Cityscape</TabsTrigger>
            <TabsTrigger value="pools">Liquidity Ocean</TabsTrigger>
            <TabsTrigger value="strategies">Trading Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <CryptoMarketTrends3D tokens={cryptoAssets} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pools">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <LiquidityPoolOcean3D pools={liquidityPools} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies">
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{strategy.strategy_name}</h3>
                          <Badge className={strategy.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                            {strategy.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                            {strategy.strategy_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          <p>Total Trades: {strategy.performance_metrics?.total_trades || 0}</p>
                          <p>Win Rate: {strategy.performance_metrics?.total_trades > 0 
                            ? ((strategy.performance_metrics.winning_trades / strategy.performance_metrics.total_trades) * 100).toFixed(1)
                            : 0}%</p>
                          <p>P/L: ${strategy.performance_metrics?.total_profit_loss?.toFixed(2) || 0}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}