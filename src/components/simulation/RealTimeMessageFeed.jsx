import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Shield, Lock, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RealTimeMessageFeed() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedType, setSelectedType] = useState('data_exchange');

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

  const sendEncryptedMessage = async () => {
    if (!newMessage.trim()) return;
    
    const encrypted = btoa(newMessage);
    
    await base44.entities.CrossSimulationMessage.create({
      from_agent_id: 'current_agent',
      from_simulation_id: 'sim_1',
      to_agent_id: 'target_agent',
      to_simulation_id: 'sim_2',
      message_type: selectedType,
      encrypted_payload: encrypted,
      status: 'pending'
    });
    
    setNewMessage('');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        Live Message Feed
        <Lock className="w-4 h-4 text-green-400 ml-auto" />
      </h3>

      <div className="mb-4 flex gap-2">
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
        >
          <option value="data_exchange">Data Exchange</option>
          <option value="collaboration_request">Collaboration</option>
          <option value="knowledge_share">Knowledge Share</option>
          <option value="alert">Alert</option>
        </select>
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Encrypted message..."
          className="bg-white/5 border-white/10 text-white"
        />
        <Button onClick={sendEncryptedMessage} size="sm" className="bg-purple-500 hover:bg-purple-600">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
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