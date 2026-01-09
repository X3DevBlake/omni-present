import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EnhancedPoolCalculator({ pool }) {
  const [amount, setAmount] = useState('');
  const [timeframe, setTimeframe] = useState(30); // days

  const calculateProjection = () => {
    if (!amount || parseFloat(amount) <= 0) return [];

    const principal = parseFloat(amount);
    const dailyRate = (pool.current_apy / 100) / 365;
    const projections = [];

    for (let day = 0; day <= timeframe; day++) {
      const earned = principal * dailyRate * day;
      const total = principal + earned;
      
      projections.push({
        day,
        principal,
        earned: earned,
        total: total
      });
    }

    return projections;
  };

  const projectionData = calculateProjection();
  const finalEarnings = projectionData.length > 0 ? projectionData[projectionData.length - 1].earned : 0;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white font-bold text-xl">Earnings Calculator</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Deposit Amount (OMNI)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-2 block">Timeframe (Days)</label>
          <div className="flex gap-2">
            {[30, 90, 180, 365].map(days => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  timeframe === days
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {projectionData.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Projected Earnings</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-green-400 text-3xl font-bold">
              {finalEarnings.toFixed(2)} OMNI
            </div>
            <div className="text-white/60 text-xs mt-1">
              After {timeframe} days at {pool.current_apy.toFixed(2)}% APY
            </div>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="day" 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000000cc',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#00f5ff" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="earned" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <div className="flex items-start gap-2 text-yellow-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                APY is dynamic and changes with total deposits. Actual earnings may vary.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}