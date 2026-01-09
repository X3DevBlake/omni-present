import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, MessageCircle, Share2, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentCollaborationHub({ agents = [] }) {
  const [teams, setTeams] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    members: [],
    knowledge_shared: []
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // For demo, simulate teams
      setTeams([
        {
          id: 'team1',
          name: 'Explorer Squad',
          objective: 'Map unknown territories',
          members: ['agent1', 'agent2'],
          knowledge_shared: [],
          created_at: new Date().toISOString(),
          activeCollaborations: []
        }
      ]);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const createTeam = async () => {
    if (!formData.name.trim() || formData.members.length === 0) {
      toast.error('Team name and members required');
      return;
    }

    try {
      const newTeam = {
        id: `team_${Date.now()}`,
        ...formData,
        created_at: new Date().toISOString(),
        activeCollaborations: []
      };

      setTeams(prev => [newTeam, ...prev]);
      setFormData({ name: '', objective: '', members: [], knowledge_shared: [] });
      setShowTeamForm(false);
      toast.success('Team created!');
    } catch (err) {
      toast.error('Failed to create team');
    }
  };

  const addMember = (agentId) => {
    if (!formData.members.includes(agentId)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, agentId]
      }));
    }
  };

  const removeMember = (agentId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m !== agentId)
    }));
  };

  const startCollaboration = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      const prompt = `You are coordinating a team of AI agents for a collaborative task.
      
Team: ${team.name}
Objective: ${team.objective}
Members: ${team.members.join(', ')}

Generate a collaboration plan with specific roles and communication protocol.
Format as JSON:
{
  "phases": [{"name": "Phase", "actions": ["action1"], "duration": "time", "responsible": "agent_id"}],
  "communication_protocol": "How agents will communicate",
  "shared_resources": ["resource1"],
  "success_criteria": ["criteria1"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            phases: { type: 'array' },
            communication_protocol: { type: 'string' },
            shared_resources: { type: 'array' },
            success_criteria: { type: 'array' }
          }
        }
      });

      setTeams(prev => prev.map(t =>
        t.id === teamId
          ? { ...t, activeCollaborations: [{ ...response, started: new Date().toISOString() }] }
          : t
      ));

      toast.success('Collaboration started!');
    } catch (err) {
      toast.error('Failed to start collaboration');
    }
  };

  const shareKnowledge = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.members.length === 0) return;

    try {
      // Simulate knowledge synthesis
      const synthesis = `Team members shared insights on: exploration tactics, resource optimization, threat assessment`;
      
      setTeams(prev => prev.map(t =>
        t.id === teamId
          ? { ...t, knowledge_shared: [...(t.knowledge_shared || []), { content: synthesis, timestamp: new Date().toISOString() }] }
          : t
      ));

      toast.success('Knowledge shared across team!');
    } catch (err) {
      toast.error('Failed to share knowledge');
    }
  };

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Agent Collaboration Hub
        </h3>
        <span className="text-xs text-white/50">{teams.length} teams</span>
      </div>

      {/* Team Creation Form */}
      {showTeamForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-purple-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Team name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <textarea
            placeholder="Collaboration objective..."
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-16"
          />

          <div>
            <p className="text-white/60 text-xs mb-2">Select Members:</p>
            <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => addMember(agent.id)}
                  className={`p-2 rounded text-xs transition-all ${
                    formData.members.includes(agent.id)
                      ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                      : 'bg-white/10 border border-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  {agent.name || agent.id}
                </button>
              ))}
            </div>
          </div>

          {formData.members.length > 0 && (
            <div className="text-xs text-purple-400">
              {formData.members.length} member(s) selected
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={createTeam}
              className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded font-medium text-xs"
            >
              Create Team
            </button>
            <button
              onClick={() => setShowTeamForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Teams List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {teams.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs">No teams created yet</div>
        ) : (
          teams.map(team => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{team.name}</p>
                  <p className="text-white/60 text-xs">{team.objective}</p>
                </div>
                {team.activeCollaborations?.length > 0 && (
                  <span className="text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>

              <div className="flex gap-1 mb-2 flex-wrap">
                {team.members.map(member => (
                  <span key={member} className="text-xs bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                    {member}
                  </span>
                ))}
              </div>

              {team.knowledge_shared?.length > 0 && (
                <div className="text-xs text-cyan-400 mb-2">
                  💡 {team.knowledge_shared.length} knowledge exchange(s)
                </div>
              )}

              <div className="flex gap-2">
                <motion.button
                  onClick={() => startCollaboration(team.id)}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 py-1 text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded hover:bg-cyan-500/30"
                >
                  <Target className="w-3 h-3 inline mr-1" />
                  Plan
                </motion.button>
                <motion.button
                  onClick={() => shareKnowledge(team.id)}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 py-1 text-xs bg-green-500/20 border border-green-500/40 text-green-300 rounded hover:bg-green-500/30"
                >
                  <Share2 className="w-3 h-3 inline mr-1" />
                  Share
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!showTeamForm && (
        <motion.button
          onClick={() => setShowTeamForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-purple-500/40 text-purple-400 rounded font-medium text-xs hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </motion.button>
      )}
    </div>
  );
}