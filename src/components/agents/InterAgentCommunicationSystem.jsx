import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Network, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function InterAgentCommunicationSystem() {
  const [agents] = useState([
    { id: 1, name: 'Portfolio Manager', status: 'active' },
    { id: 2, name: 'Market Analyzer', status: 'active' },
    { id: 3, name: 'Risk Controller', status: 'active' }
  ]);

  const [communicationLog, setCommunicationLog] = useState([
    { from: 'Portfolio Manager', to: 'Market Analyzer', message: 'What are current market trends?', timestamp: Date.now() - 10000, priority: 'high' },
    { from: 'Market Analyzer', to: 'Portfolio Manager', message: 'Bullish signals detected on BTC. Recommend 30% position increase', timestamp: Date.now() - 5000, priority: 'high' },
    { from: 'Risk Controller', to: 'Portfolio Manager', message: 'Risk parameters within limits. Approval granted.', timestamp: Date.now() - 1000, priority: 'normal' }
  ]);

  const [messageForm, setMessageForm] = useState({
    from: 'Portfolio Manager',
    to: 'Market Analyzer',
    message: '',
    priority: 'normal'
  });

  const sendMessage = () => {
    if (!messageForm.message.trim()) {
      toast.error('Enter a message');
      return;
    }

    const newMessage = {
      from: messageForm.from,
      to: messageForm.to,
      message: messageForm.message,
      timestamp: Date.now(),
      priority: messageForm.priority
    };

    setCommunicationLog(prev => [newMessage, ...prev]);
    setMessageForm({ ...messageForm, message: '' });
    toast.success(`Message sent from ${messageForm.from} to ${messageForm.to}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-indigo-500/30 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <p className="text-white font-bold text-sm">{agent.name}</p>
            </div>
            <p className="text-white/60 text-xs">Status: {agent.status}</p>
            <p className="text-white/50 text-xs">Latency: &lt;50ms</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Message
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-xs block mb-1">From Agent</label>
              <select
                value={messageForm.from}
                onChange={(e) => setMessageForm({ ...messageForm, from: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                {agents.map(a => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">To Agent</label>
              <select
                value={messageForm.to}
                onChange={(e) => setMessageForm({ ...messageForm, to: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                {agents.filter(a => a.name !== messageForm.from).map(a => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Priority</label>
              <select
                value={messageForm.priority}
                onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <textarea
              placeholder="Enter message..."
              value={messageForm.message}
              onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-24"
            />
            <motion.button
              onClick={sendMessage}
              whileHover={{ scale: 1.02 }}
              className="w-full py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded font-medium text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Message
            </motion.button>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Network className="w-5 h-5" />
            Communication Log
          </h3>
          <div className="h-80 overflow-y-auto space-y-2">
            {communicationLog.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white/5 border rounded p-3 text-xs ${
                  msg.priority === 'high' ? 'border-red-500/30' :
                  msg.priority === 'normal' ? 'border-white/10' :
                  'border-blue-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-cyan-400 font-bold">{msg.from} → {msg.to}</p>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    msg.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    msg.priority === 'normal' ? 'bg-white/10 text-white/60' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {msg.priority}
                  </span>
                </div>
                <p className="text-white/80">{msg.message}</p>
                <p className="text-white/40 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-400" />
          Communication Protocol
        </h3>
        <div className="grid lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/70 font-bold">Encryption</p>
            <p className="text-white/50 text-xs mt-1">End-to-end TLS 1.3</p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/70 font-bold">Message Queue</p>
            <p className="text-white/50 text-xs mt-1">RabbitMQ w/ priority</p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/70 font-bold">Latency</p>
            <p className="text-white/50 text-xs mt-1">Average &lt;100ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}