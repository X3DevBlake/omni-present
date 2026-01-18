import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MessageCircle, CheckCircle, TrendingDown } from 'lucide-react';

export default function ProactiveAgentSystem() {
  const [proactiveMessages, setProactiveMessages] = useState([
    {
      id: 1,
      agent: 'Market-Monitor',
      initiatedReason: 'Unusual volatility detected',
      message: 'Market volatility has spiked 15% in the last hour. Recommend defensive positioning.',
      timestamp: '14:32:10',
      priority: 'high',
      dismissed: false,
    },
    {
      id: 2,
      agent: 'Device-Health',
      initiatedReason: 'Device performance degradation',
      message: 'Device-5 CPU usage exceeding normal patterns. Running diagnostics...',
      timestamp: '14:28:45',
      priority: 'medium',
      dismissed: false,
    },
  ]);

  const handleDismiss = (id) => {
    setProactiveMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, dismissed: true } : msg))
    );
  };

  const handleRespond = (id) => {
    setProactiveMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, responded: true } : msg))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Proactive Agent Initiations
        </h3>
        <Badge className="bg-cyan-500/30 text-cyan-300">{proactiveMessages.filter((m) => !m.dismissed).length} Active</Badge>
      </div>

      <AnimatePresence>
        {proactiveMessages
          .filter((m) => !m.dismissed)
          .map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`border rounded-lg p-4 ${
                msg.priority === 'high'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{msg.agent}</p>
                  <p className={`text-xs ${msg.priority === 'high' ? 'text-red-300' : 'text-yellow-300'}`}>
                    {msg.initiatedReason}
                  </p>
                </div>
                <span className="text-white/40 text-xs">{msg.timestamp}</span>
              </div>

              <p className="text-white/80 text-sm mb-3">{msg.message}</p>

              <div className="flex gap-2">
                <Button onClick={() => handleRespond(msg.id)} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Respond
                </Button>
                <Button onClick={() => handleDismiss(msg.id)} size="sm" variant="outline" className="text-xs">
                  Dismiss
                </Button>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}