import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionManagementAI() {
  const subscriptions = [
    { name: 'Netflix', cost: 15.99, status: 'active', usage: 'high', recommendation: 'keep' },
    { name: 'Spotify', cost: 9.99, status: 'active', usage: 'medium', recommendation: 'keep' },
    { name: 'Gym Membership', cost: 49.99, status: 'active', usage: 'low', recommendation: 'cancel' },
    { name: 'Cloud Storage', cost: 19.99, status: 'active', usage: 'medium', recommendation: 'downgrade' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-purple-400" />
        AI Subscription Manager
      </h3>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="text-green-400 font-bold text-lg">Potential Monthly Savings: $70</div>
        <div className="text-white/60 text-sm">Based on usage patterns and AI recommendations</div>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-white font-bold">{sub.name}</div>
                {sub.recommendation === 'cancel' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                {sub.recommendation === 'keep' && <CheckCircle className="w-4 h-4 text-green-400" />}
              </div>
              <div className="text-white font-bold">${sub.cost}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white/60 text-sm">Usage: {sub.usage}</div>
              <div className={`text-xs px-2 py-1 rounded ${
                sub.recommendation === 'cancel' ? 'bg-red-500/20 text-red-400' :
                sub.recommendation === 'downgrade' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {sub.recommendation}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}