import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Plus, Trash2 } from 'lucide-react';

export default function AgentChannelAssignment() {
  const [assignments, setAssignments] = useState([
    { id: 1, channel: 'general', agent: 'Explorer-01', role: 'moderator', status: 'active' },
    { id: 2, channel: 'trading', agent: 'Trader-05', role: 'specialist', status: 'active' }
  ]);

  const [newAssignment, setNewAssignment] = useState({
    channel: '',
    agent: '',
    role: 'assistant'
  });

  const agents = ['Explorer-01', 'Trader-05', 'Analyst-12', 'Coordinator-08'];
  const channels = ['general', 'trading', 'research', 'strategy', 'support'];
  const roles = ['moderator', 'specialist', 'assistant', 'observer'];

  const handleAdd = () => {
    if (newAssignment.channel && newAssignment.agent) {
      setAssignments([
        ...assignments,
        { id: Date.now(), ...newAssignment, status: 'active' }
      ]);
      setNewAssignment({ channel: '', agent: '', role: 'assistant' });
    }
  };

  const handleRemove = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white font-bold text-lg">Agent Channel Assignment</h3>
      </div>

      {/* Current Assignments */}
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            layout
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-white font-semibold">#{assignment.channel}</span>
                <span className="text-cyan-400 font-mono text-sm">{assignment.agent}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {assignment.role}
                </span>
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {assignment.status}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => handleRemove(assignment.id)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Add New Assignment */}
      <div className="border-t border-white/10 pt-6 space-y-3">
        <h4 className="text-white/70 font-semibold text-sm">Add New Assignment</h4>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={newAssignment.channel}
            onChange={(e) => setNewAssignment({ ...newAssignment, channel: e.target.value })}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">Select Channel</option>
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={newAssignment.agent}
            onChange={(e) => setNewAssignment({ ...newAssignment, agent: e.target.value })}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">Select Agent</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={newAssignment.role}
            onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleAdd}
          className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign Agent to Channel
        </motion.button>
      </div>
    </motion.div>
  );
}