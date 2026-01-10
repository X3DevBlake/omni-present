import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Handshake, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentNegotiationSimulator() {
  const [negotiations, setNegotiations] = useState([]);
  const [activeNegotiation, setActiveNegotiation] = useState(null);

  const startNegotiation = () => {
    const newNeg = {
      id: Date.now(),
      agents: ['Agent Alpha', 'Agent Beta'],
      topic: ['Resource Sharing', 'Territory Rights', 'Task Distribution'][Math.floor(Math.random() * 3)],
      offers: [],
      status: 'active',
    };
    setNegotiations([newNeg, ...negotiations]);
    setActiveNegotiation(newNeg.id);
    
    // Simulate negotiation rounds
    setTimeout(() => simulateRound(newNeg.id), 1000);
  };

  const simulateRound = (negId) => {
    setNegotiations(prev => prev.map(n => {
      if (n.id === negId && n.offers.length < 5) {
        const agent = n.agents[n.offers.length % 2];
        const value = Math.random() * 100;
        return {
          ...n,
          offers: [...n.offers, { agent, value: value.toFixed(0), accepted: false }]
        };
      } else if (n.id === negId) {
        return { ...n, status: 'completed' };
      }
      return n;
    }));
    
    const neg = negotiations.find(n => n.id === negId);
    if (neg && neg.offers.length < 4) {
      setTimeout(() => simulateRound(negId), 1500);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Handshake className="w-6 h-6 text-blue-400" />
        Agent Negotiation & Diplomacy
      </h3>

      <Button onClick={startNegotiation} className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-500">
        Start New Negotiation
      </Button>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {negotiations.map(neg => (
          <motion.div
            key={neg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-semibold">{neg.agents[0]} ⇄ {neg.agents[1]}</div>
                <div className="text-white/60 text-sm">{neg.topic}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${
                neg.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {neg.status}
              </div>
            </div>
            
            <div className="space-y-2">
              {neg.offers.map((offer, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80">{offer.agent}</span>
                  <span className="text-white">offers {offer.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}