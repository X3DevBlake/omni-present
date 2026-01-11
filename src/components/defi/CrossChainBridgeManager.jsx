import React from 'react';
import { GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CrossChainBridgeManager({ userEmail }) {
  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-cyan-400" />
        Cross-Chain Bridge Manager
      </h3>
      <p className="text-white/60 text-center py-8">Cross-chain bridging coming soon...</p>
    </Card>
  );
}