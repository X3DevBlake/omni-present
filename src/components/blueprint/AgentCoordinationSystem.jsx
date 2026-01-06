import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Target, Share2, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export class MultiAgentCoordinator {
  constructor(agents) {
    this.agents = agents;
    this.sharedObjectives = [];
    this.taskQueue = [];
    this.resourcePool = new Map();
    this.negotiations = [];
    this.delegations = [];
    this.strategies = new Map();
  }

  setSharedObjective(objective) {
    this.sharedObjectives.push({
      id: `obj_${Date.now()}`,
      ...objective,
      status: 'active',
      assignedAgents: [],
      progress: 0,
      createdAt: Date.now()
    });
  }

  decomposeObjective(objective) {
    // AI-driven task decomposition
    const tasks = [];
    
    if (objective.type === 'build_structure') {
      tasks.push(
        { type: 'gather_resources', priority: 1, requiredAgents: 2 },
        { type: 'clear_area', priority: 2, requiredAgents: 1 },
        { type: 'construct', priority: 3, requiredAgents: 3 }
      );
    } else if (objective.type === 'resource_collection') {
      tasks.push(
        { type: 'scout', priority: 1, requiredAgents: 1 },
        { type: 'collect', priority: 2, requiredAgents: Math.ceil(objective.amount / 10) },
        { type: 'transport', priority: 3, requiredAgents: 1 }
      );
    }

    tasks.forEach(task => {
      this.taskQueue.push({
        ...task,
        objectiveId: objective.id,
        status: 'pending',
        assignedTo: []
      });
    });

    return tasks;
  }

  delegateTask(task) {
    // AI-driven delegation based on agent capabilities and availability
    const suitableAgents = this.agents
      .filter(agent => !agent.currentTask && this.agentCanPerformTask(agent, task))
      .sort((a, b) => this.calculateAgentSuitability(b, task) - this.calculateAgentSuitability(a, task));

    const selectedAgents = suitableAgents.slice(0, task.requiredAgents);
    
    if (selectedAgents.length < task.requiredAgents) {
      this.negotiateTaskSharing(task);
      return false;
    }

    selectedAgents.forEach(agent => {
      agent.currentTask = task;
      task.assignedTo.push(agent.id);
    });

    task.status = 'assigned';
    
    this.delegations.push({
      taskId: task.id,
      agents: selectedAgents.map(a => a.id),
      delegatedAt: Date.now()
    });

    return true;
  }

  agentCanPerformTask(agent, task) {
    const requiredSkills = {
      'gather_resources': ['exploration', 'collection'],
      'clear_area': ['construction', 'manipulation'],
      'construct': ['construction', 'coordination'],
      'scout': ['exploration', 'navigation'],
      'collect': ['collection', 'manipulation'],
      'transport': ['navigation', 'strength']
    };

    const needed = requiredSkills[task.type] || [];
    return needed.some(skill => agent.skills?.includes(skill));
  }

  calculateAgentSuitability(agent, task) {
    let score = 0;
    
    // Skills match
    const requiredSkills = {
      'gather_resources': ['exploration', 'collection'],
      'clear_area': ['construction'],
      'construct': ['construction'],
      'scout': ['exploration'],
      'collect': ['collection'],
      'transport': ['navigation']
    };
    
    const needed = requiredSkills[task.type] || [];
    score += needed.filter(skill => agent.skills?.includes(skill)).length * 10;
    
    // Distance to task location (if specified)
    if (task.location && agent.position) {
      const distance = Math.hypot(
        agent.position[0] - task.location[0],
        agent.position[2] - task.location[2]
      );
      score -= distance;
    }
    
    // Energy/availability
    score += agent.energy || 50;
    
    return score;
  }

  negotiateTaskSharing(task) {
    // Find agents currently on low-priority tasks
    const busyAgents = this.agents.filter(a => a.currentTask && a.currentTask.priority < task.priority);
    
    if (busyAgents.length > 0) {
      const negotiation = {
        id: `neg_${Date.now()}`,
        task,
        participants: busyAgents.map(a => a.id),
        status: 'negotiating',
        startedAt: Date.now()
      };
      
      this.negotiations.push(negotiation);
      
      // AI resolves negotiation
      setTimeout(() => {
        this.resolveNegotiation(negotiation);
      }, 1000);
    }
  }

  resolveNegotiation(negotiation) {
    // AI-driven negotiation resolution
    const highPriorityTask = negotiation.task;
    
    // Reassign agents from lower priority tasks
    negotiation.participants.forEach(agentId => {
      const agent = this.agents.find(a => a.id === agentId);
      if (agent && agent.currentTask) {
        // Return old task to queue
        agent.currentTask.status = 'pending';
        agent.currentTask.assignedTo = agent.currentTask.assignedTo.filter(id => id !== agentId);
        
        // Assign to new task
        agent.currentTask = highPriorityTask;
        highPriorityTask.assignedTo.push(agentId);
      }
    });

    negotiation.status = 'resolved';
    highPriorityTask.status = 'assigned';
  }

  shareResources(fromAgent, toAgent, resource, amount) {
    const fromPool = this.resourcePool.get(fromAgent.id) || {};
    const toPool = this.resourcePool.get(toAgent.id) || {};
    
    if ((fromPool[resource] || 0) >= amount) {
      fromPool[resource] = (fromPool[resource] || 0) - amount;
      toPool[resource] = (toPool[resource] || 0) + amount;
      
      this.resourcePool.set(fromAgent.id, fromPool);
      this.resourcePool.set(toAgent.id, toPool);
      
      return true;
    }
    
    return false;
  }

  updateStrategies() {
    // AI analyzes current situation and updates strategies
    const objectives = this.sharedObjectives.filter(obj => obj.status === 'active');
    
    objectives.forEach(objective => {
      const assignedTasks = this.taskQueue.filter(t => t.objectiveId === objective.id);
      const completedTasks = assignedTasks.filter(t => t.status === 'completed').length;
      const progress = assignedTasks.length > 0 ? completedTasks / assignedTasks.length : 0;
      
      objective.progress = progress;
      
      // Adjust strategy based on progress
      if (progress < 0.3 && Date.now() - objective.createdAt > 30000) {
        this.strategies.set(objective.id, {
          recommendation: 'increase_agents',
          reason: 'Slow progress detected',
          timestamp: Date.now()
        });
      }
    });
  }

  getCoordinationStats() {
    return {
      activeObjectives: this.sharedObjectives.filter(o => o.status === 'active').length,
      pendingTasks: this.taskQueue.filter(t => t.status === 'pending').length,
      activeTasks: this.taskQueue.filter(t => t.status === 'assigned').length,
      activeNegotiations: this.negotiations.filter(n => n.status === 'negotiating').length,
      delegations: this.delegations.length,
      strategies: this.strategies.size
    };
  }
}

export default function AgentCoordinationDashboard({ show, onClose, agents }) {
  const [coordinator] = useState(() => new MultiAgentCoordinator(agents));
  const [stats, setStats] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState({ type: '', description: '' });

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        coordinator.updateStrategies();
        setStats(coordinator.getCoordinationStats());
        setObjectives([...coordinator.sharedObjectives]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show, coordinator]);

  const createObjective = () => {
    if (!newObjective.description) {
      toast.error('Enter objective description');
      return;
    }

    const objective = {
      ...newObjective,
      id: `obj_${Date.now()}`,
      status: 'active',
      priority: 1
    };

    coordinator.setSharedObjective(objective);
    coordinator.decomposeObjective(objective);
    
    // Auto-delegate tasks
    coordinator.taskQueue.forEach(task => {
      if (task.status === 'pending') {
        coordinator.delegateTask(task);
      }
    });

    setNewObjective({ type: '', description: '' });
    toast.success('Objective created and delegated!');
  };

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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Multi-Agent Coordination</h3>
              <p className="text-white/60">AI-driven task delegation & resource sharing</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-6 gap-3 mb-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <Target className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-xs text-blue-400">Objectives</div>
                <div className="text-2xl font-bold text-white">{stats.activeObjectives}</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                <div className="text-xs text-yellow-400">Pending</div>
                <div className="text-2xl font-bold text-white">{stats.pendingTasks}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <Zap className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-xs text-green-400">Active</div>
                <div className="text-2xl font-bold text-white">{stats.activeTasks}</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <MessageSquare className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-xs text-purple-400">Negotiations</div>
                <div className="text-2xl font-bold text-white">{stats.activeNegotiations}</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                <Share2 className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-xs text-cyan-400">Delegations</div>
                <div className="text-2xl font-bold text-white">{stats.delegations}</div>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3">
                <TrendingUp className="w-5 h-5 text-pink-400 mb-2" />
                <div className="text-xs text-pink-400">Strategies</div>
                <div className="text-2xl font-bold text-white">{stats.strategies}</div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Create Shared Objective</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={newObjective.type} onChange={(e) => setNewObjective({...newObjective, type: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">Select Type</option>
                <option value="build_structure">Build Structure</option>
                <option value="resource_collection">Resource Collection</option>
                <option value="exploration">Exploration</option>
                <option value="defense">Defense</option>
              </select>
              <input type="text" value={newObjective.description} onChange={(e) => setNewObjective({...newObjective, description: e.target.value})} placeholder="Objective description..." className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40" />
            </div>
            <button onClick={createObjective} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:opacity-90">
              Create & Delegate
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold">Active Objectives</h4>
            {objectives.filter(o => o.status === 'active').map(obj => (
              <div key={obj.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{obj.description}</div>
                    <div className="text-white/60 text-xs capitalize">{obj.type}</div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-full text-xs">
                    {Math.round(obj.progress * 100)}%
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${obj.progress * 100}%` }} />
                </div>
                {obj.assignedAgents.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {obj.assignedAgents.map(agentId => (
                      <div key={agentId} className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 text-xs">
                        Agent {agentId}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}