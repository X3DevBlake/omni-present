import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AutomatedDeFiStrategyBuilder() {
  const strategies = [
    { name: 'Conservative Staking', actions: 3, apy: 8.5, active: true },
    { name: 'Balanced LP', actions: 5, apy: 12.3, active: false }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Workflow className="w-6 h-6 text-purple-400" />
        Strategy Builder
      </h3>

      <div className="space-y-3 mb-4">
        {strategies.map((strategy, i) => (
          <div key={i} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold">{strategy.name}</div>
                <div className="text-white/60 text-sm">{strategy.actions} automated actions</div>
              </div>
              <div className="text-right">
                <div className="text-purple-400 font-bold">{strategy.apy}%</div>
                <div className={`text-xs ${strategy.active ? 'text-green-400' : 'text-white/60'}`}>
                  {strategy.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
        <Plus className="w-4 h-4 mr-2" />
        Create New Strategy
      </Button>
    </div>
  );
}