import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, GitMerge, Share2, Activity } from 'lucide-react';

export default function AgentCollaborationManager() {
  const [task, setTask] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [collabMode, setCollabMode] = useState('share');
  const [isActive, setIsActive] = useState(false);
  const [collaborationLog, setCollaborationLog] = useState([]);

  const agents = [
    { id: 'agent-1', name: 'Luna', specialty: 'Market Analysis', color: '#00f5ff' },
    { id: 'agent-2', name: 'Apex', specialty: 'Trading Strategy', color: '#10b981' },
    { id: 'agent-3', name: 'Sage', specialty: 'Risk Assessment', color: '#a855f7' },
    { id: 'agent-4', name: 'Cipher', specialty: 'Data Mining', color: '#ec4899' }
  ];

  const collabModes = [
    { id: 'share', label: 'Share Findings', icon: Share2, description: 'Agents share discoveries in real-time' },
    { id: 'debate', label: 'Debate Solutions', icon: MessageSquare, description: 'Agents debate and refine ideas' },
    { id: 'merge', label: 'Merge Results', icon: GitMerge, description: 'Combine outputs into unified result' }
  ];

  const toggleAgent = (id) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const startCollaboration = () => {
    setIsActive(true);
    setCollaborationLog([
      { agent: 'Luna', message: 'Analyzing market volatility patterns...', time: 'now' },
      { agent: 'Apex', message: 'Identified 3 potential entry points', time: '2s ago' },
      { agent: 'Sage', message: 'Risk score: 6.5/10 - Moderate', time: '4s ago' }
    ]);

    setTimeout(() => {
      setCollaborationLog(prev => [
        ...prev,
        { agent: 'Cipher', message: 'Found correlation with previous patterns', time: 'just now' }
      ]);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Task Assignment */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Multi-Agent Collaboration</h3>
          {isActive && (
            <span className="ml-auto px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-xs font-bold flex items-center gap-2">
              <Activity className="w-3 h-3 animate-pulse" />
              ACTIVE
            </span>
          )}
        </div>

        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the collaborative task..."
          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm h-20 resize-none mb-4"
        />

        {/* Agent Selection */}
        <div className="mb-4">
          <p className="text-white/70 text-sm mb-3">Select Agents ({selectedAgents.length})</p>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => (
              <motion.button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAgents.includes(agent.id)
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: agent.color + '40' }}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{agent.name}</p>
                    <p className="text-white/50 text-xs">{agent.specialty}</p>
                  </div>
                  {selectedAgents.includes(agent.id) && <span className="text-cyan-400">✓</span>}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Collaboration Mode */}
        <div className="mb-4">
          <p className="text-white/70 text-sm mb-3">Collaboration Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {collabModes.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setCollabMode(mode.id)}
                whileHover={{ scale: 1.05 }}
                className={`p-3 rounded-lg border text-center transition-all ${
                  collabMode === mode.id
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <mode.icon className={`w-5 h-5 mx-auto mb-2 ${
                  collabMode === mode.id ? 'text-purple-400' : 'text-white/60'
                }`} />
                <p className="text-white text-xs font-semibold">{mode.label}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={startCollaboration}
          disabled={selectedAgents.length < 2 || !task}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Start Collaboration
        </motion.button>
      </div>

      {/* Collaboration Visualization */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-lg mb-4">Collaboration Stream</h3>
          <div className="space-y-3">
            {collaborationLog.map((log, idx) => {
              const agent = agents.find(a => a.name === log.agent);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: agent?.color || '#fff' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{log.agent}</p>
                      <span className="text-white/50 text-xs">{log.time}</span>
                    </div>
                    <p className="text-white/70 text-sm">{log.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}