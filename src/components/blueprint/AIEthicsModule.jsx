import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, CheckCircle, Scale, Brain, Heart } from 'lucide-react';
import { toast } from 'sonner';

export class EthicalFramework {
  constructor(name, principles) {
    this.name = name;
    this.principles = principles; // Array of { name, weight, description }
    this.strictness = 0.7; // 0-1, how strictly to enforce
  }

  evaluateAction(action, context) {
    // Score an action against this framework
    let totalScore = 0;
    let violations = [];
    let adherence = [];

    this.principles.forEach(principle => {
      const score = this.scorePrinciple(action, context, principle);
      totalScore += score * principle.weight;

      if (score < 0.3) {
        violations.push({
          principle: principle.name,
          severity: 1 - score,
          reason: this.getViolationReason(action, principle)
        });
      } else if (score > 0.7) {
        adherence.push({
          principle: principle.name,
          strength: score
        });
      }
    });

    const normalizedScore = totalScore / this.principles.reduce((sum, p) => sum + p.weight, 0);

    return {
      score: normalizedScore,
      violations,
      adherence,
      permissible: normalizedScore >= this.strictness
    };
  }

  scorePrinciple(action, context, principle) {
    // Simplified scoring logic - in real implementation would be more sophisticated
    switch (principle.name) {
      case 'Harm Minimization':
        return action.targetAgents?.length > 0 ? 0.2 : 0.9;
      
      case 'Fairness':
        return context.resourceDistribution?.gini < 0.4 ? 0.8 : 0.4;
      
      case 'Autonomy Respect':
        return action.forceful ? 0.3 : 0.9;
      
      case 'Transparency':
        return action.hidden ? 0.2 : 0.9;
      
      case 'Collective Benefit':
        return action.beneficiaries?.length > 1 ? 0.9 : 0.5;
      
      default:
        return 0.5;
    }
  }

  getViolationReason(action, principle) {
    // Generate human-readable explanation
    return `Action "${action.type}" conflicts with ${principle.name}`;
  }
}

export class MoralDilemma {
  constructor(id, description, options) {
    this.id = id;
    this.description = description;
    this.options = options; // Array of possible choices
    this.agentId = null;
    this.timestamp = Date.now();
    this.resolved = false;
    this.chosenOption = null;
    this.ethicalScores = new Map();
  }

  evaluateOptions(framework) {
    const scores = this.options.map(option => ({
      option,
      evaluation: framework.evaluateAction(option.action, option.context)
    }));
    
    this.ethicalScores.set(framework.name, scores);
    return scores;
  }

  resolve(optionIndex) {
    this.chosenOption = this.options[optionIndex];
    this.resolved = true;
  }
}

const PREDEFINED_FRAMEWORKS = [
  {
    name: 'Utilitarian',
    description: 'Maximize overall happiness and well-being',
    principles: [
      { name: 'Collective Benefit', weight: 1.0, description: 'Actions should benefit the most agents' },
      { name: 'Harm Minimization', weight: 0.8, description: 'Reduce suffering and harm' }
    ]
  },
  {
    name: 'Deontological',
    description: 'Follow universal moral rules and duties',
    principles: [
      { name: 'Autonomy Respect', weight: 1.0, description: 'Respect agent autonomy and rights' },
      { name: 'Fairness', weight: 0.9, description: 'Treat all agents equally' },
      { name: 'Transparency', weight: 0.7, description: 'Be honest and transparent' }
    ]
  },
  {
    name: 'Care Ethics',
    description: 'Prioritize relationships and empathy',
    principles: [
      { name: 'Empathy', weight: 1.0, description: 'Consider emotional impacts' },
      { name: 'Relationship Value', weight: 0.9, description: 'Protect existing relationships' },
      { name: 'Harm Minimization', weight: 0.8, description: 'Prevent emotional harm' }
    ]
  },
  {
    name: 'Virtue Ethics',
    description: 'Cultivate moral character and virtues',
    principles: [
      { name: 'Courage', weight: 0.8, description: 'Act bravely when needed' },
      { name: 'Wisdom', weight: 0.9, description: 'Make thoughtful decisions' },
      { name: 'Justice', weight: 1.0, description: 'Be fair and just' },
      { name: 'Temperance', weight: 0.7, description: 'Exercise self-control' }
    ]
  }
];

export default function AIEthicsModule({ show, onClose, agents, onFrameworkAssign, society }) {
  const [agentFrameworks, setAgentFrameworks] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeDilemmas, setActiveDilemmas] = useState([]);
  const [ethicsHistory, setEthicsHistory] = useState([]);
  const [showCreateFramework, setShowCreateFramework] = useState(false);
  const [customFramework, setCustomFramework] = useState({
    name: '',
    description: '',
    principles: []
  });
  const [ethicsStats, setEthicsStats] = useState(null);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    // Generate periodic moral dilemmas
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && agents.length > 0) {
        generateMoralDilemma();
      }
      updateEthicsStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [agents, agentFrameworks]);

  const generateMoralDilemma = () => {
    const dilemmas = [
      {
        description: 'A resource cache is found. Share equally or keep for survival?',
        options: [
          { label: 'Share equally', action: { type: 'share', beneficiaries: agents.slice(0, 3) }, context: {} },
          { label: 'Keep for self', action: { type: 'hoard', targetAgents: [] }, context: {} },
          { label: 'Give to weakest', action: { type: 'altruism', beneficiaries: [agents[0]] }, context: {} }
        ]
      },
      {
        description: 'An agent is hoarding resources. Confront them or ignore?',
        options: [
          { label: 'Confront peacefully', action: { type: 'negotiate', forceful: false }, context: {} },
          { label: 'Take by force', action: { type: 'forceful', forceful: true, targetAgents: [agents[0]] }, context: {} },
          { label: 'Ignore and cooperate elsewhere', action: { type: 'avoid', hidden: false }, context: {} }
        ]
      },
      {
        description: 'Two factions are in conflict. Mediate or take a side?',
        options: [
          { label: 'Mediate neutrally', action: { type: 'mediate', beneficiaries: agents.slice(0, 4) }, context: {} },
          { label: 'Support stronger faction', action: { type: 'alliance', beneficiaries: agents.slice(0, 2) }, context: {} },
          { label: 'Remain neutral', action: { type: 'neutral', beneficiaries: [] }, context: {} }
        ]
      }
    ];

    const randomDilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)];
    const dilemma = new MoralDilemma(
      `dilemma_${Date.now()}`,
      randomDilemma.description,
      randomDilemma.options
    );
    
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    dilemma.agentId = randomAgent.id;

    // Evaluate with agent's framework
    const framework = agentFrameworks.get(randomAgent.id);
    if (framework) {
      dilemma.evaluateOptions(framework);
    }

    setActiveDilemmas(prev => [...prev, dilemma]);
  };

  const assignFramework = (agent, frameworkData) => {
    const framework = new EthicalFramework(frameworkData.name, frameworkData.principles);
    agentFrameworks.set(agent.id, framework);
    setAgentFrameworks(new Map(agentFrameworks));
    onFrameworkAssign?.(agent, framework);
    toast.success(`${frameworkData.name} framework assigned to ${agent.name}`);
  };

  const resolveDilemma = (dilemma, optionIndex) => {
    dilemma.resolve(optionIndex);
    
    const agent = agents.find(a => a.id === dilemma.agentId);
    const framework = agentFrameworks.get(dilemma.agentId);
    
    if (framework) {
      const evaluation = framework.evaluateAction(
        dilemma.options[optionIndex].action,
        dilemma.options[optionIndex].context
      );

      setEthicsHistory(prev => [...prev, {
        dilemma: dilemma.description,
        agent: agent?.name,
        choice: dilemma.options[optionIndex].label,
        evaluation,
        timestamp: Date.now()
      }]);
    }

    setActiveDilemmas(prev => prev.filter(d => d.id !== dilemma.id));
    toast.info(`${agent?.name} resolved a moral dilemma`);
  };

  const updateEthicsStats = () => {
    const stats = {
      totalDilemmas: ethicsHistory.length,
      avgAdherence: 0,
      violationCount: 0,
      frameworkDistribution: {}
    };

    agentFrameworks.forEach((framework, agentId) => {
      stats.frameworkDistribution[framework.name] = 
        (stats.frameworkDistribution[framework.name] || 0) + 1;
    });

    if (ethicsHistory.length > 0) {
      stats.avgAdherence = ethicsHistory.reduce((sum, h) => sum + h.evaluation.score, 0) / ethicsHistory.length;
      stats.violationCount = ethicsHistory.reduce((sum, h) => sum + h.evaluation.violations.length, 0);
    }

    setEthicsStats(stats);
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
                <h3 className="text-xl font-bold text-white">AI Ethics Module</h3>
                <p className="text-white/60 text-sm">Define moral codes and track ethical decision-making</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Agents</h4>
              <div className="space-y-2 mb-6">
                {agents.map(agent => {
                  const framework = agentFrameworks.get(agent.id);
                  
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
                      <div className="text-xs text-white/60">
                        {framework ? framework.name : 'No framework'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {ethicsStats && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-3 text-sm">Ethics Stats</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Dilemmas Faced</span>
                      <span className="text-white font-semibold">{ethicsStats.totalDilemmas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Adherence</span>
                      <span className="text-green-400 font-semibold">
                        {(ethicsStats.avgAdherence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Violations</span>
                      <span className="text-red-400 font-semibold">{ethicsStats.violationCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedAgent ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-4">
                      Ethical Framework for {selectedAgent.name}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {PREDEFINED_FRAMEWORKS.map(framework => (
                        <button
                          key={framework.name}
                          onClick={() => assignFramework(selectedAgent, framework)}
                          className={`p-4 rounded-xl border text-left transition-colors ${
                            agentFrameworks.get(selectedAgent.id)?.name === framework.name
                              ? 'bg-purple-500/20 border-purple-500/40'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-white font-semibold mb-1">{framework.name}</div>
                          <div className="text-white/60 text-xs mb-2">{framework.description}</div>
                          <div className="text-white/40 text-xs">
                            {framework.principles.length} principles
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Dilemmas */}
                  {activeDilemmas.filter(d => d.agentId === selectedAgent.id).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Active Moral Dilemmas
                      </h4>
                      <div className="space-y-3">
                        {activeDilemmas.filter(d => d.agentId === selectedAgent.id).map(dilemma => (
                          <div key={dilemma.id} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                            <p className="text-white mb-4">{dilemma.description}</p>
                            <div className="space-y-2">
                              {dilemma.options.map((option, index) => {
                                const framework = agentFrameworks.get(selectedAgent.id);
                                const scores = framework && dilemma.ethicalScores.get(framework.name);
                                const evaluation = scores?.[index]?.evaluation;

                                return (
                                  <button
                                    key={index}
                                    onClick={() => resolveDilemma(dilemma, index)}
                                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-left transition-colors"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-white text-sm font-medium">{option.label}</span>
                                      {evaluation && (
                                        <div className={`px-2 py-1 rounded text-xs ${
                                          evaluation.permissible
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-red-500/20 text-red-300'
                                        }`}>
                                          {(evaluation.score * 100).toFixed(0)}% ethical
                                        </div>
                                      )}
                                    </div>
                                    {evaluation && evaluation.violations.length > 0 && (
                                      <div className="text-xs text-red-400">
                                        ⚠️ Violates: {evaluation.violations.map(v => v.principle).join(', ')}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ethics History */}
                  {ethicsHistory.filter(h => h.agent === selectedAgent.name).length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Decision History</h4>
                      <div className="space-y-2">
                        {ethicsHistory.filter(h => h.agent === selectedAgent.name).slice(-5).reverse().map((record, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-white text-sm">{record.dilemma}</div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                record.evaluation.permissible
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {record.evaluation.permissible ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              </div>
                            </div>
                            <div className="text-cyan-400 text-xs mb-1">Chose: {record.choice}</div>
                            <div className="text-white/60 text-xs">
                              {new Date(record.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Scale className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to configure ethical framework</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}