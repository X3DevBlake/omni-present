import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight, Bot, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeCommunicationVisualizer({ communications = [], agents = [] }) {
  const [activeMessages, setActiveMessages] = useState([]);

  useEffect(() => {
    // Keep only last 10 messages
    setActiveMessages(communications.slice(-10));
  }, [communications]);

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || agentId;
  };

  const getAgentColor = (agentId) => {
    const colors = ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];
    const index = agents.findIndex(a => a.id === agentId);
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/60 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Real-Time Communication Stream
          <Badge className="ml-auto bg-green-500/20 text-green-400 animate-pulse">
            ● Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activeMessages.map((comm, idx) => (
              <motion.div
                key={comm.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getAgentColor(comm.from_agent_id) + '40' }}
                  >
                    <Bot className="w-4 h-4" style={{ color: getAgentColor(comm.from_agent_id) }} />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {getAgentName(comm.from_agent_id)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getAgentColor(comm.to_agent_id) + '40' }}
                  >
                    <Bot className="w-4 h-4" style={{ color: getAgentColor(comm.to_agent_id) }} />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {getAgentName(comm.to_agent_id)}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(comm.created_date).toLocaleTimeString()}
                  </span>
                </div>
                <div className="ml-11 text-sm text-gray-300">
                  {comm.message_content || comm.message || 'Coordinating task...'}
                </div>
                {comm.message_type && (
                  <Badge variant="outline" className="ml-11 mt-2 text-xs">
                    {comm.message_type}
                  </Badge>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {activeMessages.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active communications yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}