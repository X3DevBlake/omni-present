import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Zap, Check, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InterAgentCommunication() {
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(simulateMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const user = await base44.auth.me();
      const userAgents = await base44.entities.Agent.list();
      setAgents(userAgents.slice(0, 5));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const simulateMessages = () => {
    if (agents.length === 0) return;

    const sampleMessages = [
      {
        from: agents[Math.floor(Math.random() * agents.length)],
        to: agents[Math.floor(Math.random() * agents.length)],
        type: 'research_finding',
        content: 'Discovered novel trading pattern in OMNI/USDT pair correlation',
        timestamp: new Date(),
        status: 'delivered'
      },
      {
        from: agents[Math.floor(Math.random() * agents.length)],
        to: agents[Math.floor(Math.random() * agents.length)],
        type: 'data_request',
        content: 'Requesting 24h market volatility data for simulation accuracy',
        timestamp: new Date(),
        status: 'pending'
      },
      {
        from: agents[Math.floor(Math.random() * agents.length)],
        to: agents[Math.floor(Math.random() * agents.length)],
        type: 'strategy_update',
        content: 'Adjusting trading strategy based on simulation results',
        timestamp: new Date(),
        status: 'delivered'
      }
    ];

    setMessages(prev => [...sampleMessages.slice(0, 2), ...prev].slice(0, 20));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent) return;

    const message = {
      from: 'user',
      to: selectedAgent,
      type: 'user_command',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [
        {
          from: selectedAgent,
          to: 'user',
          type: 'acknowledgment',
          content: 'Message received and processing...',
          timestamp: new Date(),
          status: 'delivered'
        },
        ...prev
      ]);
    }, 1000);
  };

  const getMessageColor = (type) => {
    const colors = {
      research_finding: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      data_request: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
      strategy_update: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      acknowledgment: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      user_command: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    };
    return colors[type] || colors.acknowledgment;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Agent Selection */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 h-96 overflow-hidden flex flex-col">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Available Agents
        </h3>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {agents.map(agent => (
            <motion.button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              whileHover={{ x: 5 }}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold text-sm">{agent.name}</div>
              <div className="text-xs text-white/40">{agent.status || 'idle'}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Message Feed */}
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 flex flex-col h-96">
        <h3 className="text-white font-bold mb-3">Inter-Agent Communications</h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/40 text-sm">
                Waiting for agent communications...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-gradient-to-r ${getMessageColor(msg.type)} border rounded-lg p-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm truncate">
                          {typeof msg.from === 'string' ? msg.from : msg.from?.name || 'Agent'}
                        </span>
                        <span className="text-white/40 text-xs">→</span>
                        <span className="text-white/70 text-sm truncate">
                          {typeof msg.to === 'string' ? msg.to : msg.to?.name || 'System'}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs mt-1 break-words">{msg.content}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(msg.status)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        {selectedAgent && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Send task/query to agent..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}