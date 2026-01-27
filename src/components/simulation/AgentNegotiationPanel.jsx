import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Handshake, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentNegotiationPanel() {
  const [logs, setLogs] = useState([
    { id: 1, agent: 'Strategist', action: 'Proposed resource swap', details: 'Offering 500 COMPUTE for 200 STORAGE', timestamp: '10:42:01' },
    { id: 2, agent: 'Analyst', action: 'Evaluated proposal', details: 'Risk: Low. Benefit: High.', timestamp: '10:42:05' },
    { id: 3, agent: 'Negotiator', action: 'Accepted', details: 'Transaction executed on chain.', timestamp: '10:42:08' }
  ]);

  return (
    <Card className="bg-black/50 border-white/10 backdrop-blur-md h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Handshake className="w-5 h-5 text-green-400" />
          Live Negotiations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto space-y-3 pr-2">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-cyan-300">{log.agent}</span>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
                <div className="text-white mb-1">{log.action}</div>
                <div className="text-xs text-gray-400">{log.details}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
            <span>Emergent Strategy</span>
            <Badge variant="outline" className="border-purple-500 text-purple-400">Cooperative</Badge>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-full w-[75%]" />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">75% Alignment</div>
        </div>
      </CardContent>
    </Card>
  );
}