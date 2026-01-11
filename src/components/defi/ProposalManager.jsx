import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProposalManager({ userEmail }) {
  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-cyan-400" />
        Create & Manage Proposals
      </h3>
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-black/40 border border-white/10 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-white font-semibold">Pending Voting</p>
              <p className="text-white/60 text-sm">2 proposals waiting for your vote</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-lg hover:bg-indigo-500/40 transition-all">
            Vote Now
          </button>
        </motion.div>
      </div>
    </Card>
  );
}