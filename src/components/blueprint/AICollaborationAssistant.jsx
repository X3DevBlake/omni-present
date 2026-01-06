import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Users, Shield, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICollaborationAssistant({ show, onClose, agents, factions, onTaskDelegate, onConflictResolve, onAllianceSuggest }) {
  const [activeTab, setActiveTab] = useState('delegation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [conflictParties, setConflictParties] = useState([]);
  const [suggestions, setSuggestions] = useState(null);

  const delegateTask = async () => {
    if (!selectedFaction || !taskDescription.trim()) {
      toast.error('Select faction and describe task');
      return;
    }

    setIsProcessing(true);
    try {
      const factionAgents = agents.filter(a => a.factionId === selectedFaction.id);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Task: "${taskDescription}"
        
Faction: ${selectedFaction.ideology || 'general'}
Available agents: ${factionAgents.map(a => `${a.name} (${a.type}, skills: ${a.skills?.join(',') || 'none'})`).join(', ')}

Analyze and delegate this task optimally. Consider:
1. Agent skills and current load
2. Task complexity and requirements
3. Optimal team composition
4. Estimated completion time

Return delegation plan with specific agent assignments and reasoning.`,
        response_json_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agentId: { type: "string" },
                  role: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            teamLead: { type: "string" },
            estimatedTime: { type: "number" },
            successProbability: { type: "number" },
            reasoning: { type: "string" }
          }
        }
      });

      setSuggestions(result);
      onTaskDelegate?.(result);
      toast.success('Task delegation plan generated!');
    } catch (error) {
      toast.error('Failed to generate delegation plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const mediateConflict = async () => {
    if (conflictParties.length < 2) {
      toast.error('Select at least 2 conflicting parties');
      return;
    }

    setIsProcessing(true);
    try {
      const parties = conflictParties.map(id => agents.find(a => a.id === id));
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Conflict between agents:
${parties.map(p => `${p.name}: sentiment=${p.sentiment?.overall || 0}, reputation=${p.reputation || 50}, type=${p.type}`).join('\n')}

Analyze conflict and provide mediation strategy:
1. Root cause analysis
2. Proposed resolution steps
3. Compensation/compromise suggestions
4. Long-term relationship improvement plan
5. Success probability`,
        response_json_schema: {
          type: "object",
          properties: {
            cause: { type: "string" },
            resolution: {
              type: "array",
              items: { type: "string" }
            },
            compensation: { type: "object" },
            improvementPlan: { type: "string" },
            successRate: { type: "number" }
          }
        }
      });

      setSuggestions(result);
      onConflictResolve?.(result);
      toast.success('Conflict mediation plan generated!');
    } catch (error) {
      toast.error('Failed to mediate conflict');
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestAlliances = async () => {
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Agent population: ${agents.length}
Agents: ${agents.map(a => `${a.name} (${a.type}, rep=${a.reputation || 50}, faction=${a.factionId || 'none'})`).join(', ')}
Current factions: ${factions.length}

Analyze and suggest optimal alliances:
1. Compatible personality/goal pairs
2. Complementary skills
3. Strategic advantages
4. Resource sharing benefits
5. Coalition formations for max efficiency`,
        response_json_schema: {
          type: "object",
          properties: {
            alliances: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agents: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                  benefits: { type: "array", items: { type: "string" } },
                  strength: { type: "number" }
                }
              }
            },
            coalitions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factions: { type: "array", items: { type: "string" } },
                  purpose: { type: "string" },
                  powerLevel: { type: "number" }
                }
              }
            },
            recommendations: { type: "string" }
          }
        }
      });

      setSuggestions(result);
      onAllianceSuggest?.(result);
      toast.success('Alliance suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Collaboration Assistant</h3>
                <p className="text-white/60 text-sm">Optimize teamwork & resolve conflicts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex gap-2 p-4 border-b border-white/10">
            {[
              { id: 'delegation', label: 'Task Delegation', icon: Users },
              { id: 'mediation', label: 'Conflict Mediation', icon: Shield },
              { id: 'alliances', label: 'Alliance Suggestions', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'delegation' && (
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Select Faction</label>
                  <div className="grid grid-cols-2 gap-2">
                    {factions.map(faction => (
                      <button key={faction.id} onClick={() => setSelectedFaction(faction)} className={`p-3 rounded-lg text-left ${selectedFaction?.id === faction.id ? 'bg-cyan-500/30 border border-cyan-500/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                        <div className="text-white font-medium">{faction.ideology}</div>
                        <div className="text-white/60 text-xs">{faction.members.length} members</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Task Description</label>
                  <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Describe the task to be delegated..." className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 resize-none" />
                </div>

                <button onClick={delegateTask} disabled={isProcessing} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {isProcessing ? 'Analyzing...' : 'Generate Delegation Plan'}
                </button>

                {suggestions && suggestions.assignments && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-cyan-400 font-semibold">Delegation Plan</h4>
                    </div>
                    <div className="space-y-2 mb-3">
                      {suggestions.assignments.map((assign, i) => {
                        const agent = agents.find(a => a.id === assign.agentId);
                        return (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">{agent?.name || assign.agentId}</span>
                              <span className="text-cyan-400 text-sm">{assign.role}</span>
                            </div>
                            <div className="text-white/60 text-xs">{assign.reason}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/60 text-xs">Team Lead</div>
                        <div className="text-white">{agents.find(a => a.id === suggestions.teamLead)?.name || 'N/A'}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/60 text-xs">Success Rate</div>
                        <div className="text-green-400">{suggestions.successProbability}%</div>
                      </div>
                    </div>
                    <div className="mt-3 text-white/80 text-sm">{suggestions.reasoning}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mediation' && (
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Select Conflicting Parties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {agents.map(agent => (
                      <button key={agent.id} onClick={() => {
                        if (conflictParties.includes(agent.id)) {
                          setConflictParties(conflictParties.filter(id => id !== agent.id));
                        } else {
                          setConflictParties([...conflictParties, agent.id]);
                        }
                      }} className={`p-3 rounded-lg text-left ${conflictParties.includes(agent.id) ? 'bg-red-500/30 border border-red-500/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                        <div className="text-white font-medium">{agent.name}</div>
                        <div className="text-white/60 text-xs">Rep: {agent.reputation || 50}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={mediateConflict} disabled={isProcessing || conflictParties.length < 2} className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {isProcessing ? 'Analyzing...' : 'Generate Mediation Plan'}
                </button>

                {suggestions && suggestions.resolution && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold mb-2">Mediation Strategy</h4>
                    <div className="space-y-2">
                      <div className="bg-white/5 rounded p-3">
                        <div className="text-white/60 text-xs mb-1">Root Cause</div>
                        <div className="text-white text-sm">{suggestions.cause}</div>
                      </div>
                      <div className="bg-white/5 rounded p-3">
                        <div className="text-white/60 text-xs mb-2">Resolution Steps</div>
                        {suggestions.resolution.map((step, i) => (
                          <div key={i} className="text-white text-sm mb-1">• {step}</div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center bg-white/5 rounded p-2">
                        <span className="text-white/60 text-sm">Success Rate</span>
                        <span className="text-green-400 font-bold">{suggestions.successRate}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alliances' && (
              <div className="space-y-4">
                <button onClick={suggestAlliances} disabled={isProcessing} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {isProcessing ? 'Analyzing...' : 'Generate Alliance Suggestions'}
                </button>

                {suggestions && suggestions.alliances && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                      <h4 className="text-purple-400 font-semibold mb-3">Recommended Alliances</h4>
                      <div className="space-y-2">
                        {suggestions.alliances.map((alliance, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex gap-2">
                                {alliance.agents.map(id => {
                                  const agent = agents.find(a => a.id === id);
                                  return <span key={id} className="text-white text-sm">{agent?.name || id}</span>;
                                })}
                              </div>
                              <div className="text-yellow-400 text-sm">★ {alliance.strength}/10</div>
                            </div>
                            <div className="text-white/80 text-sm mb-2">{alliance.reason}</div>
                            <div className="flex flex-wrap gap-1">
                              {alliance.benefits.map((benefit, j) => (
                                <span key={j} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">{benefit}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {suggestions.coalitions && suggestions.coalitions.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                        <h4 className="text-blue-400 font-semibold mb-3">Coalition Formations</h4>
                        <div className="space-y-2">
                          {suggestions.coalitions.map((coalition, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium">{coalition.purpose}</span>
                                <span className="text-cyan-400">Power: {coalition.powerLevel}/10</span>
                              </div>
                              <div className="text-white/60 text-xs">Factions: {coalition.factions.join(', ')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}