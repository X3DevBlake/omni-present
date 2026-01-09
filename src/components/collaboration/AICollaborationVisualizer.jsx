import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Lightbulb, AlertTriangle, CheckCircle, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AICollaborationVisualizer() {
  const [collaborations, setCollaborations] = useState([
    { id: 1, agents: ['Alpha', 'Beta'], task: 'Market Analysis', status: 'active', progress: 67 },
    { id: 2, agents: ['Gamma', 'Delta'], task: 'Risk Assessment', status: 'coordinating', progress: 34 },
    { id: 3, agents: ['Alpha', 'Gamma', 'Beta'], task: 'Strategic Planning', status: 'conflict', progress: 82 }
  ]);

  const [knowledgeShares, setKnowledgeShares] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [communicationFlow, setCommunicationFlow] = useState([]);
  const [resolvingConflict, setResolvingConflict] = useState(false);

  const shareKnowledgeInsight = async (collaboration) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `For agents ${collaboration.agents.join(', ')} working on ${collaboration.task}, generate relevant knowledge graph insights they should share.`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from_agent: { type: 'string' },
                to_agents: { type: 'array', items: { type: 'string' } },
                insight_type: { type: 'string' },
                content: { type: 'string' },
                relevance: { type: 'number' }
              }
            }
          }
        }
      }
    });

    setKnowledgeShares(prev => [...prev, ...response.insights]);
  };

  const resolveConflict = async (conflictData) => {
    setResolvingConflict(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Resolve this agent collaboration conflict: Agents are disagreeing on approach. Suggest conflict resolution strategy and optimal coordination plan.`,
      response_json_schema: {
        type: 'object',
        properties: {
          resolution_strategy: { type: 'string' },
          recommended_approach: { type: 'string' },
          agent_assignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent: { type: 'string' },
                role: { type: 'string' },
                tasks: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          expected_outcome: { type: 'string' }
        }
      }
    });

    setConflicts(prev => [...prev, response]);
    setResolvingConflict(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-400" />
          AI-Facilitated Agent Collaboration
        </h3>

        {/* Active Collaborations */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {collaborations.map(collab => (
            <div key={collab.id} className={`p-4 rounded-xl border ${
              collab.status === 'conflict' ? 'bg-red-500/10 border-red-500/30' :
              collab.status === 'active' ? 'bg-green-500/10 border-green-500/30' :
              'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold">{collab.task}</h4>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  collab.status === 'conflict' ? 'bg-red-500/20 text-red-400' :
                  collab.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {collab.status}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {collab.agents.map(agent => (
                  <span key={agent} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {agent}
                  </span>
                ))}
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Progress</span>
                  <span className="text-cyan-400">{collab.progress}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${collab.progress}%` }} />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => shareKnowledgeInsight(collab)}
                  className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Share Insights
                </motion.button>
                {collab.status === 'conflict' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => resolveConflict(collab)}
                    disabled={resolvingConflict}
                    className="flex-1 px-3 py-2 bg-orange-500/20 border border-orange-500/50 rounded text-orange-400 font-semibold text-xs disabled:opacity-50"
                  >
                    Resolve
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Knowledge Shares */}
        {knowledgeShares.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Shared Knowledge Insights
            </h4>
            <div className="space-y-2">
              {knowledgeShares.map((share, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold text-sm">{share.from_agent}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-cyan-400 text-xs">{share.to_agents.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400" style={{ width: `${share.relevance * 100}%` }} />
                      </div>
                      <span className="text-green-400 text-xs">{Math.round(share.relevance * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">{share.content}</p>
                  <span className="text-yellow-400 text-xs">Type: {share.insight_type}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Conflict Resolutions */}
        {conflicts.length > 0 && (
          <div>
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              AI Conflict Resolutions
            </h4>
            {conflicts.map((resolution, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl mb-3">
                <p className="text-white/60 text-xs mb-2">Resolution Strategy:</p>
                <p className="text-white font-semibold mb-3">{resolution.resolution_strategy}</p>
                
                <p className="text-white/60 text-xs mb-2">Recommended Approach:</p>
                <p className="text-cyan-400 text-sm mb-3">{resolution.recommended_approach}</p>

                <p className="text-white/60 text-xs mb-2">Agent Assignments:</p>
                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  {resolution.agent_assignments.map((assignment, aIdx) => (
                    <div key={aIdx} className="p-2 bg-black/20 rounded">
                      <p className="text-purple-400 font-semibold text-xs mb-1">{assignment.agent}</p>
                      <p className="text-white/70 text-xs mb-1">{assignment.role}</p>
                      <div className="space-y-1">
                        {assignment.tasks.map((task, tIdx) => (
                          <p key={tIdx} className="text-white/60 text-xs">• {task}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-green-400 text-sm">Expected: {resolution.expected_outcome}</p>
              </div>
            ))}
          </div>
        )}

        {/* Communication Flow Visualization */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white font-bold mb-3 text-sm">Real-Time Communication Flow</h4>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {['Alpha', 'Beta', 'Gamma', 'Delta'].map((agent, idx) => (
              <motion.div
                key={agent}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.5
                }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{agent}</span>
                </div>
                {idx < 3 && (
                  <div className="absolute top-8 -right-8 w-8 h-0.5 bg-cyan-400/50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}