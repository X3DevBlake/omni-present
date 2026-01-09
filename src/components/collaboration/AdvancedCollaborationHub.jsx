import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Brain, Share2, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedCollaborationHub() {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Portfolio Team', agents: ['Agent-1', 'Agent-2'], goal: 'Optimize returns', memory: { shared: 15, private: 42 } }
  ]);
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [messages, setMessages] = useState([
    { agent: 'Agent-1', text: 'Detected bullish signal on BTC', timestamp: Date.now() - 5000 },
    { agent: 'Agent-2', text: 'Agree, rebalancing portfolio accordingly', timestamp: Date.now() - 2000 }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    setMessages(prev => [...prev, {
      agent: 'Lab Agent',
      text: messageInput,
      timestamp: Date.now()
    }]);
    setMessageInput('');
    toast.success('Message broadcast to team');
  };

  const createGoal = () => {
    if (!newGoal.trim()) {
      toast.error('Enter a goal');
      return;
    }
    setSelectedTeam(prev => ({
      ...prev,
      goal: newGoal
    }));
    setNewGoal('');
    setShowGoalForm(false);
    toast.success('Collaborative goal set');
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <motion.button
            key={team.id}
            onClick={() => setSelectedTeam(team)}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedTeam.id === team.id
                ? 'bg-purple-500/20 border-purple-500/60'
                : 'bg-black/40 border-white/10'
            }`}
          >
            <p className="text-white font-bold flex items-center gap-2">
              <Users className="w-4 h-4" /> {team.name}
            </p>
            <p className="text-white/60 text-xs mt-2">{team.agents.length} agents</p>
            <p className="text-white/50 text-xs mt-1">Goal: {team.goal}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">{team.memory.shared} shared</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">{team.memory.private} private</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Inter-Agent Communication
          </h3>
          <div className="h-64 bg-black/60 rounded-lg p-4 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded p-3"
              >
                <p className="text-cyan-400 font-bold text-sm">{msg.agent}</p>
                <p className="text-white/80 text-sm mt-1">{msg.text}</p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Broadcast message to team..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-medium"
            >
              Send
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Shared Memory
            </h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white/5 border border-cyan-500/20 rounded p-3">
                <p className="text-cyan-400 font-bold">Market Insights</p>
                <p className="text-white/60 text-xs mt-1">5 shared entries</p>
              </div>
              <div className="bg-white/5 border border-purple-500/20 rounded p-3">
                <p className="text-purple-400 font-bold">Strategy Notes</p>
                <p className="text-white/60 text-xs mt-1">8 shared entries</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Collaborative Goal
            </h3>
            <p className="text-white/80 text-sm bg-white/5 p-3 rounded">{selectedTeam.goal}</p>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="w-full py-2 border border-dashed border-white/30 text-white/60 rounded text-xs font-medium hover:text-white"
            >
              Update Goal
            </button>
            {showGoalForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <input
                  type="text"
                  placeholder="New collaborative goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 mb-2"
                />
                <button
                  onClick={createGoal}
                  className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded font-medium text-xs"
                >
                  Set Goal
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}