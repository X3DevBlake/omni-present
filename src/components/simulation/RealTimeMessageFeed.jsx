import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealTimeMessageFeed() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
    
    const unsubscribe = base44.entities.CrossSimulationMessage.subscribe((event) => {
      if (event.type === 'create') {
        setMessages(prev => [event.data, ...prev].slice(0, 20));
      }
    });

    return unsubscribe;
  }, []);

  const loadMessages = async () => {
    const msgs = await base44.entities.CrossSimulationMessage.list('-created_date', 20);
    setMessages(msgs);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        Live Message Feed
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded p-3"
          >
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/80 text-xs">
                    {msg.from_simulation_id?.slice(0, 8)} → {msg.to_simulation_id?.slice(0, 8)}
                  </p>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    msg.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-white text-sm">{msg.message_type}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}