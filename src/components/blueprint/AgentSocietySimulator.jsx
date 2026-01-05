import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Play, Pause, Settings, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export class AgentSociety {
  constructor(name, config) {
    this.name = name;
    this.agents = [];
    this.resources = config.resources || { food: 100, shelter: 10, tools: 5, water: 100, knowledge: 0 };
    this.rules = config.rules || [];
    this.goals = config.goals || [];
    this.socialStructure = config.socialStructure || 'egalitarian';
    this.emergentBehaviors = [];
    this.history = [];
    this.interactionRules = config.interactionRules || this.getDefaultInteractionRules();
    this.resourceManagement = config.resourceManagement || { distribution: 'equal', threshold: 20 };
    this.collectiveGoals = config.collectiveGoals || [];
    this.culturalTraits = [];
    this.conflicts = [];
    this.alliances = [];
  }

  getDefaultInteractionRules() {
    return {
      cooperation: { threshold: 50, benefit: 1.5 },
      competition: { threshold: -30, penalty: 0.8 },
      trading: { enabled: true, fairness: 0.7 },
      teaching: { enabled: true, knowledgeTransfer: 0.3 }
    };
  }

  addAgent(agent) {
    this.agents.push({
      ...agent,
      societyRole: this.assignRole(agent),
      relationships: new Map(),
      contribution: 0
    });
  }

  assignRole(agent) {
    const roles = ['leader', 'worker', 'explorer', 'builder', 'trader'];
    return roles[Math.floor(Math.random() * roles.length)];
  }

  simulate(deltaTime) {
    this.agents.forEach(agent => {
      this.updateRelationships(agent);
      this.performRoleActions(agent);
      this.applyInteractionRules(agent);

      // Learning and adaptation
      if (Math.random() > 0.8) {
        this.learnFromExperience(agent, {
          action: agent.societyRole,
          success: agent.contribution > 30
        });
      }
    });

    this.manageResources();
    this.handleConflicts();
    this.manageAlliances();
    this.detectRivalries();
    this.checkEmergentBehaviors();
    this.evaluateGoals();
    this.evolveCulture();
    this.recordHistory();
  }

  applyInteractionRules(agent) {
    this.agents.forEach(other => {
      if (agent === other) return;
      
      const relationship = agent.relationships.get(other.id) || 0;
      
      // Cooperation
      if (relationship > this.interactionRules.cooperation.threshold) {
        if (Math.random() > 0.7) {
          this.resources.food += this.interactionRules.cooperation.benefit;
          agent.contribution += 1;
          other.contribution += 1;
        }
      }
      
      // Trading
      if (this.interactionRules.trading.enabled && Math.random() > 0.8) {
        const trade = Math.random() * 5;
        agent.contribution += trade;
        other.contribution += trade * this.interactionRules.trading.fairness;
      }
      
      // Teaching/Knowledge Transfer
      if (this.interactionRules.teaching.enabled && agent.contribution > other.contribution) {
        this.resources.knowledge += this.interactionRules.teaching.knowledgeTransfer;
      }
    });
  }

  handleConflicts() {
    if (this.resources.food < 30 && this.agents.length > 15) {
      const conflict = {
        type: 'resource_scarcity',
        participants: this.agents.slice(0, Math.floor(Math.random() * 5) + 2),
        severity: 'high',
        timestamp: Date.now()
      };
      this.conflicts.push(conflict);
      
      if (this.conflicts.length > 3 && !this.emergentBehaviors.includes('conflict_resolution')) {
        this.emergentBehaviors.push('conflict_resolution');
      }
    }
  }

  manageAlliances() {
    // Form alliances between agents with high relationships
    this.agents.forEach((agent1, i) => {
      this.agents.slice(i + 1).forEach(agent2 => {
        const relationship = agent1.relationships.get(agent2.id) || 0;
        if (relationship > 80 && Math.random() > 0.9) {
          const existingAlliance = this.alliances.find(a => 
            a.members.includes(agent1.id) && a.members.includes(agent2.id)
          );
          
          if (!existingAlliance) {
            this.alliances.push({
              members: [agent1.id, agent2.id],
              strength: relationship,
              formed: Date.now()
            });
          }
        }
      });
    });
  }

  evolveCulture() {
    const avgContribution = this.agents.reduce((sum, a) => sum + a.contribution, 0) / this.agents.length;
    
    if (avgContribution > 50 && !this.culturalTraits.includes('work_ethic')) {
      this.culturalTraits.push('work_ethic');
    }
    
    if (this.getAverageRelationship() > 70 && !this.culturalTraits.includes('harmony')) {
      this.culturalTraits.push('harmony');
    }
    
    if (this.resources.knowledge > 50 && !this.culturalTraits.includes('innovation')) {
      this.culturalTraits.push('innovation');
    }
  }

  updateSentiment(agent, interactionType, target) {
    if (!agent.sentiment) agent.sentiment = { overall: 0, recent: [] };
    
    const sentimentChange = {
      cooperation: 10,
      conflict: -15,
      trade: 5,
      teaching: 8,
      helped: 12,
      betrayed: -20
    }[interactionType] || 0;

    agent.sentiment.overall = Math.max(-100, Math.min(100, agent.sentiment.overall + sentimentChange));
    agent.sentiment.recent.push({ type: interactionType, target: target?.id, value: sentimentChange, time: Date.now() });
    
    if (agent.sentiment.recent.length > 20) {
      agent.sentiment.recent = agent.sentiment.recent.slice(-20);
    }
  }

  learnFromExperience(agent, experience) {
    if (!agent.learningHistory) agent.learningHistory = [];
    
    agent.learningHistory.push({
      experience,
      outcome: experience.success ? 'positive' : 'negative',
      timestamp: Date.now()
    });

    if (experience.success) {
      agent.confidence = Math.min(100, (agent.confidence || 50) + 5);
    } else {
      agent.confidence = Math.max(0, (agent.confidence || 50) - 3);
    }
  }

  formAlliance(agent1, agent2) {
    const relationship = agent1.relationships.get(agent2.id) || 0;
    
    if (relationship > 75) {
      const existingAlliance = this.alliances.find(a => 
        a.members.includes(agent1.id) && a.members.includes(agent2.id)
      );
      
      if (!existingAlliance) {
        this.alliances.push({
          members: [agent1.id, agent2.id],
          strength: relationship,
          formed: Date.now(),
          type: 'mutual_benefit'
        });
        this.updateSentiment(agent1, 'cooperation', agent2);
        this.updateSentiment(agent2, 'cooperation', agent1);
      }
    }
  }

  detectRivalries() {
    if (!this.rivalries) this.rivalries = [];
    
    this.agents.forEach(agent1 => {
      this.agents.forEach(agent2 => {
        if (agent1 !== agent2) {
          const relationship = agent1.relationships.get(agent2.id) || 0;
          
          if (relationship < -50) {
            const exists = this.rivalries.find(r => 
              r.parties.includes(agent1.id) && r.parties.includes(agent2.id)
            );
            
            if (!exists) {
              this.rivalries.push({
                parties: [agent1.id, agent2.id],
                intensity: Math.abs(relationship),
                cause: 'resource_competition',
                started: Date.now()
              });
              this.updateSentiment(agent1, 'conflict', agent2);
              this.updateSentiment(agent2, 'conflict', agent1);
            }
          }
        }
      });
    });
  }

  updateRelationships(agent) {
    this.agents.forEach(other => {
      if (agent !== other) {
        const current = agent.relationships.get(other.id) || 0;
        const interaction = Math.random() * 2 - 1;
        agent.relationships.set(other.id, Math.max(-100, Math.min(100, current + interaction)));
      }
    });
  }

  performRoleActions(agent) {
    switch (agent.societyRole) {
      case 'worker':
        this.resources.food += 2;
        agent.contribution += 2;
        break;
      case 'explorer':
        if (Math.random() > 0.7) {
          this.resources.tools += 1;
          agent.contribution += 3;
        }
        break;
      case 'builder':
        if (this.resources.tools > 0) {
          this.resources.shelter += 1;
          this.resources.tools -= 1;
          agent.contribution += 4;
        }
        break;
    }
  }

  checkEmergentBehaviors() {
    const avgRelationship = this.getAverageRelationship();
    
    if (avgRelationship > 70 && !this.emergentBehaviors.includes('cooperation')) {
      this.emergentBehaviors.push('cooperation');
    }
    
    if (this.resources.food < 20 && !this.emergentBehaviors.includes('resource_sharing')) {
      this.emergentBehaviors.push('resource_sharing');
    }
    
    if (this.agents.length > 10 && !this.emergentBehaviors.includes('hierarchy_formation')) {
      this.emergentBehaviors.push('hierarchy_formation');
    }
  }

  manageResources() {
    // Resource consumption
    this.resources.food = Math.max(0, this.resources.food - this.agents.length * 0.5);
    this.resources.water = Math.max(0, this.resources.water - this.agents.length * 0.3);
    
    // Resource distribution based on management system
    if (this.resourceManagement.distribution === 'equal') {
      // Equal distribution
    } else if (this.resourceManagement.distribution === 'merit') {
      // Top contributors get more
      const topContributors = this.agents.sort((a, b) => b.contribution - a.contribution).slice(0, 3);
      topContributors.forEach(agent => agent.contribution += 2);
    } else if (this.resourceManagement.distribution === 'need') {
      // Those with lowest resources get priority
    }
    
    // Critical resource warning
    if (this.resources.food < this.resourceManagement.threshold) {
      if (!this.emergentBehaviors.includes('resource_crisis')) {
        this.emergentBehaviors.push('resource_crisis');
      }
    }
  }

  evaluateGoals() {
    this.goals.forEach(goal => {
      if (goal.condition(this)) {
        goal.achieved = true;
      }
    });
  }

  recordHistory() {
    this.history.push({
      timestamp: Date.now(),
      population: this.agents.length,
      resources: { ...this.resources },
      emergentBehaviors: [...this.emergentBehaviors]
    });
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  getAverageRelationship() {
    let total = 0;
    let count = 0;
    this.agents.forEach(agent => {
      agent.relationships.forEach(value => {
        total += value;
        count++;
      });
    });
    return count > 0 ? total / count : 0;
  }

  getStats() {
    const avgSentiment = this.agents.reduce((sum, a) => sum + (a.sentiment?.overall || 0), 0) / this.agents.length;

    return {
      population: this.agents.length,
      resources: this.resources,
      avgRelationship: this.getAverageRelationship().toFixed(1),
      avgSentiment: avgSentiment.toFixed(1),
      emergentBehaviors: this.emergentBehaviors,
      topContributors: this.agents.sort((a, b) => b.contribution - a.contribution).slice(0, 3),
      conflicts: this.conflicts.length,
      alliances: this.alliances.length,
      rivalries: this.rivalries?.length || 0,
      culturalTraits: this.culturalTraits
    };
  }
}

export default function AgentSocietySimulator({ show, onClose, agents }) {
  const [society, setSociety] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState(null);
  const [populationSize, setPopulationSize] = useState(20);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeScenario, setActiveScenario] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    culturalMutationRate: 0.1,
    conflictResolution: 'negotiation',
    environmentalStress: 0
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showScenarioGenerator, setShowScenarioGenerator] = useState(false);
  const simulationRef = useRef(null);

  const scenarios = [
    { id: 'scarcity', name: 'Resource Scarcity', description: 'Food drops to critical levels', effect: (s) => { s.resources.food = 20; } },
    { id: 'threat', name: 'External Threat', description: 'Population faces external danger', effect: (s) => { s.resources.shelter -= 5; } },
    { id: 'abundance', name: 'Resource Abundance', description: 'Resources become plentiful', effect: (s) => { s.resources.food += 100; s.resources.water += 50; } },
    { id: 'disease', name: 'Disease Outbreak', description: 'Agents become less productive', effect: (s) => { s.agents.forEach(a => a.contribution *= 0.5); } },
    { id: 'discovery', name: 'Major Discovery', description: 'Knowledge increases dramatically', effect: (s) => { s.resources.knowledge += 50; } }
  ];

  const applyScenario = (scenario) => {
    if (society && scenario) {
      scenario.effect(society);
      setActiveScenario(scenario.name);
      toast.success(`Scenario applied: ${scenario.name}`);
      setTimeout(() => setActiveScenario(null), 3000);
    }
  };

  const createSociety = async () => {
    const config = {
      resources: { food: 100, shelter: 10, tools: 5 },
      rules: ['cooperation', 'resource_sharing'],
      goals: [
        { name: 'Survival', condition: (s) => s.resources.food > 50 },
        { name: 'Growth', condition: (s) => s.agents.length > 30 }
      ],
      socialStructure: 'egalitarian',
      culturalMutationRate: simulationParams.culturalMutationRate
    };

    const newSociety = new AgentSociety('AI Society', config);
    
    for (let i = 0; i < populationSize; i++) {
      newSociety.addAgent({
        id: `agent_${i}`,
        name: `Agent ${i}`,
        personality: ['curious', 'social', 'helpful'][Math.floor(Math.random() * 3)]
      });
    }

    setSociety(newSociety);
    setStats(newSociety.getStats());
    toast.success('Society created!');
  };

  const startSimulation = () => {
    setIsSimulating(true);
    simulationRef.current = setInterval(() => {
      if (society) {
        society.simulate(1);
        setStats(society.getStats());
      }
    }, 1000 / simulationSpeed);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Agent Society Simulator</h3>
              <p className="text-white/60">Complex social dynamics & emergent behaviors</p>
            </div>
          </div>

          {!society ? (
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Population Size</label>
                <input type="range" min="5" max="100" value={populationSize} onChange={(e) => setPopulationSize(Number(e.target.value))} className="w-full" />
                <div className="text-cyan-400 text-sm text-center">{populationSize} agents</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3 text-sm">Simulation Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Cultural Mutation Rate</label>
                    <input type="range" min="0" max="1" step="0.1" value={simulationParams.culturalMutationRate} onChange={(e) => setSimulationParams({...simulationParams, culturalMutationRate: Number(e.target.value)})} className="w-full" />
                    <div className="text-cyan-400 text-xs text-center">{simulationParams.culturalMutationRate}</div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Conflict Resolution</label>
                    <select value={simulationParams.conflictResolution} onChange={(e) => setSimulationParams({...simulationParams, conflictResolution: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs">
                      <option value="negotiation">Negotiation</option>
                      <option value="voting">Democratic Voting</option>
                      <option value="hierarchy">Hierarchical</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={createSociety} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:opacity-90">
                Create Society
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button onClick={isSimulating ? stopSimulation : startSimulation} className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${isSimulating ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
                  {isSimulating ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}
                </button>
                <div className="flex items-center gap-2 px-4 bg-white/5 rounded-xl">
                  <span className="text-white/60 text-sm">Speed</span>
                  <input type="range" min="0.5" max="5" step="0.5" value={simulationSpeed} onChange={(e) => setSimulationSpeed(Number(e.target.value))} className="w-24" />
                  <span className="text-cyan-400 text-sm">{simulationSpeed}x</span>
                </div>
              </div>

              {stats && (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                      <div className="text-xs text-blue-400 mb-1">Population</div>
                      <div className="text-2xl font-bold text-white">{stats.population}</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                      <div className="text-xs text-green-400 mb-1">Food</div>
                      <div className="text-2xl font-bold text-white">{stats.resources.food.toFixed(0)}</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                      <div className="text-xs text-purple-400 mb-1">Shelter</div>
                      <div className="text-2xl font-bold text-white">{stats.resources.shelter}</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                      <div className="text-xs text-orange-400 mb-1">Avg Relations</div>
                      <div className="text-2xl font-bold text-white">{stats.avgRelationship}</div>
                    </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-white/60">Conflicts</div>
                      <div className="text-lg font-bold text-red-400">{stats.conflicts}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-white/60">Alliances</div>
                      <div className="text-lg font-bold text-blue-400">{stats.alliances}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-white/60">Knowledge</div>
                      <div className="text-lg font-bold text-purple-400">{stats.resources.knowledge?.toFixed(0) || 0}</div>
                    </div>
                    </div>

                  {stats.emergentBehaviors.length > 0 && (
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-cyan-400 font-semibold">Emergent Behaviors</h4>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {stats.emergentBehaviors.map(behavior => (
                          <div key={behavior} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-300 text-xs capitalize">
                            {behavior.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.culturalTraits && stats.culturalTraits.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                      <h4 className="text-purple-400 font-semibold mb-2">Cultural Traits</h4>
                      <div className="flex gap-2 flex-wrap">
                        {stats.culturalTraits.map(trait => (
                          <div key={trait} className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-xs capitalize">
                            {trait.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">Social Dynamics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-white/60 text-xs">Avg Sentiment</div>
                        <div className={`text-lg font-bold ${parseFloat(stats.avgSentiment) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.avgSentiment > 0 ? '+' : ''}{stats.avgSentiment}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">Rivalries</div>
                        <div className="text-lg font-bold text-red-400">{stats.rivalries}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Top Contributors</h4>
                    <div className="space-y-2">
                      {stats.topContributors.map((agent, i) => (
                        <div key={agent.id} className="flex items-center justify-between bg-white/5 rounded p-2">
                          <div className="flex items-center gap-2">
                            <div className="text-yellow-400 font-bold">#{i + 1}</div>
                            <div className="text-white text-sm">{agent.name}</div>
                            <div className="px-2 py-0.5 bg-purple-500/20 rounded text-purple-300 text-xs">{agent.societyRole}</div>
                          </div>
                          <div className="text-green-400 text-sm">{agent.contribution} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      <DynamicScenarioGenerator
        show={showScenarioGenerator}
        onClose={() => setShowScenarioGenerator(false)}
        onScenarioGenerated={(scenario) => {
          if (society) {
            scenario.effects && Object.assign(society.resources, scenario.effects);
            toast.success(`Scenario "${scenario.name}" applied!`);
          }
        }}
        currentState={stats || {}}
      />
    </AnimatePresence>
  );
}