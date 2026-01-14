import React from 'react';
import EnhancedDeFiHub from '../components/defi/EnhancedDeFiHub';
import Enhanced3DVisualization from '../components/3d/Enhanced3DVisualization';
import { Coins, TrendingUp } from 'lucide-react';

export default function EnhancedDeFiHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Coins className="w-10 h-10 text-purple-500" />
            Enhanced DeFi Hub
          </h1>
          <p className="text-gray-600">
            Trade 30+ tokens, stake OMNI for sOMNI, provide liquidity, and farm yields
          </p>
        </div>

        <Enhanced3DVisualization />
        <EnhancedDeFiHub />
      </div>
    </div>
  );
}