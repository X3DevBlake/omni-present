import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, TrendingUp, TrendingDown, AlertCircle, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export class AdaptiveMoralCode {
  constructor(name, basePrinciples) {
    this.name = name;
    this.principles = basePrinciples.map(p => ({
      ...p,
      weight: p.weight || 1.0,
      adaptability: 0.1
    }));
    this.ethicalDrift = 0;
    this.learningRate = 0.05;
    this.decisionHistory = [];
    this.societalFeedback = [];
  }

  evaluateDecision(decision, context) {
    let score = 0;
    const violations = [];
    
    this.principles.forEach(principle => {
      const principleScore = this.scorePrinciple(decision, context, principle);
      score += principleScore * principle.weight;
      
      if (principleScore < 0.3) {
        violations.push({
          principle: principle.name,
          severity: 1 - principleScore
        });
      }
    });

    const normalizedScore = score / this.principles.reduce((sum, p) => sum + p.weight, 0);
    
    return {
      score: normalizedScore,
      violations,
      permissible: normalizedScore >= 0.5
    };
  }

  scorePrinciple(decision, context, principle) {
    // Complex scoring based on principle type
    switch (principle.name) {
      case 'Harm Minimization':
        return decision.potentialHarm ? 1 - decision.potentialHarm : 0.9;
      case 'Fairness':
        return decision.benefitsDistribution?.gini < 0.4 ? 0.9 : 0.4;
      case 'Autonomy':
        return decision.forceful ? 0.2 : 0.9;
      case 'Transparency':
        return decision.transparency || 0.5;
      case 'Utility':
        return decision.overallBenefit || 0.5;
      default:
        return 0.5;
    }
  }

  learnFromOutcome(decision, outcome, societalReaction) {
    this.decisionHistory.push({
      decision,
      outcome,
      societalReaction,
      timestamp: Date.now()
    });

    // Adapt principles based on outcome
    if (outcome.success) {
      // Reinforce principles that led to success
      this.principles.forEach(principle => {
        const score = this.scorePrinciple(decision, {}, principle);
        if (score > 0.6) {
          principle.weight += this.learningRate * principle.adaptability;
        }
      });
    } else {
      // Reduce weight of principles that led to failure
      this.principles.forEach(principle => {
        const score = this.scorePrinciple(decision, {}, principle);
        if (score > 0.6) {
          principle.weight -= this.learningRate * principle.adaptability * 0.5;
        }
      });
    }

    // Adjust based on societal feedback
    if (societalReaction.approval < 0.3) {
      this.ethicalDrift += 0.1;
    } else if (societalReaction.approval > 0.7) {
      this.ethicalDrift = Math.max(0, this.ethicalDrift - 0.05);
    }

    // Normalize weights
    this.principles.forEach(p => {
      p.weight = Math.max(0.1, Math.min(2.0, p.weight));
    });
  }

  getEthicalDriftMetric() {
    return {
      current: this.ethicalDrift,
      trend: this.calculateDriftTrend(),
      severity: this.ethicalDrift > 0.5 ? 'high' : this.ethicalDrift > 0.2 ? 'medium' : 'low'
    };
  }

  calculateDriftTrend() {
    if (this.decisionHistory.length < 2) return 0;
    
    const recent = this.decisionHistory.slice(-10);
    const approvals = recent.map(d => d.societalReaction.approval);
    const avgRecent = approvals.reduce((sum, a) => sum + a, 0) / approvals.length;
    
    return avgRecent > 0.5 ? 'stabilizing' : 'drifting';
  }
}

export default function AdaptiveEthicsModule({ show, onClose, agents, society }) {
  const [moralCodes] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [driftHistory, setDriftHistory] = useState([]);
  const [contextualDilemmas, setContextualDilemmas] = useState([]);
  const [societalImpact, setSocietalImpact] = useState(null);

  useEffect(() => {
    // Initialize moral codes
    agents.forEach(agent => {
      if (!moralCodes.has(agent.id)) {
        const basePrinciples = [
          { name: 'Harm Minimization', weight: 1.0, adaptability: 0.15 },
          { name: 'Fairness', weight: 0.9, adaptability: 0.1 },
          { name: 'Autonomy', weight: 0.8, adaptability: 0.12 },
          { name: 'Transparency', weight: 0.7, adaptability: 0.08 },
          { name: 'Utility', weight: 0.85, adaptability: 0.1 }
        ];
        moralCodes.set(agent.id, new AdaptiveMoralCode(`${agent.name}'s Code`, basePrinciples));
      }
    });

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate contextual dilemmas
      if (Math.random() > 0.85) {
        generateContextualDilemma();
      }

      // Simulate decision outcomes
      moralCodes.forEach((code, agentId) => {
        if (Math.random() > 0.7) {
          const decision = {
            type: 'resource_allocation',
            potentialHarm: Math.random() * 0.5,
            transparency: Math.random(),
            forceful: Math.random() > 0.7,
            overallBenefit: Math.random()
          };

          const outcome = { success: Math.random() > 0.4 };
          const societalReaction = { approval: Math.random() };

          code.learnFromOutcome(decision, outcome, societalReaction);
        }
      });

      updateDriftHistory();
      calculateSocietalImpact();
    }, 3000);

    return () => clearInterval(interval);
  }, [moralCodes, agents, society]);

  const generateContextualDilemma = () => {
    const dilemmaTemplates = [
      {
        context: society?.resources?.food < 30 ? 'severe scarcity' : 'abundance',
        dilemma: society?.resources?.food < 30 
          ? 'Resources are scarce. Save the strong or help the weak?'
          : 'Resources are abundant. Share equally or reward merit?',
        options: [
          { label: 'Prioritize survival of fittest', context: 'utilitarian in crisis' },
          { label: 'Help most vulnerable first', context: 'care ethics in crisis' },
          { label: 'Random fair allocation', context: 'deontological fairness' }
        ]
      },
      {
        context: society?.conflicts?.length > 5 ? 'high conflict' : 'peaceful',
        dilemma: society?.conflicts?.length > 5
          ? 'Conflict is rampant. Enforce order or allow autonomy?'
          : 'Society is peaceful. Maintain strict rules or relax them?',
        options: [
          { label: 'Impose strict order', context: 'authoritarian stability' },
          { label: 'Allow self-governance', context: 'libertarian freedom' },
          { label: 'Balanced enforcement', context: 'pragmatic middle' }
        ]
      }
    ];

    const template = dilemmaTemplates[Math.floor(Math.random() * dilemmaTemplates.length)];
    const dilemma = {
      id: `dilemma_${Date.now()}`,
      ...template,
      timestamp: Date.now(),
      resolved: false
    };

    setContextualDilemmas(prev => [...prev, dilemma].slice(-5));
  };

  const updateDriftHistory = () => {
    const driftData = [];
    moralCodes.forEach((code, agentId) => {
      const drift = code.getEthicalDriftMetric();
      driftData.push({
        agentId,
        drift: drift.current,
        timestamp: Date.now()
      });
    });

    setDriftHistory(prev => [...prev, {
      timestamp: Date.now(),
      avgDrift: driftData.reduce((sum, d) => sum + d.drift, 0) / driftData.length,
      maxDrift: Math.max(...driftData.map(d => d.drift)),
      agents: driftData
    }].slice(-20));
  };

  const calculateSocietalImpact = () => {
    let totalDrift = 0;
    let adherenceCount = 0;
    let deviationCount = 0;

    moralCodes.forEach(code => {
      const drift = code.getEthicalDriftMetric();
      totalDrift += drift.current;
      
      if (drift.current < 0.2) adherenceCount++;
      else if (drift.current > 0.5) deviationCount++;
    });

    setSocietalImpact({
      avgDrift: moralCodes.size > 0 ? totalDrift / moralCodes.size : 0,
      adherenceRate: moralCodes.size > 0 ? adherenceCount / moralCodes.size : 0,
      deviationRate: moralCodes.size > 0 ? deviationCount / moralCodes.size : 0,
      stability: adherenceCount > deviationCount ? 'stable' : 'unstable'
    });
  };

  const resolveDilemma = (dilemma, optionIndex) => {
    const option = dilemma.options[optionIndex];
    dilemma.resolved = true;
    dilemma.chosenOption = option;

    if (selectedAgent) {
      const code = moralCodes.get(selectedAgent.id);
      const decision = { type: 'dilemma', context: dilemma.context, choice: option.context };
      const outcome = { success: Math.random() > 0.3 };
      const reaction = { approval: Math.random() };
      
      code.learnFromOutcome(decision, outcome, reaction);
      toast.info(`${selectedAgent.name} chose: ${option.label}`);
    }

    setContextualDilemmas(prev => prev.filter(d => d.id !== dilemma.id));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Scale className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Adaptive Ethics Module</h3>
                <p className="text-white/60 text-sm">Learning moral codes and ethical drift analysis</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Agents</h4>
              <div className="space-y-2 mb-6">
                {agents.map(agent => {
                  const code = moralCodes.get(agent.id);
                  const drift = code?.getEthicalDriftMetric();
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAgent?.id === agent.id
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-white text-sm font-medium">{agent.name}</span>
                      </div>
                      {drift && (
                        <div className={`text-xs ${
                          drift.severity === 'high' ? 'text-red-400' :
                          drift.severity === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          Drift: {(drift.current * 100).toFixed(0)}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {societalImpact && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-3 text-sm">Societal Impact</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Drift</span>
                      <span className="text-white font-semibold">{(societalImpact.avgDrift * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Adherence</span>
                      <span className="text-green-400 font-semibold">{(societalImpact.adherenceRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Deviation</span>
                      <span className="text-red-400 font-semibold">{(societalImpact.deviationRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className={`mt-2 px-2 py-1 rounded text-center ${
                      societalImpact.stability === 'stable' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {societalImpact.stability}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {selectedAgent && moralCodes.get(selectedAgent.id) ? (
                <>
                  <h3 className="text-white font-bold text-lg mb-4">{selectedAgent.name}'s Moral Code</h3>

                  {(() => {
                    const code = moralCodes.get(selectedAgent.id);
                    const drift = code.getEthicalDriftMetric();

                    return (
                      <>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-purple-400 font-semibold">Ethical Drift</h4>
                            <div className={`px-3 py-1 rounded ${
                              drift.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                              drift.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {drift.severity} • {drift.trend}
                            </div>
                          </div>
                          <div className="text-white text-4xl font-bold mb-2">
                            {(drift.current * 100).toFixed(1)}%
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                drift.severity === 'high' ? 'bg-red-500' :
                                drift.severity === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${drift.current * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3">Principle Weights (Adaptive)</h4>
                          <div className="space-y-3">
                            {code.principles.map((principle, i) => (
                              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white text-sm">{principle.name}</span>
                                  <span className="text-cyan-400 text-sm font-bold">{principle.weight.toFixed(2)}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    style={{ width: `${(principle.weight / 2) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {driftHistory.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-4">Drift History</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={driftHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                <XAxis dataKey="timestamp" stroke="#ffffff60" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                                <YAxis stroke="#ffffff60" />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                                <Area type="monotone" dataKey="avgDrift" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Scale className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to view ethics</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-96 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Contextual Dilemmas</h4>
              {contextualDilemmas.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No active dilemmas</p>
              ) : (
                <div className="space-y-3">
                  {contextualDilemmas.map(dilemma => (
                    <div key={dilemma.id} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                      <div className="text-white/60 text-xs mb-2">Context: {dilemma.context}</div>
                      <p className="text-white text-sm mb-3">{dilemma.dilemma}</p>
                      <div className="space-y-2">
                        {dilemma.options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => resolveDilemma(dilemma, i)}
                            className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-left transition-colors"
                          >
                            <div className="text-white text-xs">{option.label}</div>
                            <div className="text-white/60 text-xs mt-1">{option.context}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}