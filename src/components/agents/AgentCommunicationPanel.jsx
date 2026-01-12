import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, Video, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentCommunicationPanel({ agents, interactions, userEmail }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAgentA, setSelectedAgentA] = useState(null);
  const [selectedAgentB, setSelectedAgentB] = useState(null);
  const [message, setMessage] = useState('');
  const [commType, setCommType] = useState('text');

  const initiateComm = async () => {
    if (!selectedAgentA || !selectedAgentB || !message) return;

    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Agent ${selectedAgentA} initiates ${commType} communication with ${selectedAgentB}.
Message: "${message}"
Execute via ${commType === 'text' ? 'Slack' : commType === 'voice' ? 'Twilio' : 'Video'} integration.`,
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            channel: { type: 'string' }
          }
        }
      });

      setMessage('');
      alert('Communication initiated!');
    } catch (error) {
      console.error('Communication error:', error);
    }
  };

  return (
    <AnimatePresence>
      {!expanded ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => setExpanded(true)}
          className="w-full bg-black/80 backdrop-blur-sm border border-cyan-400/50 rounded-t-xl p-3 hover:bg-black/90 transition-all"
        >
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Agent Communication Hub</span>
            <span className="text-xs bg-cyan-400/20 px-2 py-1 rounded-full">
              {interactions.length} recent
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-black/90 backdrop-blur-sm border border-cyan-400/50 rounded-t-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Agent Communication Hub
            </h3>
            <button onClick={() => setExpanded(false)} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Agent A Selector */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">From Agent</label>
              <select
                value={selectedAgentA || ''}
                onChange={(e) => setSelectedAgentA(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              >
                <option value="">Select Agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            {/* Agent B Selector */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">To Agent</label>
              <select
                value={selectedAgentB || ''}
                onChange={(e) => setSelectedAgentB(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              >
                <option value="">Select Agent</option>
                {agents.filter(a => a.id !== selectedAgentA).map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Communication Type */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setCommType('text')}
              className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 ${
                commType === 'text'
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                  : 'bg-white/5 text-white/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setCommType('voice')}
              className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 ${
                commType === 'voice'
                  ? 'bg-green-500/20 border border-green-400 text-green-300'
                  : 'bg-white/5 text-white/60'
              }`}
            >
              <Phone className="w-4 h-4" />
              Voice
            </button>
            <button
              onClick={() => setCommType('video')}
              className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 ${
                commType === 'video'
                  ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
                  : 'bg-white/5 text-white/60'
              }`}
            >
              <Video className="w-4 h-4" />
              Video
            </button>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
            />
            <button
              onClick={initiateComm}
              disabled={!selectedAgentA || !selectedAgentB || !message}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded hover:bg-cyan-500/30 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Interactions */}
          <div className="mt-4 max-h-32 overflow-y-auto space-y-1">
            <p className="text-white/60 text-xs mb-2">Recent Interactions</p>
            {interactions.slice(0, 5).map((interaction, idx) => (
              <div key={idx} className="bg-white/5 rounded p-2 text-xs">
                <p className="text-cyan-400">
                  {agents.find(a => a.id === interaction.agent_a_id)?.name} → {' '}
                  {agents.find(a => a.id === interaction.agent_b_id)?.name}
                </p>
                <p className="text-white/60 truncate">{interaction.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}