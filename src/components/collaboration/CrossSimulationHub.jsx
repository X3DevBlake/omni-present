import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Send, Shield, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CrossSimulationHub({ currentSimId, currentAgentId }) {
  const [simulations, setSimulations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newMessage, setNewMessage] = useState({
    targetSim: '',
    targetAgent: '',
    content: ''
  });

  useEffect(() => {
    loadData();
  }, [currentAgentId]);

  const loadData = async () => {
    const [sims, msgs, profiles] = await Promise.all([
      base44.entities.WorldSimulation.list(),
      base44.entities.CrossSimulationMessage.list(),
      base44.entities.PersistentAgentProfile.list({ agent_base_id: currentAgentId })
    ]);
    setSimulations(sims);
    setMessages(msgs.filter(m => m.from_agent_id === currentAgentId || m.to_agent_id === currentAgentId));
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const sendMessage = async () => {
    await base44.entities.CrossSimulationMessage.create({
      from_agent_id: currentAgentId,
      from_simulation_id: currentSimId,
      to_agent_id: newMessage.targetAgent,
      to_simulation_id: newMessage.targetSim,
      message_type: 'collaboration_request',
      encrypted_payload: btoa(newMessage.content),
      status: 'pending'
    });
    setNewMessage({ targetSim: '', targetAgent: '', content: '' });
    await loadData();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Cross-Simulation Communication
        </h3>
        
        {profile && (
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <p className="text-white font-semibold text-sm">Persistent Identity</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-white/60">Total XP</p>
                <p className="text-cyan-400 font-bold">{profile.total_experience_points}</p>
              </div>
              <div>
                <p className="text-white/60">Reputation</p>
                <p className="text-green-400 font-bold">{profile.reputation_score}/100</p>
              </div>
              <div>
                <p className="text-white/60">Simulations</p>
                <p className="text-purple-400 font-bold">{profile.cross_simulation_progress?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <input
            placeholder="Target Simulation ID"
            value={newMessage.targetSim}
            onChange={(e) => setNewMessage({...newMessage, targetSim: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 text-sm"
          />
          <input
            placeholder="Target Agent ID"
            value={newMessage.targetAgent}
            onChange={(e) => setNewMessage({...newMessage, targetAgent: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 text-sm"
          />
          <textarea
            placeholder="Message content..."
            value={newMessage.content}
            onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 text-sm h-20"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.targetSim || !newMessage.targetAgent || !newMessage.content}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Secure Message
          </button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded border ${msg.from_agent_id === currentAgentId ? 'bg-cyan-500/10 border-cyan-400/30 ml-8' : 'bg-purple-500/10 border-purple-400/30 mr-8'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3 h-3 text-white/60" />
                <p className="text-white/80 text-xs">
                  {msg.from_agent_id === currentAgentId ? 'Sent to' : 'Received from'} {msg.from_simulation_id.slice(0, 8)}
                </p>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs ${msg.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {msg.status}
                </span>
              </div>
              <p className="text-white text-sm">{msg.message_type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}