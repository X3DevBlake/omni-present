import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle } from 'lucide-react';

const SUGGESTED_ACTIONS = [
  {
    id: 1,
    action: 'Rebalance portfolio',
    reason: 'Market volatility increased 15%, recommend defensive positioning',
    confidence: 94,
    hubSource: 'Banking',
  },
  {
    id: 2,
    action: 'Run device diagnostics',
    reason: 'Device-5 showing unusual CPU patterns, recommend health check',
    confidence: 87,
    hubSource: 'Devices',
  },
  {
    id: 3,
    action: 'Update agent parameters',
    reason: 'Current strategy underperforming vs. market conditions',
    confidence: 92,
    hubSource: 'AI Labs',
  },
  {
    id: 4,
    action: 'Trigger backup simulation',
    reason: 'Simulation indicates risk threshold approaching',
    confidence: 78,
    hubSource: 'Simulations',
  },
];

export default function SuggestedActionsPanel() {
  const [executed, setExecuted] = useState([]);

  const handleExecute = (id) => {
    setExecuted([...executed, id]);
    setTimeout(() => {
      setExecuted((prev) => prev.filter((i) => i !== id));
    }, 3000);
  };

  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" /> AI-Suggested Actions
      </h3>
      <div className="space-y-3">
        {SUGGESTED_ACTIONS.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{action.action}</p>
                <p className="text-white/60 text-xs mt-1">{action.reason}</p>
              </div>
              <Badge className="bg-cyan-500/30 text-cyan-300 text-xs ml-2">{action.hubSource}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full"
                    style={{ width: `${action.confidence}%` }}
                  />
                </div>
                <span className="text-white/60 text-xs">{action.confidence}% confidence</span>
              </div>

              {executed.includes(action.id) ? (
                <Button disabled size="sm" className="bg-green-600/50">
                  <CheckCircle className="w-3 h-3 mr-1" /> Executed
                </Button>
              ) : (
                <Button onClick={() => handleExecute(action.id)} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  Execute
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}