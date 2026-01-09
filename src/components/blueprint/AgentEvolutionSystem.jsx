import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, GitBranch, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

export class EvolutionaryAgent {
  constructor(agentId, initialTraits = {}) {
    this.agentId = agentId;
    this.traits = {
      curiosity: initialTraits.curiosity || 0.5,
      aggression: initialTraits.aggression || 0.3,
      cooperation: initialTraits.cooperation || 0.6,
      resilience: initialTraits.resilience || 0.5,
      creativity: initialTraits.creativity || 0.4,
      empathy: initialTraits.empathy || 0.5
    };
    this.skills = new Map();
    this.experiences = [];
    this.evolutionHistory = [];
    this.emergentProfessions = [];
    this.adaptationRate = 0.1;
    this.generation = 0;
  }

  processExperience(experience) {
    this.experiences.push({
      type: experience.type,
      outcome: experience.outcome,
      context: experience.context,
      timestamp: Date.now()
    });

    // Evolve traits based on experience
    this.evolveTraits(experience);
    
    // Learn or adapt skills
    this.adaptSkills(experience);
    
    // Check for emergent professions
    this.discoverEmergentProfession();
  }

  evolveTraits(experience) {
    const changes = {};
    
    switch (experience.type) {
      case 'conflict':
        if (experience.outcome === 'success') {
          this.traits.aggression += this.adaptationRate * 0.1;
          this.traits.resilience += this.adaptationRate * 0.15;
          changes.aggression = 0.1;
          changes.resilience = 0.15;
        } else {
          this.traits.cooperation += this.adaptationRate * 0.2;
          changes.cooperation = 0.2;
        }
        break;
      
      case 'cooperation':
        this.traits.cooperation += this.adaptationRate * 0.2;
        this.traits.empathy += this.adaptationRate * 0.15;
        changes.cooperation = 0.2;
        changes.empathy = 0.15;
        break;
      
      case 'exploration':
        this.traits.curiosity += this.adaptationRate * 0.25;
        changes.curiosity = 0.25;
        break;
      
      case 'innovation':
        this.traits.creativity += this.adaptationRate * 0.3;
        changes.creativity = 0.3;
        break;
      
      case 'survival':
        this.traits.resilience += this.adaptationRate * 0.2;
        changes.resilience = 0.2;
        break;
    }

    // Clamp traits to 0-1
    Object.keys(this.traits).forEach(trait => {
      this.traits[trait] = Math.max(0, Math.min(1, this.traits[trait]));
    });

    if (Object.keys(changes).length > 0) {
      this.evolutionHistory.push({
        generation: this.generation++,
        changes,
        trigger: experience.type,
        timestamp: Date.now()
      });
    }
  }

  adaptSkills(experience) {
    const skillMapping = {
      conflict: 'combat',
      cooperation: 'teamwork',
      exploration: 'scouting',
      innovation: 'invention',
      survival: 'endurance',
      resource_gathering: 'foraging'
    };

    const skill = skillMapping[experience.type];
    if (skill) {
      const currentLevel = this.skills.get(skill) || 0;
      const gainAmount = experience.outcome === 'success' ? 10 : 5;
      this.skills.set(skill, currentLevel + gainAmount);
    }

    // Cross-skill learning based on trait combinations
    if (this.traits.creativity > 0.7 && this.traits.curiosity > 0.6) {
      const innovationSkill = this.skills.get('innovation') || 0;
      this.skills.set('innovation', innovationSkill + 3);
    }

    if (this.traits.cooperation > 0.7 && this.traits.empathy > 0.6) {
      const leadershipSkill = this.skills.get('leadership') || 0;
      this.skills.set('leadership', leadershipSkill + 3);
    }
  }

  discoverEmergentProfession() {
    // Define emergent profession patterns
    const patterns = [
      {
        name: 'Peacekeeper',
        icon: '🕊️',
        requirements: { cooperation: 0.7, empathy: 0.7, resilience: 0.5 },
        skills: ['mediation', 'leadership']
      },
      {
        name: 'Innovator',
        icon: '💡',
        requirements: { creativity: 0.8, curiosity: 0.7 },
        skills: ['invention', 'innovation']
      },
      {
        name: 'Survivalist',
        icon: '🏕️',
        requirements: { resilience: 0.8, curiosity: 0.5 },
        skills: ['endurance', 'foraging', 'scouting']
      },
      {
        name: 'Guardian',
        icon: '🛡️',
        requirements: { aggression: 0.6, resilience: 0.7, cooperation: 0.5 },
        skills: ['combat', 'defense']
      },
      {
        name: 'Sage',
        icon: '🧙',
        requirements: { creativity: 0.7, empathy: 0.6, curiosity: 0.7 },
        skills: ['innovation', 'leadership', 'teaching']
      }
    ];

    patterns.forEach(pattern => {
      if (this.emergentProfessions.some(p => p.name === pattern.name)) return;

      // Check trait requirements
      const traitsMatch = Object.entries(pattern.requirements).every(
        ([trait, required]) => this.traits[trait] >= required
      );

      // Check skill requirements
      const skillsMatch = pattern.skills.every(
        skill => (this.skills.get(skill) || 0) >= 30
      );

      if (traitsMatch && skillsMatch) {
        this.emergentProfessions.push({
          ...pattern,
          discoveredAt: Date.now(),
          proficiency: 0
        });
      }
    });
  }

  getEvolutionPathway() {
    return {
      currentTraits: { ...this.traits },
      skillProgression: Array.from(this.skills.entries()).map(([skill, level]) => ({ skill, level })),
      emergentProfessions: this.emergentProfessions,
      evolutionHistory: this.evolutionHistory.slice(-10),
      generation: this.generation
    };
  }

  predictNextEvolution() {
    const predictions = [];
    
    // Predict trait evolution based on current trajectory
    if (this.traits.cooperation > 0.6 && this.traits.empathy > 0.5) {
      predictions.push({
        type: 'trait',
        target: 'leadership',
        probability: 0.7,
        description: 'Likely to develop strong leadership traits'
      });
    }

    if (this.traits.curiosity > 0.7 && this.traits.creativity > 0.6) {
      predictions.push({
        type: 'profession',
        target: 'Innovator',
        probability: 0.8,
        description: 'On path to becoming an Innovator'
      });
    }

    return predictions;
  }
}

export default function AgentEvolutionSystem({ show, onClose, agents, society }) {
  const [evolutionAgents] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [evolutionStats, setEvolutionStats] = useState(null);

  useEffect(() => {
    agents.forEach(agent => {
      if (!evolutionAgents.has(agent.id)) {
        evolutionAgents.set(agent.id, new EvolutionaryAgent(agent.id));
      }
    });

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random experiences
      evolutionAgents.forEach((evoAgent, agentId) => {
        if (Math.random() > 0.7) {
          const experienceTypes = ['conflict', 'cooperation', 'exploration', 'innovation', 'survival'];
          const randomType = experienceTypes[Math.floor(Math.random() * experienceTypes.length)];
          
          evoAgent.processExperience({
            type: randomType,
            outcome: Math.random() > 0.4 ? 'success' : 'failure',
            context: { societal: society?.stats }
          });

          // Notify on emergent profession discovery
          if (evoAgent.emergentProfessions.length > 0) {
            const latest = evoAgent.emergentProfessions[evoAgent.emergentProfessions.length - 1];
            if (Date.now() - latest.discoveredAt < 2000) {
              const agent = agents.find(a => a.id === agentId);
              toast.success(`${agent?.name} discovered profession: ${latest.name} ${latest.icon}`);
            }
          }
        }
      });

      updateStats();
    }, 2000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [evolutionAgents, agents, simulationSpeed, society]);

  const updateStats = () => {
    const stats = {
      totalEvolutions: 0,
      emergentProfessions: 0,
      avgGeneration: 0,
      traitDiversity: 0,
      professionTypes: new Set()
    };

    evolutionAgents.forEach(evoAgent => {
      stats.totalEvolutions += evoAgent.evolutionHistory.length;
      stats.emergentProfessions += evoAgent.emergentProfessions.length;
      stats.avgGeneration += evoAgent.generation;
      
      evoAgent.emergentProfessions.forEach(prof => {
        stats.professionTypes.add(prof.name);
      });
    });

    if (evolutionAgents.size > 0) {
      stats.avgGeneration /= evolutionAgents.size;
    }

    stats.traitDiversity = stats.professionTypes.size;
    setEvolutionStats(stats);
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
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Evolution System</h3>
                <p className="text-white/60 text-sm">Autonomous trait adaptation and emergent professions</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-white/60 text-sm">Speed: {simulationSpeed}x</span>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5" 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Agents</h4>
              <div className="space-y-2 mb-6">
                {agents.map(agent => {
                  const evoAgent = evolutionAgents.get(agent.id);
                  
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
                        Gen {evoAgent?.generation || 0} • {evoAgent?.emergentProfessions.length || 0} professions
                      </div>
                    </button>
                  );
                })}
              </div>

              {evolutionStats && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-3 text-sm">Evolution Stats</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Evolutions</span>
                      <span className="text-white font-semibold">{evolutionStats.totalEvolutions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Generation</span>
                      <span className="text-cyan-400 font-semibold">{evolutionStats.avgGeneration.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Profession Types</span>
                      <span className="text-yellow-400 font-semibold">{evolutionStats.traitDiversity}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {selectedAgent && evolutionAgents.get(selectedAgent.id) ? (
                <>
                  <h3 className="text-white font-bold text-lg mb-4">{selectedAgent.name}'s Evolution</h3>

                  {(() => {
                    const evoAgent = evolutionAgents.get(selectedAgent.id);
                    const pathway = evoAgent.getEvolutionPathway();
                    const predictions = evoAgent.predictNextEvolution();

                    return (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {Object.entries(pathway.currentTraits).map(([trait, value]) => (
                            <div key={trait} className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="text-white/60 text-xs mb-2 capitalize">{trait}</div>
                              <div className="text-white text-xl font-bold mb-2">{(value * 100).toFixed(0)}%</div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${value * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {pathway.emergentProfessions.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                              Emergent Professions
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {pathway.emergentProfessions.map((prof, i) => (
                                <div key={i} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{prof.icon}</span>
                                    <span className="text-white font-semibold">{prof.name}</span>
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    Discovered {Math.floor((Date.now() - prof.discoveredAt) / 1000)}s ago
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3">Skill Progression</h4>
                          <div className="space-y-2">
                            {pathway.skillProgression.slice(0, 6).map(({ skill, level }) => (
                              <div key={skill} className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white text-sm capitalize">{skill}</span>
                                  <span className="text-cyan-400 text-sm font-bold">{level}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    style={{ width: `${Math.min(100, level)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {predictions.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Evolution Predictions
                            </h4>
                            <div className="space-y-2">
                              {predictions.map((pred, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-sm">{pred.description}</span>
                                    <span className="text-cyan-400 text-xs">{(pred.probability * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {pathway.evolutionHistory.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <GitBranch className="w-5 h-5 text-purple-400" />
                              Evolution History
                            </h4>
                            <div className="space-y-2">
                              {pathway.evolutionHistory.reverse().map((ev, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-sm">Generation {ev.generation}</span>
                                    <span className="text-white/60 text-xs">
                                      {new Date(ev.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="text-purple-400 text-xs mb-1">Trigger: {ev.trigger}</div>
                                  <div className="text-white/60 text-xs">
                                    {Object.entries(ev.changes).map(([trait, change]) => 
                                      `${trait}: +${(change * 100).toFixed(0)}%`
                                    ).join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Zap className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to view evolution</p>
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