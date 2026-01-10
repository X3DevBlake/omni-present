import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Play, Pause, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CryptoTradingBot({ userEmail }) {
  const [showConfig, setShowConfig] = React.useState(false);
  const [botConfig, setBotConfig] = React.useState({
    name: 'My Trading Bot',
    exchange: 'binance',
    strategy: 'dca',
    riskLevel: 'moderate',
    dailyLossLimit: 5,
  });

  const { data: bots = [] } = useQuery({
    queryKey: ['tradingBots', userEmail],
    queryFn: () => base44.entities.TradingBot.filter({ user_email: userEmail }).catch(() => []),
    enabled: !!userEmail,
  });

  const createBot = useMutation({
    mutationFn: async (config) => {
      return await base44.entities.TradingBot.create({
        user_email: userEmail,
        ...config
      });
    },
    onSuccess: () => {
      setShowConfig(false);
    }
  });

  const startBot = useMutation({
    mutationFn: async (botId) => {
      return await base44.entities.TradingBot.update(botId, { status: 'running' });
    }
  });

  const perfData = [
    { day: 'Mon', pnl: 250 },
    { day: 'Tue', pnl: 420 },
    { day: 'Wed', pnl: 380 },
    { day: 'Thu', pnl: 550 },
    { day: 'Fri', pnl: 720 },
  ];

  return (
    <div className="space-y-6">
      {!showConfig && bots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 text-center"
        >
          <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Create Your Trading Bot</h3>
          <p className="text-white/60 mb-4">Set up an automated crypto trading bot with custom strategies</p>
          <Button
            onClick={() => setShowConfig(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Create Bot
          </Button>
        </motion.div>
      ) : null}

      {showConfig && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-white">Configure Trading Bot</h3>

          <Input
            placeholder="Bot name"
            value={botConfig.name}
            onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
          />

          <select
            value={botConfig.exchange}
            onChange={(e) => setBotConfig({ ...botConfig, exchange: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
          >
            <option value="binance">Binance</option>
            <option value="coinbase">Coinbase</option>
            <option value="kraken">Kraken</option>
            <option value="bybit">Bybit</option>
          </select>

          <select
            value={botConfig.strategy}
            onChange={(e) => setBotConfig({ ...botConfig, strategy: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
          >
            <option value="dca">DCA (Dollar Cost Averaging)</option>
            <option value="grid">Grid Trading</option>
            <option value="momentum">Momentum</option>
            <option value="arbitrage">Arbitrage</option>
          </select>

          <div className="flex gap-2">
            <Button
              onClick={() => createBot.mutate(botConfig)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              Create Bot
            </Button>
            <Button
              onClick={() => setShowConfig(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Active Bots */}
      {bots.map((bot, idx) => (
        <motion.div
          key={bot.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-white font-bold text-lg">{bot.bot_name}</h4>
              <p className="text-white/60 text-sm capitalize">{bot.exchange} • {bot.strategy}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              bot.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {bot.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/60 text-xs">Total P&L</p>
              <p className="text-2xl font-bold text-white mt-1">${bot.total_pnl || 0}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Win Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{bot.win_rate || 0}%</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" height={20} />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => startBot.mutate(bot.id)}
              disabled={bot.status === 'running'}
              className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button
              variant="outline"
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}