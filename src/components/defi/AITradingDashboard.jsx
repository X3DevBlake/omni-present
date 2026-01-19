import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, TrendingUp, Zap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function AITradingDashboard() {
  const { data: tradingBots } = useQuery({
    queryKey: ['trading-bots'],
    queryFn: () => base44.entities.TradingBot.list(),
  });

  const { data: trades } = useQuery({
    queryKey: ['recent-trades'],
    queryFn: () => base44.entities.TradeExecution.list('-created_date', 50),
    refetchInterval: 5000,
  });

  const performanceData = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      profit: 100 + Math.random() * 50 - 25,
      volume: Math.floor(1000 + Math.random() * 5000),
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
          <Bot className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-white text-2xl font-bold">{tradingBots?.length || 0}</p>
          <p className="text-white/60 text-sm">Active Bots</p>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
          <Activity className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white text-2xl font-bold">{trades?.length || 0}</p>
          <p className="text-white/60 text-sm">24h Trades</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
          <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-white text-2xl font-bold">+23.5%</p>
          <p className="text-white/60 text-sm">24h Return</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <p className="text-white text-2xl font-bold">$125K</p>
          <p className="text-white/60 text-sm">24h Volume</p>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">AI Trading Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="hour" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Line type="monotone" dataKey="profit" stroke="#00ff88" strokeWidth={2} />
              <Line type="monotone" dataKey="volume" stroke="#00f5ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tradingBots?.slice(0, 4).map((bot, i) => (
          <Card key={bot.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{bot.strategy_name}</h3>
                <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Win Rate</div>
                  <div className="text-white font-bold">{(bot.win_rate || 65).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Trades</div>
                  <div className="text-white font-bold">{bot.total_trades || 0}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Profit</div>
                  <div className="text-green-400 font-bold">+{(bot.total_profit || 0).toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}