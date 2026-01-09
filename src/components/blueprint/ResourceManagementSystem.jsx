import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, TrendingDown, AlertTriangle, Droplet, Apple, Wrench, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export class ResourceManager {
  constructor(agentId) {
    this.agentId = agentId;
    this.resources = {
      food: 100,
      water: 100,
      materials: 50,
      energy: 100
    };
    this.maxResources = {
      food: 150,
      water: 150,
      materials: 100,
      energy: 150
    };
    this.consumptionRates = {
      food: 1.0,
      water: 1.2,
      materials: 0.3,
      energy: 0.8
    };
    this.gatheringSkills = {
      food: 1.0,
      water: 1.0,
      materials: 1.0
    };
    this.history = [];
  }

  consume(deltaTime) {
    Object.keys(this.consumptionRates).forEach(resource => {
      const consumed = this.consumptionRates[resource] * deltaTime;
      this.resources[resource] = Math.max(0, this.resources[resource] - consumed);
    });

    this.recordHistory();
  }

  gather(resourceType, amount) {
    const skill = this.gatheringSkills[resourceType] || 1.0;
    const gathered = amount * skill;
    this.resources[resourceType] = Math.min(
      this.maxResources[resourceType],
      this.resources[resourceType] + gathered
    );
  }

  trade(resourceType, amount, withAgent) {
    if (this.resources[resourceType] >= amount) {
      this.resources[resourceType] -= amount;
      return true;
    }
    return false;
  }

  getResourceLevel(resourceType) {
    return this.resources[resourceType] / this.maxResources[resourceType];
  }

  isStarving() {
    return this.resources.food < 20 || this.resources.water < 20;
  }

  getStatus() {
    const criticalResources = Object.entries(this.resources).filter(
      ([type, amount]) => amount < 30
    );

    if (criticalResources.length > 0) {
      return 'critical';
    } else if (Object.values(this.resources).some(v => v < 50)) {
      return 'warning';
    }
    return 'healthy';
  }

  recordHistory() {
    this.history.push({
      timestamp: Date.now(),
      resources: { ...this.resources }
    });

    if (this.history.length > 50) {
      this.history.shift();
    }
  }

  getHistory() {
    return this.history;
  }
}

export class ScarcityEvent {
  constructor(type, severity) {
    this.id = `event_${Date.now()}`;
    this.type = type; // 'drought', 'famine', 'material_shortage'
    this.severity = severity; // 0-1
    this.duration = 10000 + Math.random() * 20000;
    this.startTime = Date.now();
    this.active = true;
    this.affectedResources = this.getAffectedResources();
  }

  getAffectedResources() {
    switch (this.type) {
      case 'drought':
        return { water: 0.5, food: 0.7 };
      case 'famine':
        return { food: 0.3 };
      case 'material_shortage':
        return { materials: 0.4 };
      case 'energy_crisis':
        return { energy: 0.5 };
      default:
        return {};
    }
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    if (elapsed >= this.duration) {
      this.active = false;
    }
  }

  getMultiplier(resourceType) {
    return this.affectedResources[resourceType] || 1.0;
  }
}

export default function ResourceManagementSystem({ show, onClose, agents, society }) {
  const [resourceManagers] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [scarcityEvents, setScarcityEvents] = useState([]);
  const [populationStats, setPopulationStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Initialize resource managers
    agents.forEach(agent => {
      if (!resourceManagers.has(agent.id)) {
        resourceManagers.set(agent.id, new ResourceManager(agent.id));
      }
    });

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    // Simulation loop
    const interval = setInterval(() => {
      // Update scarcity events
      const activeEvents = scarcityEvents.filter(event => {
        event.update();
        return event.active;
      });
      setScarcityEvents(activeEvents);

      // Update resources
      resourceManagers.forEach((manager, agentId) => {
        // Apply consumption
        manager.consume(0.1);

        // Apply scarcity event modifiers
        activeEvents.forEach(event => {
          Object.entries(event.affectedResources).forEach(([resource, multiplier]) => {
            if (manager.resources[resource]) {
              manager.consumptionRates[resource] *= (2 - multiplier);
            }
          });
        });

        // Auto-gather when low
        Object.keys(manager.resources).forEach(resource => {
          if (manager.resources[resource] < 40 && resource !== 'energy') {
            const gatherAmount = Math.random() * 10;
            manager.gather(resource, gatherAmount);
          }
        });

        // Check for starvation
        if (manager.isStarving()) {
          const agent = agents.find(a => a.id === agentId);
          if (Math.random() > 0.95) {
            toast.error(`${agent?.name} is critically low on resources!`);
          }
        }
      });

      updateStats();
      updateChartData();
    }, 1000);

    return () => clearInterval(interval);
  }, [resourceManagers, scarcityEvents, agents]);

  useEffect(() => {
    // Generate random scarcity events
    const eventInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        const eventTypes = ['drought', 'famine', 'material_shortage', 'energy_crisis'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = new ScarcityEvent(randomType, Math.random() * 0.7 + 0.3);
        
        setScarcityEvents(prev => [...prev, event]);
        toast.warning(`Scarcity event: ${randomType.replace('_', ' ')}!`);
      }
    }, 15000);

    return () => clearInterval(eventInterval);
  }, []);

  const updateStats = () => {
    const stats = {
      avgFood: 0,
      avgWater: 0,
      avgMaterials: 0,
      avgEnergy: 0,
      criticalAgents: 0,
      warningAgents: 0,
      healthyAgents: 0
    };

    let count = 0;
    resourceManagers.forEach(manager => {
      stats.avgFood += manager.resources.food;
      stats.avgWater += manager.resources.water;
      stats.avgMaterials += manager.resources.materials;
      stats.avgEnergy += manager.resources.energy;

      const status = manager.getStatus();
      if (status === 'critical') stats.criticalAgents++;
      else if (status === 'warning') stats.warningAgents++;
      else stats.healthyAgents++;

      count++;
    });

    if (count > 0) {
      stats.avgFood /= count;
      stats.avgWater /= count;
      stats.avgMaterials /= count;
      stats.avgEnergy /= count;
    }

    setPopulationStats(stats);
  };

  const updateChartData = () => {
    if (selectedAgent) {
      const manager = resourceManagers.get(selectedAgent.id);
      if (manager) {
        const history = manager.getHistory();
        const data = history.slice(-20).map(entry => ({
          time: new Date(entry.timestamp).toLocaleTimeString(),
          food: entry.resources.food,
          water: entry.resources.water,
          materials: entry.resources.materials,
          energy: entry.resources.energy
        }));
        setChartData(data);
      }
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Resource Management System</h3>
                <p className="text-white/60 text-sm">Track gathering, consumption, and scarcity events</p>
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
                  const manager = resourceManagers.get(agent.id);
                  const status = manager?.getStatus();
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAgent?.id === agent.id
                          ? 'bg-green-500/20 border border-green-500/40'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-white text-sm font-medium">{agent.name}</span>
                        {status === 'critical' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                      </div>
                      <div className={`text-xs ${
                        status === 'critical' ? 'text-red-400' :
                        status === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {status}
                      </div>
                    </button>
                  );
                })}
              </div>

              {populationStats && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-green-400 font-semibold mb-3 text-sm">Population Resources</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Food</span>
                      <span className="text-white font-semibold">{populationStats.avgFood.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Water</span>
                      <span className="text-cyan-400 font-semibold">{populationStats.avgWater.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Critical</span>
                      <span className="text-red-400 font-semibold">{populationStats.criticalAgents}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedAgent && resourceManagers.get(selectedAgent.id) ? (
                <>
                  <h3 className="text-white font-bold text-lg mb-4">
                    {selectedAgent.name}'s Resources
                  </h3>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {Object.entries(resourceManagers.get(selectedAgent.id).resources).map(([type, amount]) => {
                      const max = resourceManagers.get(selectedAgent.id).maxResources[type];
                      const percentage = (amount / max) * 100;
                      const icons = { food: Apple, water: Droplet, materials: Wrench, energy: Zap };
                      const Icon = icons[type];
                      
                      return (
                        <div key={type} className={`rounded-xl p-4 border ${
                          percentage < 30 ? 'bg-red-500/10 border-red-500/30' :
                          percentage < 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-green-500/10 border-green-500/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-white/70" />
                            <span className="text-white text-sm font-medium capitalize">{type}</span>
                          </div>
                          <div className="text-white text-2xl font-bold mb-2">{amount.toFixed(0)}</div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                percentage < 30 ? 'bg-red-500' :
                                percentage < 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resource History Chart */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                    <h4 className="text-white font-semibold mb-4">Resource History</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="time" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                        <Legend />
                        <Line type="monotone" dataKey="food" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2} />
                        <Line type="monotone" dataKey="materials" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to view resources</p>
                  </div>
                </div>
              )}
            </div>

            {/* Events Sidebar */}
            <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Active Scarcity Events</h4>
              {scarcityEvents.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">No active events</p>
              ) : (
                <div className="space-y-2">
                  {scarcityEvents.map(event => (
                    <div key={event.id} className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-white text-sm font-medium capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-white/60 text-xs mb-2">
                        Severity: {(event.severity * 100).toFixed(0)}%
                      </div>
                      <div className="space-y-1">
                        {Object.entries(event.affectedResources).map(([resource, multiplier]) => (
                          <div key={resource} className="text-orange-400 text-xs">
                            {resource}: -{((1 - multiplier) * 100).toFixed(0)}% gathering
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {populationStats && (
                <div className="mt-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-3 text-sm">Population Health</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[
                      { name: 'Critical', value: populationStats.criticalAgents, fill: '#ef4444' },
                      { name: 'Warning', value: populationStats.warningAgents, fill: '#f59e0b' },
                      { name: 'Healthy', value: populationStats.healthyAgents, fill: '#10b981' }
                    ]}>
                      <XAxis dataKey="name" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}