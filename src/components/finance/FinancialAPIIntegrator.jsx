import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function FinancialAPIIntegrator() {
  const [connectedServices, setConnectedServices] = useState([
    { id: 1, name: 'Coinbase', status: 'connected', lastSync: new Date(Date.now() - 30000) },
    { id: 2, name: 'Alpha Vantage', status: 'connected', lastSync: new Date(Date.now() - 60000) }
  ]);
  const [marketData, setMarketData] = useState([
    { time: '10:00', BTC: 49800, ETH: 2950, SPY: 485 },
    { time: '10:30', BTC: 50200, ETH: 2980, SPY: 486 },
    { time: '11:00', BTC: 50500, ETH: 3020, SPY: 487 },
    { time: '11:30', BTC: 50100, ETH: 2990, SPY: 485 }
  ]);
  const [activeActions, setActiveActions] = useState([]);

  const executeAction = (action) => {
    const newAction = {
      id: Date.now(),
      name: action,
      status: 'executing',
      timestamp: new Date()
    };
    setActiveActions(prev => [...prev, newAction]);

    setTimeout(() => {
      setActiveActions(prev => 
        prev.map(a => a.id === newAction.id ? { ...a, status: 'completed' } : a)
      );
      toast.success(`${action} completed`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Connected Financial APIs
          </h3>
          <div className="space-y-2">
            {connectedServices.map(service => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-green-500/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-bold text-sm">{service.name}</p>
                  <p className="text-white/60 text-xs">Last sync: {service.lastSync.toLocaleTimeString()}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Proactive Actions
          </h3>
          <div className="space-y-2">
            {[
              'Rebalance Portfolio',
              'Execute Limit Orders',
              'Stop Loss Triggers',
              'Yield Farm Optimization'
            ].map((action, i) => (
              <motion.button
                key={i}
                onClick={() => executeAction(action)}
                whileHover={{ scale: 1.02 }}
                className="w-full py-2 text-left px-3 bg-white/5 border border-cyan-500/20 text-cyan-300 rounded text-sm hover:bg-cyan-500/10 transition-all"
              >
                ► {action}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold">Real-Time Market Data</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" />
            <YAxis stroke="rgba(255,255,255,0.4)" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(0,245,255,0.3)' }} />
            <Line type="monotone" dataKey="BTC" stroke="#f7931a" strokeWidth={2} />
            <Line type="monotone" dataKey="ETH" stroke="#627eea" strokeWidth={2} />
            <Line type="monotone" dataKey="SPY" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {activeActions.length > 0 && (
        <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold">Active Operations</h3>
          <div className="space-y-2">
            {activeActions.map(action => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-purple-500/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-bold text-sm">{action.name}</p>
                  <p className="text-white/60 text-xs">{action.timestamp.toLocaleTimeString()}</p>
                </div>
                {action.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}