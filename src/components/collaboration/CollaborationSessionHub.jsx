import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Mic, FileText, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CollaborationSessionHub({ userEmail }) {
  const [agents, setAgents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const loadData = async () => {
    try {
      const [agentsList, sessionsList] = await Promise.all([
        base44.entities.HolographicAgent.list({ user_email: userEmail }),
        base44.entities.HolographicCollaboration.list({ status: 'active' })
      ]);
      setAgents(agentsList);
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createSession = async () => {
    if (selectedAgents.length < 2) {
      alert('Select at least 2 agents');
      return;
    }

    setCreating(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create multi-agent holographic collaboration session:
Agents: ${selectedAgents.join(', ')}
Task: Complex problem solving
Type: problem_solving

Initialize with voice (ElevenLabs) and gesture control enabled.`,
        response_json_schema: {
          type: 'object',
          properties: {
            session_id: { type: 'string' },
            roles: { type: 'object' }
          }
        }
      });
      await loadData();
      setSelectedAgents([]);
      alert('Collaboration session created!');
    } catch (error) {
      console.error('Session creation error:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleAgentSelection = (agentId) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Session */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-6"
      >
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Create Collaboration Session
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => toggleAgentSelection(agent.id)}
              className={`p-3 rounded text-left transition-all ${
                selectedAgents.includes(agent.id)
                  ? 'bg-cyan-500/20 border-2 border-cyan-400'
                  : 'bg-white/5 border border-white/20 hover:bg-white/10'
              }`}
            >
              <p className="text-white font-semibold text-sm">{agent.name}</p>
              <p className="text-white/60 text-xs">{agent.status}</p>
            </button>
          ))}
        </div>

        <button
          onClick={createSession}
          disabled={creating || selectedAgents.length < 2}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
        >
          <Play className="w-5 h-5 inline mr-2" />
          {creating ? 'Creating...' : `Start Session (${selectedAgents.length} agents)`}
        </button>
      </motion.div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold">{session.session_name}</h4>
                  <p className="text-white/60 text-sm">{session.task_objective}</p>
                </div>
                <div className="flex gap-2">
                  {session.voice_enabled && (
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                  {session.gesture_control && (
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/60 text-xs">Agents:</span>
                {session.participating_agents?.map((agentId, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    Agent {i + 1}
                  </span>
                ))}
              </div>

              {session.decisions_made?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/60 text-xs mb-1">Recent Decisions:</p>
                  <p className="text-cyan-400 text-sm">{session.decisions_made.length} decisions made</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}