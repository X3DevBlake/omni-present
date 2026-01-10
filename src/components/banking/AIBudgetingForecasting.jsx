import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIBudgetingForecasting() {
  const [forecast, setForecast] = useState({
    nextMonth: { income: 8500, expenses: 6200, savings: 2300 },
    confidence: 87
  });

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-cyan-400" />
        AI Budget Forecasting
      </h3>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-green-400 text-sm mb-1">Predicted Income</div>
          <div className="text-white font-bold text-2xl">${forecast.nextMonth.income}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-red-400 text-sm mb-1">Predicted Expenses</div>
          <div className="text-white font-bold text-2xl">${forecast.nextMonth.expenses}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-purple-400 text-sm mb-1">Predicted Savings</div>
          <div className="text-white font-bold text-2xl">${forecast.nextMonth.savings}</div>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">AI Confidence</div>
          <div className="text-cyan-400 font-bold">{forecast.confidence}%</div>
        </div>
        <div className="mt-2 h-2 bg-black/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            style={{ width: `${forecast.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}