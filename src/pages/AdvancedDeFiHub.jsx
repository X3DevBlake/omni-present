import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Bot, Zap, Activity, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DeFiPortfolio3D from '../components/defi/DeFiPortfolio3D';

export default function AdvancedDeFiHub() {
  const queryClient = useQueryClient();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const { data: strategies } = useQuery({
    queryKey: ['trading-strategies'],
    queryFn: () => base44.entities.TradingStrategy.list(),
  });

  const { data: predictions } = useQuery({
    queryKey: ['market-predictions'],
    queryFn: () => base44.entities.MarketPrediction.list('-created_date', 10),
  });

  const { data: trades } = useQuery({
    queryKey: ['trade-executions'],
    queryFn: () => base44.entities.TradeExecution.list('-created_date', 50),
    refetchInterval: 5000,
  });

  const predictMarket = useMutation({
    mutationFn: async (token) => {
      const response = await base44.functions.invoke('predictMarketMovement', {
        token_symbol: token,
        timeframe: '24h',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-predictions'] });
    },
  });

  const executeStrategy = useMutation({
    mutationFn: async (strategyId) => {
      const response = await base44.functions.invoke('executeAITradingStrategy', {
        strategy_id: strategyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-executions', 'trading-strategies'] });
    },
  });

  const portfolioValue = React.useMemo(() => {
    return trades?.slice(0, 30).map((_, i) => ({
      day: `Day ${i + 1}`,
      value: 10000 + i * 150 + Math.random() * 500,
      pnl: (i * 15) + Math.random() * 50,
    }));
  }, [trades]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              AI-Powered DeFi Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Advanced market prediction and automated trading strategies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">${(portfolioValue?.[portfolioValue.length - 1]?.value || 0).toLocaleString()}</p>
            <p className="text-white/60 text-sm">Portfolio Value</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Bot className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{strategies?.filter(s => s.is_active).length || 0}</p>
            <p className="text-white/60 text-sm">Active Strategies</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Activity className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{trades?.length || 0}</p>
            <p className="text-white/60 text-sm">Total Trades</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">+{(portfolioValue?.[portfolioValue.length - 1]?.pnl || 0).toFixed(1)}%</p>
            <p className="text-white/60 text-sm">Total Return</p>
          </Card>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="strategies">Trading Strategies</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio 3D</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Market Predictions</CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => predictMarket.mutate(selectedToken)}
                      disabled={predictMarket.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {predictMarket.isPending ? 'Analyzing...' : 'Predict'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {predictMarket.data && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm mb-1">Predicted Change</div>
                        <div className={`text-2xl font-bold ${
                          predictMarket.data.predicted_price_change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {predictMarket.data.predicted_price_change > 0 ? '+' : ''}
                          {predictMarket.data.predicted_price_change.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-white/60 text-sm mb-1">Confidence</div>
                        <div className="text-cyan-400 text-2xl font-bold">
                          {predictMarket.data.confidence.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Badge className="bg-orange-500 mb-2">{predictMarket.data.risk_level} Risk</Badge>
                      <Badge className="bg-cyan-500 ml-2">{predictMarket.data.recommended_action}</Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3 mb-3">
                      <div className="text-white/60 text-sm mb-2">Key Factors:</div>
                      {predictMarket.data.key_factors?.map((factor, i) => (
                        <div key={i} className="text-white/80 text-sm">• {factor}</div>
                      ))}
                    </div>

                    <div className="text-white/70 text-sm">
                      <strong>Market Sentiment:</strong> {predictMarket.data.market_sentiment}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {predictions?.slice(0, 4).map((pred, i) => (
                    <div key={pred.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge>{pred.token_symbol}</Badge>
                        <span className="text-white/60 text-xs">
                          {new Date(pred.created_date).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`text-xl font-bold ${
                        pred.predicted_value > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pred.predicted_value > 0 ? '+' : ''}{pred.predicted_value?.toFixed(2)}%
                      </div>
                      <div className="text-white/60 text-sm">
                        Confidence: {pred.confidence_score?.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies?.map((strategy, i) => (
                <Card key={strategy.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{strategy.strategy_name}</h3>
                        <Badge>{strategy.strategy_type}</Badge>
                      </div>
                      <Badge className={strategy.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {strategy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Trades</div>
                        <div className="text-white font-bold">{strategy.performance_metrics?.total_trades || 0}</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Win Rate</div>
                        <div className="text-green-400 font-bold">
                          {strategy.performance_metrics?.total_trades > 0 
                            ? ((strategy.performance_metrics.winning_trades / strategy.performance_metrics.total_trades) * 100).toFixed(0)
                            : 0}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">P/L</div>
                        <div className="text-cyan-400 font-bold">
                          {strategy.performance_metrics?.total_profit_loss?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => executeStrategy.mutate(strategy.id)}
                      disabled={!strategy.is_active || executeStrategy.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Execute Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">3D Portfolio Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <DeFiPortfolio3D trades={trades} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={portfolioValue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    <Line type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={3} name="Portfolio Value" />
                    <Line type="monotone" dataKey="pnl" stroke="#00f5ff" strokeWidth={2} name="P/L %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}