import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Sword, Handshake, TrendingUp, Scale, Users } from 'lucide-react';
import { toast } from 'sonner';

export class Faction {
  constructor(id, name, ideology) {
    this.id = id;
    this.name = name;
    this.ideology = ideology;
    this.members = [];
    this.goals = [];
    this.resources = { shared: 0 };
    this.laws = [];
    this.norms = [];
    this.power = 0;
    this.influence = 0;
    this.relationships = new Map();
  }

  addMember(agentId) {
    if (!this.members.includes(agentId)) {
      this.members.push(agentId);
      this.power += 10;
    }
  }

  proposeNorm(norm) {
    this.norms.push({
      ...norm,
      proposedAt: Date.now(),
      support: 1
    });
  }

  updateInfluence(societySize) {
    this.influence = (this.members.length / societySize) * this.power;
  }
}

export class SocietalEvolution {
  constructor() {
    this.factions = new Map();
    this.globalLaws = [];
    this.culturalNorms = [];
    this.structure = 'emerging';
    this.evolutionHistory = [];
  }

  evolveSociety(agentActions, ethicalDrifts) {
    // Detect emergent structures
    const cooperationRate = agentActions.filter(a => a.type === 'cooperation').length / agentActions.length;
    const conflictRate = agentActions.filter(a => a.type === 'conflict').length / agentActions.length;
    const avgDrift = ethicalDrifts.reduce((sum, d) => sum + d, 0) / ethicalDrifts.length;

    let newStructure = this.structure;

    if (cooperationRate > 0.7 && avgDrift < 0.2) {
      newStructure = 'harmonious_collective';
    } else if (conflictRate > 0.5) {
      newStructure = 'tribal_conflict';
    } else if (avgDrift > 0.6) {
      newStructure = 'ethical_chaos';
    } else if (this.factions.size > 3) {
      newStructure = 'multi_faction_state';
    }

    if (newStructure !== this.structure) {
      this.evolutionHistory.push({
        from: this.structure,
        to: newStructure,
        timestamp: Date.now(),
        factors: { cooperationRate, conflictRate, avgDrift }
      });
      this.structure = newStructure;
      return true;
    }

    return false;
  }

  proposeLaw(factionId, law) {
    const faction = this.factions.get(factionId);
    if (!faction) return;

    const support = faction.influence;
    
    if (support > 0.5) {
      this.globalLaws.push({
        ...law,
        proposedBy: factionId,
        adoptedAt: Date.now(),
        enforcement: support
      });
      return true;
    }
    
    return false;
  }

  updateFactionDynamics() {
    // Update relationships between factions
    const factionArray = Array.from(this.factions.values());
    
    factionArray.forEach((faction1, i) => {
      factionArray.slice(i + 1).forEach(faction2 => {
        const ideologicalDistance = this.calculateIdeologicalDistance(faction1, faction2);
        
        let relationship = faction1.relationships.get(faction2.id) || 0;
        
        if (ideologicalDistance < 0.3) {
          relationship += 5; // Growing alliance
        } else if (ideologicalDistance > 0.7) {
          relationship -= 5; // Growing rivalry
        }

        faction1.relationships.set(faction2.id, Math.max(-100, Math.min(100, relationship)));
        faction2.relationships.set(faction1.id, Math.max(-100, Math.min(100, relationship)));
      });
    });
  }

  calculateIdeologicalDistance(faction1, faction2) {
    // Simplified ideological distance
    if (faction1.ideology === faction2.ideology) return 0;
    return Math.random() * 0.8 + 0.2;
  }

  getStats() {
    return {
      factionCount: this.factions.size,
      structure: this.structure,
      laws: this.globalLaws.length,
      norms: this.culturalNorms.length,
      totalMembers: Array.from(this.factions.values()).reduce((sum, f) => sum + f.members.length, 0)
    };
  }
}

export default function FactionDynamicsSystem({ show, onClose, agents, society }) {
  const [societalEvolution] = useState(new SocietalEvolution());
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [showCreateFaction, setShowCreateFaction] = useState(false);
  const [newFaction, setNewFaction] = useState({ name: '', ideology: 'egalitarian' });
  const [alliances, setAlliances] = useState([]);
  const [rivalries, setRivalries] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate agent actions for societal evolution
      const agentActions = agents.map(() => ({
        type: Math.random() > 0.5 ? 'cooperation' : 'conflict'
      }));
      
      const ethicalDrifts = agents.map(() => Math.random() * 0.5);

      const evolved = societalEvolution.evolveSociety(agentActions, ethicalDrifts);
      
      if (evolved) {
        const latest = societalEvolution.evolutionHistory[societalEvolution.evolutionHistory.length - 1];
        toast.success(`Society evolved: ${latest.to.replace('_', ' ')}`);
      }

      societalEvolution.updateFactionDynamics();
      updateRelationships();
    }, 4000);

    return () => clearInterval(interval);
  }, [agents, societalEvolution]);

  const updateRelationships = () => {
    const newAlliances = [];
    const newRivalries = [];

    societalEvolution.factions.forEach((faction1) => {
      faction1.relationships.forEach((value, faction2Id) => {
        const faction2 = societalEvolution.factions.get(faction2Id);
        if (faction2) {
          if (value > 60) {
            newAlliances.push({ faction1: faction1.name, faction2: faction2.name, strength: value });
          } else if (value < -60) {
            newRivalries.push({ faction1: faction1.name, faction2: faction2.name, intensity: Math.abs(value) });
          }
        }
      });
    });

    setAlliances(newAlliances);
    setRivalries(newRivalries);
  };

  const createFaction = () => {
    if (!newFaction.name) return;

    const faction = new Faction(
      `faction_${Date.now()}`,
      newFaction.name,
      newFaction.ideology
    );

    societalEvolution.factions.set(faction.id, faction);
    setNewFaction({ name: '', ideology: 'egalitarian' });
    setShowCreateFaction(false);
    toast.success(`Faction "${faction.name}" created!`);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Faction Dynamics & Societal Evolution</h3>
                <p className="text-white/60 text-sm">Complex inter-faction relations and emergent social structures</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                <h4 className="text-purple-400 font-semibold mb-4">Societal Structure</h4>
                <div className="text-white text-3xl font-bold mb-2 capitalize">
                  {societalEvolution.structure.replace('_', ' ')}
                </div>
                <div className="text-white/70 text-sm">
                  {societalEvolution.globalLaws.length} laws • {societalEvolution.factions.size} factions
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {['Alliances', 'Rivalries', 'Laws'].map((label, i) => {
                  const values = [alliances.length, rivalries.length, societalEvolution.globalLaws.length];
                  return (
                    <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-white/60 text-xs mb-1">{label}</div>
                      <div className="text-white text-2xl font-bold">{values[i]}</div>
                    </div>
                  );
                })}
              </div>

              {alliances.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-green-400" />
                    Active Alliances
                  </h4>
                  <div className="space-y-2">
                    {alliances.map((alliance, i) => (
                      <div key={i} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="text-white text-sm">
                          {alliance.faction1} ⇄ {alliance.faction2}
                        </div>
                        <div className="text-green-400 text-xs">Strength: {alliance.strength}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rivalries.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sword className="w-5 h-5 text-red-400" />
                    Active Rivalries
                  </h4>
                  <div className="space-y-2">
                    {rivalries.map((rivalry, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="text-white text-sm">
                          {rivalry.faction1} ⚔️ {rivalry.faction2}
                        </div>
                        <div className="text-red-400 text-xs">Intensity: {rivalry.intensity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-96 border-l border-white/10 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold text-sm">Factions</h4>
                <button
                  onClick={() => setShowCreateFaction(true)}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-xs hover:bg-red-500/30"
                >
                  Create
                </button>
              </div>

              {showCreateFaction && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <input
                    type="text"
                    placeholder="Faction name"
                    value={newFaction.name}
                    onChange={(e) => setNewFaction({ ...newFaction, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2"
                  />
                  <select
                    value={newFaction.ideology}
                    onChange={(e) => setNewFaction({ ...newFaction, ideology: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm mb-3"
                  >
                    <option value="egalitarian">Egalitarian</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="libertarian">Libertarian</option>
                    <option value="collectivist">Collectivist</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={createFaction} className="flex-1 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 text-sm">
                      Create
                    </button>
                    <button onClick={() => setShowCreateFaction(false)} className="px-4 py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {societalEvolution.factions.size === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No factions yet</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(societalEvolution.factions.values()).map(faction => (
                    <div
                      key={faction.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFaction?.id === faction.id
                          ? 'bg-red-500/20 border-red-500/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedFaction(faction)}
                    >
                      <div className="text-white text-sm font-medium mb-1">{faction.name}</div>
                      <div className="text-white/60 text-xs mb-2 capitalize">{faction.ideology}</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Members: {faction.members.length}</span>
                        <span className="text-cyan-400">Power: {faction.power}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {societalEvolution.evolutionHistory.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-3 text-sm">Evolution History</h4>
                  <div className="space-y-2">
                    {societalEvolution.evolutionHistory.slice(-3).reverse().map((ev, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-2">
                        <div className="text-white text-xs">
                          {ev.from.replace('_', ' ')} → {ev.to.replace('_', ' ')}
                        </div>
                        <div className="text-white/60 text-xs">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
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