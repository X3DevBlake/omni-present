import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LiquidityPoolManager({ userEmail }) {
  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Droplets className="w-5 h-5 text-blue-400" />
        Liquidity Pool Manager
      </h3>
      <p className="text-white/60 text-center py-8">Liquidity pool management coming soon...</p>
    </Card>
  );
}