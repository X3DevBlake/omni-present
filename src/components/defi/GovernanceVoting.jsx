import React from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GovernanceVoting({ userEmail }) {
  const proposals = [
    { id: 1, title: 'Increase OMNI rewards pool by 25%', votes: 8420, percent: 72 },
    { id: 2, title: 'Deploy on Arbitrum network', votes: 6850, percent: 65 },
    { id: 3, title: 'Introduce governance staking tier', votes: 5320, percent: 58 },
  ];

  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Vote className="w-5 h-5 text-indigo-400" />
        Active Governance Votes
      </h3>
      <div className="space-y-4">
        {proposals.map((prop, idx) => (
          <motion.div
            key={prop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-black/40 border border-white/10 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-semibold">{prop.title}</p>
            </div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <p className="text-white/60">{prop.votes.toLocaleString()} votes</p>
              <p className="text-indigo-400 font-bold">{prop.percent}% approval</p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prop.percent}%` }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                className="h-full bg-indigo-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}