import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentCollaborationHub({ agents = [] }) {
  const [teams, setTeams] = useState([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Auto-form teams based on complementary skills
    const autoFormTeams = () => {
      const newTeams = [];
      const skillGroups = {};
      
      agents.forEach(agent => {
        agent.skills?.forEach(skill => {
          if (!skillGroups[skill]) skillGroups[skill] = [];
          skillGroups[skill].push(agent);
        });
      });

      Object.entries(skillGroups).forEach(([skill, members]) => {
        if (members.length >= 2) {
          newTeams.push({
            id: Date.now() + Math.random(),
            name: `${skill} Team`,
            members: members.slice(0, 4),
            skill,
            efficiency: 75 + Math.random() * 20,
            sharedKnowledge: Math.floor(Math.random() * 50),
          });
        }
      });

      setTeams(newTeams);
    };

    // Detect conflicts
    const detectConflicts = () => {
      const newConflicts = [];
      agents.forEach((a1, i) => {
        agents.slice(i + 1).forEach(a2 => {
          if (Math.random() > 0.9) {
            newConflicts.push({
              id: Date.now() + Math.random(),
              agents: [a1.name, a2.name],
              type: 'resource_competition',
              severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            });
          }
        });
      });
      setConflicts(newConflicts);
    };

    // Generate AI suggestions
    const generateSuggestions = () => {
      setSuggestions([
        { id: 1, type: 'alliance', text: 'Analysts and Researchers could form a knowledge-sharing alliance', priority: 'high' },
        { id: 2, type: 'optimization', text: 'Combine Scout agents into exploration teams for efficiency', priority: 'medium' },
        { id: 3, type: 'resolution', text: 'Mediator agent suggested for resource conflict resolution', priority: 'high' },
      ]);
    };

    if (agents.length > 0) {
      autoFormTeams();
      detectConflicts();
      generateSuggestions();
    }
  }, [agents]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Agent Collaboration Hub</h3>

      {/* Autonomous Teams */}
      <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Autonomous Teams
          </h4>
          <div className="text-cyan-400 text-sm">{teams.length} active</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map(team => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/20 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{team.name}</div>
                  <div className="text-white/60 text-xs">{team.members.length} members</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm font-bold">{team.efficiency.toFixed(0)}%</div>
                  <div className="text-white/40 text-xs">efficiency</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {team.members.map((member, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                    title={member.name}
                  >
                    {member.name?.[0] || 'A'}
                  </div>
                ))}
              </div>
              <div className="bg-cyan-500/10 rounded p-2">
                <div className="text-cyan-400 text-xs mb-1">Shared Knowledge</div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${team.sharedKnowledge}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Knowledge Sharing Graph */}
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-purple-400" />
          Knowledge Distribution
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{agents.length * 5}</div>
            <div className="text-white/60 text-sm">Knowledge Items</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">{teams.reduce((sum, t) => sum + t.sharedKnowledge, 0) / teams.length || 0}%</div>
            <div className="text-white/60 text-sm">Avg Shared</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{Math.floor(agents.length * 1.5)}</div>
            <div className="text-white/60 text-sm">Transfers</div>
          </div>
        </div>
      </div>

      {/* AI Conflict Resolution */}
      <div className="bg-white/5 border border-red-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Conflict Resolution
        </h4>
        {conflicts.length === 0 ? (
          <div className="text-center py-4 text-white/60">No conflicts detected</div>
        ) : (
          <div className="space-y-3">
            {conflicts.map(conflict => (
              <div key={conflict.id} className="bg-black/20 border border-red-500/20 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <div className="text-white font-medium mb-1">{conflict.agents.join(' vs ')}</div>
                  <div className="text-white/60 text-sm capitalize">{conflict.type.replace('_', ' ')}</div>
                </div>
                <div className="flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    conflict.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    conflict.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {conflict.severity}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Auto-Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Alliance Suggestions */}
      <div className="bg-white/5 border border-green-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-400" />
          AI Suggestions
        </h4>
        <div className="space-y-3">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="bg-black/20 border border-green-500/20 rounded-lg p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div className="text-white/60 text-xs capitalize">{suggestion.type}</div>
                </div>
                <div className="text-white">{suggestion.text}</div>
              </div>
              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  suggestion.priority === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {suggestion.priority}
                </div>
                <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs">
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Efficiency Monitor */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Team Efficiency Monitor
        </h4>
        <div className="space-y-3">
          {teams.map((team, i) => (
            <div key={team.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-white text-sm mb-1">{team.name}</div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${team.efficiency}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </div>
              <div className="text-white font-bold">{team.efficiency.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}