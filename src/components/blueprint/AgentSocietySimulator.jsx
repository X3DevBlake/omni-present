import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Play, Pause, Settings, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export class AgentSociety {
  constructor(name, config) {
    this.name = name;
    this.agents = [];
    this.resources = config.resources || { food: 100, shelter: 10, tools: 5 };
    this.rules = config.rules || [];
    this.goals = config.goals || [];
    this.socialStructure = config.socialStructure || 'egalitarian';
    this.emergentBehaviors = [];
    this.history = [];
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
      this.checkEmergentBehaviors();
    });
    
    this.manageResources();
    this.evaluateGoals();
    this.recordHistory();
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
    this.resources.food = Math.max(0, this.resources.food - this.agents.length * 0.5);
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
    return {
      population: this.agents.length,
      resources: this.resources,
      avgRelationship: this.getAverageRelationship().toFixed(1),
      emergentBehaviors: this.emergentBehaviors,
      topContributors: this.agents.sort((a, b) => b.contribution - a.contribution).slice(0, 3)
    };
  }
}

export default function AgentSocietySimulator({ show, onClose, agents }) {
  const [society, setSociety] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState(null);
  const [populationSize, setPopulationSize] = useState(20);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationRef = useRef(null);

  const createSociety = async () => {
    const config = {
      resources: { food: 100, shelter: 10, tools: 5 },
      rules: ['cooperation', 'resource_sharing'],
      goals: [
        { name: 'Survival', condition: (s) => s.resources.food > 50 },
        { name: 'Growth', condition: (s) => s.agents.length > 30 }
      ],
      socialStructure: 'egalitarian'
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
    </AnimatePresence>
  );
}