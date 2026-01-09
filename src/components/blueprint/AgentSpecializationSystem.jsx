import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, TrendingUp, Award, Hammer, Map, Users as UsersIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const PROFESSIONS = {
  crafter: {
    name: 'Crafter',
    icon: '🔨',
    description: 'Specializes in creating tools and items',
    skills: ['crafting', 'tool_making', 'repair'],
    bonuses: { resourceGathering: 1.3, construction: 1.5 },
    requirements: { crafting: 50, construction: 30 }
  },
  explorer: {
    name: 'Explorer',
    icon: '🗺️',
    description: 'Discovers new territories and resources',
    skills: ['exploration', 'navigation', 'survival'],
    bonuses: { movementSpeed: 1.4, discovery: 2.0 },
    requirements: { exploration: 50, mobility: 40 }
  },
  diplomat: {
    name: 'Diplomat',
    icon: '🤝',
    description: 'Mediates conflicts and builds alliances',
    skills: ['negotiation', 'persuasion', 'mediation'],
    bonuses: { relationshipGain: 1.5, conflictResolution: 2.0 },
    requirements: { social: 60, communication: 50 }
  },
  warrior: {
    name: 'Warrior',
    icon: '⚔️',
    description: 'Protects the community from threats',
    skills: ['combat', 'defense', 'tactics'],
    bonuses: { strength: 1.5, defense: 1.4 },
    requirements: { combat: 50, courage: 40 }
  },
  healer: {
    name: 'Healer',
    icon: '💚',
    description: 'Tends to the health and wellbeing of others',
    skills: ['healing', 'medicine', 'empathy'],
    bonuses: { healingPower: 2.0, resourceEfficiency: 1.3 },
    requirements: { empathy: 60, medicine: 40 }
  },
  merchant: {
    name: 'Merchant',
    icon: '💰',
    description: 'Trades goods and manages resources',
    skills: ['trading', 'bartering', 'resource_management'],
    bonuses: { tradingValue: 1.6, resourceGain: 1.4 },
    requirements: { trading: 50, social: 40 }
  },
  scholar: {
    name: 'Scholar',
    icon: '📚',
    description: 'Researches and shares knowledge',
    skills: ['research', 'teaching', 'knowledge_transfer'],
    bonuses: { learningSpeed: 1.5, knowledgeGain: 2.0 },
    requirements: { intelligence: 60, research: 50 }
  }
};

export class AgentSpecialization {
  constructor(agentId) {
    this.agentId = agentId;
    this.profession = null;
    this.skills = new Map();
    this.experience = 0;
    this.level = 1;
    this.specializations = [];
    
    // Initialize basic skills
    Object.keys(PROFESSIONS).forEach(prof => {
      PROFESSIONS[prof].skills.forEach(skill => {
        if (!this.skills.has(skill)) {
          this.skills.set(skill, 0);
        }
      });
    });
  }

  gainExperience(amount, skillType) {
    this.experience += amount;
    
    if (skillType && this.skills.has(skillType)) {
      this.skills.set(skillType, this.skills.get(skillType) + amount);
    }

    // Level up
    const requiredExp = this.level * 100;
    if (this.experience >= requiredExp) {
      this.level++;
      this.experience = 0;
      return true; // Leveled up
    }

    // Check for profession qualification
    this.checkProfessionQualification();
    return false;
  }

  checkProfessionQualification() {
    if (this.profession) return;

    for (const [profKey, profData] of Object.entries(PROFESSIONS)) {
      let qualifies = true;
      
      for (const [skill, required] of Object.entries(profData.requirements)) {
        if ((this.skills.get(skill) || 0) < required) {
          qualifies = false;
          break;
        }
      }

      if (qualifies) {
        this.profession = profKey;
        this.specializations.push({
          profession: profKey,
          acquiredAt: Date.now(),
          level: 1
        });
        return profKey;
      }
    }

    return null;
  }

  getSkillLevel(skill) {
    return this.skills.get(skill) || 0;
  }

  getProfessionBonuses() {
    if (!this.profession) return {};
    return PROFESSIONS[this.profession].bonuses;
  }

  getStats() {
    return {
      profession: this.profession,
      level: this.level,
      experience: this.experience,
      totalSkills: this.skills.size,
      topSkills: Array.from(this.skills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([skill, value]) => ({ skill, value }))
    };
  }
}

export default function AgentSpecializationSystem({ show, onClose, agents, onSpecializationUpdate }) {
  const [specializations] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [professionStats, setProfessionStats] = useState({});
  const [societyImpact, setSocietyImpact] = useState(null);

  useEffect(() => {
    // Initialize specializations
    agents.forEach(agent => {
      if (!specializations.has(agent.id)) {
        const spec = new AgentSpecialization(agent.id);
        
        // Simulate some initial skills based on agent properties
        if (agent.personality === 'curious') {
          spec.gainExperience(30, 'exploration');
        }
        if (agent.personality === 'social') {
          spec.gainExperience(40, 'social');
        }
        
        specializations.set(agent.id, spec);
      }
    });

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    // Simulate skill growth
    const interval = setInterval(() => {
      specializations.forEach((spec, agentId) => {
        // Random skill growth based on activity
        const randomSkill = Array.from(spec.skills.keys())[Math.floor(Math.random() * spec.skills.size)];
        const leveledUp = spec.gainExperience(Math.random() * 5, randomSkill);
        
        if (leveledUp) {
          const agent = agents.find(a => a.id === agentId);
          toast.success(`${agent?.name} leveled up to ${spec.level}!`);
        }
      });

      updateStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [specializations, agents]);

  const updateStats = () => {
    const stats = {};
    let totalBonuses = { productivity: 0, social: 0, survival: 0 };

    specializations.forEach(spec => {
      const profession = spec.profession;
      if (profession) {
        stats[profession] = (stats[profession] || 0) + 1;
        
        const bonuses = spec.getProfessionBonuses();
        if (bonuses.resourceGathering) totalBonuses.productivity += bonuses.resourceGathering;
        if (bonuses.relationshipGain) totalBonuses.social += bonuses.relationshipGain;
        if (bonuses.defense) totalBonuses.survival += bonuses.defense;
      }
    });

    setProfessionStats(stats);
    setSocietyImpact({
      diversity: Object.keys(stats).length,
      productivity: totalBonuses.productivity / specializations.size,
      social: totalBonuses.social / specializations.size,
      survival: totalBonuses.survival / specializations.size
    });
  };

  const assignProfession = (agent, professionKey) => {
    const spec = specializations.get(agent.id);
    if (spec) {
      spec.profession = professionKey;
      spec.specializations.push({
        profession: professionKey,
        acquiredAt: Date.now(),
        level: 1
      });
      onSpecializationUpdate?.(agent, spec);
      toast.success(`${agent.name} is now a ${PROFESSIONS[professionKey].name}!`);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Specialization System</h3>
                <p className="text-white/60 text-sm">Develop unique skill sets and professions</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Agents</h4>
              <div className="space-y-2 mb-6">
                {agents.map(agent => {
                  const spec = specializations.get(agent.id);
                  const profession = spec?.profession ? PROFESSIONS[spec.profession] : null;
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAgent?.id === agent.id
                          ? 'bg-orange-500/20 border border-orange-500/40'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-white text-sm font-medium">{agent.name}</span>
                      </div>
                      <div className="text-xs text-white/60">
                        {profession ? `${profession.icon} ${profession.name} Lv${spec.level}` : 'No profession'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {societyImpact && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-3 text-sm">Society Impact</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Diversity</span>
                      <span className="text-white font-semibold">{societyImpact.diversity} types</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Productivity</span>
                      <span className="text-green-400 font-semibold">+{(societyImpact.productivity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Social Cohesion</span>
                      <span className="text-blue-400 font-semibold">+{(societyImpact.social * 100).toFixed(0)}%</span>
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
                      {selectedAgent.name}'s Specialization
                    </h3>
                    
                    {specializations.get(selectedAgent.id) && (() => {
                      const spec = specializations.get(selectedAgent.id);
                      const stats = spec.getStats();
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="text-white/60 text-xs mb-1">Level</div>
                              <div className="text-white text-2xl font-bold">{stats.level}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="text-white/60 text-xs mb-1">Experience</div>
                              <div className="text-cyan-400 text-2xl font-bold">{stats.experience}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="text-white/60 text-xs mb-1">Profession</div>
                              <div className="text-white text-lg font-bold">
                                {stats.profession ? PROFESSIONS[stats.profession].icon : '—'}
                              </div>
                            </div>
                          </div>

                          {/* Current Profession */}
                          {stats.profession && (
                            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-4">
                              <h4 className="text-orange-400 font-semibold mb-2">
                                {PROFESSIONS[stats.profession].icon} {PROFESSIONS[stats.profession].name}
                              </h4>
                              <p className="text-white/70 text-sm mb-3">{PROFESSIONS[stats.profession].description}</p>
                              <div className="space-y-1">
                                <div className="text-white/60 text-xs mb-1">Bonuses:</div>
                                {Object.entries(PROFESSIONS[stats.profession].bonuses).map(([bonus, value]) => (
                                  <div key={bonus} className="text-green-400 text-xs">
                                    +{((value - 1) * 100).toFixed(0)}% {bonus.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Top Skills */}
                          <div>
                            <h4 className="text-white font-semibold mb-3">Top Skills</h4>
                            <div className="space-y-2">
                              {stats.topSkills.map(({ skill, value }) => (
                                <div key={skill} className="bg-white/5 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white text-sm capitalize">{skill.replace('_', ' ')}</span>
                                    <span className="text-cyan-400 text-sm font-bold">{value.toFixed(0)}</span>
                                  </div>
                                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                      style={{ width: `${Math.min(100, value)}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Available Professions */}
                          {!stats.profession && (
                            <div>
                              <h4 className="text-white font-semibold mb-3">Available Professions</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(PROFESSIONS).map(([key, prof]) => {
                                  const meetsReqs = Object.entries(prof.requirements).every(
                                    ([skill, required]) => spec.getSkillLevel(skill) >= required
                                  );

                                  return (
                                    <button
                                      key={key}
                                      onClick={() => meetsReqs && assignProfession(selectedAgent, key)}
                                      disabled={!meetsReqs}
                                      className={`p-4 rounded-xl border text-left transition-colors ${
                                        meetsReqs
                                          ? 'bg-white/5 border-white/20 hover:bg-white/10'
                                          : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <div className="text-2xl mb-2">{prof.icon}</div>
                                      <div className="text-white font-semibold mb-1">{prof.name}</div>
                                      <div className="text-white/60 text-xs">{prof.description}</div>
                                      {!meetsReqs && (
                                        <div className="text-red-400 text-xs mt-2">
                                          Requirements not met
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to view specialization</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profession Distribution */}
            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Profession Distribution</h4>
              <div className="space-y-2">
                {Object.entries(professionStats).map(([prof, count]) => {
                  const profData = PROFESSIONS[prof];
                  return (
                    <div key={prof} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{profData.icon}</span>
                        <span className="text-white text-sm font-medium">{profData.name}</span>
                      </div>
                      <div className="text-cyan-400 text-xs">{count} agent{count > 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
                {Object.keys(professionStats).length === 0 && (
                  <p className="text-white/60 text-sm text-center py-4">No professions assigned yet</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}