import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Brain, Users, Shield, TrendingUp, Filter, Download, Award } from 'lucide-react';
import AgentSkillTree from './AgentSkillTree';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AgentBehaviorDashboard({ show, onClose, agents, memorySystem }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [showSkillTree, setShowSkillTree] = useState(false);

  useEffect(() => {
    if (show && agents) {
      generateAnalytics();
    }
  }, [show, agents]);

  const generateAnalytics = () => {
    const agentAnalytics = agents.map(agent => {
      const memory = memorySystem?.get(agent.id);
      
      return {
        id: agent.id,
        name: agent.name,
        decisions: memory?.experiences.length || 0,
        learningProgress: memory?.learnedPatterns.size || 0,
        interactions: memory?.interactions.length || 0,
        alliances: memory?.interactions.filter(i => i.outcome === 'positive').length || 0,
        conflicts: memory?.interactions.filter(i => i.outcome === 'negative').length || 0,
        resources: Math.floor(Math.random() * 100),
        skillLevel: Math.floor(Math.random() * 100)
      };
    });

    // Time series data for learning progress
    const learningData = Array.from({ length: 10 }, (_, i) => ({
      time: `T${i}`,
      learning: Math.floor(Math.random() * 100),
      performance: Math.floor(Math.random() * 100)
    }));

    // Social network data
    const socialData = [
      { name: 'Alliances', value: agentAnalytics.reduce((sum, a) => sum + a.alliances, 0) },
      { name: 'Conflicts', value: agentAnalytics.reduce((sum, a) => sum + a.conflicts, 0) },
      { name: 'Neutral', value: agents.length * 5 }
    ];

    // Decision distribution
    const decisionData = [
      { type: 'Exploration', count: Math.floor(Math.random() * 50) + 20 },
      { type: 'Cooperation', count: Math.floor(Math.random() * 40) + 15 },
      { type: 'Resource Gathering', count: Math.floor(Math.random() * 60) + 30 },
      { type: 'Defense', count: Math.floor(Math.random() * 30) + 10 }
    ];

    setAnalytics({
      agents: agentAnalytics,
      learningData,
      socialData,
      decisionData,
      totalDecisions: agentAnalytics.reduce((sum, a) => sum + a.decisions, 0),
      avgSkillLevel: agentAnalytics.reduce((sum, a) => sum + a.skillLevel, 0) / agents.length,
      totalInteractions: agentAnalytics.reduce((sum, a) => sum + a.interactions, 0)
    });
  };

  const exportData = () => {
    if (!analytics) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      agents: analytics.agents,
      learningData: analytics.learningData,
      socialData: analytics.socialData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_analytics_${Date.now()}.json`;
    a.click();
    toast.success('Analytics exported!');
  };

  if (!show || !analytics) return null;

  const COLORS = ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Behavior Analytics</h3>
                <p className="text-white/60 text-sm">Comprehensive insights into agent performance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportData} className="p-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
            {['overview', 'learning', 'social', 'decisions', 'resources', 'skills'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                    <Brain className="w-8 h-8 text-blue-400 mb-2" />
                    <div className="text-xs text-blue-400 mb-1">Total Decisions</div>
                    <div className="text-3xl font-bold text-white">{analytics.totalDecisions}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="text-xs text-purple-400 mb-1">Avg Skill Level</div>
                    <div className="text-3xl font-bold text-white">{analytics.avgSkillLevel.toFixed(0)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <Users className="w-8 h-8 text-green-400 mb-2" />
                    <div className="text-xs text-green-400 mb-1">Interactions</div>
                    <div className="text-3xl font-bold text-white">{analytics.totalInteractions}</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                    <Shield className="w-8 h-8 text-orange-400 mb-2" />
                    <div className="text-xs text-orange-400 mb-1">Active Agents</div>
                    <div className="text-3xl font-bold text-white">{agents.length}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-4">Agent Performance</h4>
                  <div className="space-y-2">
                    {analytics.agents.map((agent, i) => (
                      <div key={agent.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setSelectedAgent(agent)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-white font-medium">{agent.name}</span>
                          </div>
                          <div className="text-cyan-400 text-sm">{agent.skillLevel}/100</div>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${agent.skillLevel}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-4">Learning Progress Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.learningData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="time" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                      <Legend />
                      <Line type="monotone" dataKey="learning" stroke="#00f5ff" strokeWidth={2} />
                      <Line type="monotone" dataKey="performance" stroke="#a855f7" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {analytics.agents.map((agent, i) => (
                    <div key={agent.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-white font-medium">{agent.name}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Patterns Learned</span>
                          <span className="text-white">{agent.learningProgress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Decisions Made</span>
                          <span className="text-white">{agent.decisions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-4">Social Interaction Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={analytics.socialData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                        {analytics.socialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-4">Agent Relationships</h4>
                  <div className="space-y-3">
                    {analytics.agents.map(agent => (
                      <div key={agent.id} className="bg-white/5 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">{agent.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-green-400">Alliances</span>
                            <span className="text-white">{agent.alliances}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-400">Conflicts</span>
                            <span className="text-white">{agent.conflicts}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-4">Decision Type Distribution</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.decisionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="type" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    <Bar dataKey="count" fill="#00f5ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="grid grid-cols-3 gap-4">
                {analytics.agents.map((agent, i) => (
                  <div key={agent.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-white font-medium">{agent.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">Resources</span>
                          <span className="text-white">{agent.resources}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${agent.resources}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent, i) => (
                    <div key={agent.id} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-white font-medium">{agent.name}</span>
                        </div>
                        <button
                          onClick={() => { setSelectedAgent(agent); setShowSkillTree(true); }}
                          className="p-1 bg-purple-500/20 rounded hover:bg-purple-500/30"
                        >
                          <Award className="w-4 h-4 text-purple-300" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Skills Unlocked</span>
                          <span className="text-cyan-400">{agent.skills?.length || 2}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Skill Points</span>
                          <span className="text-yellow-400">{agent.skillPoints || 5}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Experience</span>
                          <span className="text-green-400">{agent.experience || 0} XP</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(agent.skills || ['basic_movement', 'observation']).slice(0, 4).map(skill => (
                          <div key={skill} className="px-2 py-0.5 bg-purple-500/20 rounded text-purple-300 text-xs">
                            {skill.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {showSkillTree && selectedAgent && (
          <AgentSkillTree
            show={showSkillTree}
            onClose={() => { setShowSkillTree(false); setSelectedAgent(null); }}
            agent={selectedAgent}
            onSkillUnlock={(skill) => {
              // Update agent skills
              const updatedAgent = agents.find(a => a.id === selectedAgent.id);
              if (updatedAgent && !updatedAgent.skills.includes(skill.id)) {
                updatedAgent.skills.push(skill.id);
              }
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}