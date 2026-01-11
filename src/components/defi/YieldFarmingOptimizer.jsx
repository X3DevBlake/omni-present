import React from 'react';
import { Sprout } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function YieldFarmingOptimizer({ userEmail }) {
  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Sprout className="w-5 h-5 text-green-400" />
        Yield Farming Optimizer
      </h3>
      <p className="text-white/60 text-center py-8">Yield farming optimization coming soon...</p>
    </Card>
  );
}