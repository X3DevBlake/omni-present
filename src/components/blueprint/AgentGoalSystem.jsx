import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, CheckCircle, AlertCircle, Plus, ChevronDown, ChevronRight, Award } from 'lucide-react';
import { toast } from 'sonner';

export class GoalNode {
  constructor(id, name, description, type, parent = null) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type; // 'survival', 'resource', 'social', 'exploration', 'achievement'
    this.progress = 0;
    this.status = 'active'; // active, completed, failed, paused
    this.parent = parent;
    this.children = [];
    this.requirements = [];
    this.rewards = [];
    this.deadline = null;
    this.priority = 1;
    this.adaptations = [];
    this.environmentalFactors = new Map();
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  updateProgress(delta, environment) {
    // Adapt based on environmental feedback
    const environmentalModifier = this.calculateEnvironmentalModifier(environment);
    this.progress = Math.min(100, this.progress + delta * environmentalModifier);
    
    if (this.progress >= 100) {
      this.status = 'completed';
      this.applyRewards();
    }

    // Check for adaptations
    this.checkAdaptations(environment);
  }

  calculateEnvironmentalModifier(environment) {
    let modifier = 1.0;
    
    if (environment?.resources?.food < 30 && this.type === 'resource') {
      modifier *= 1.5; // Increased urgency for resource goals
    }
    
    if (environment?.threats > 0 && this.type === 'survival') {
      modifier *= 2.0; // Survival goals become critical
    }
    
    return modifier;
  }

  checkAdaptations(environment) {
    // Goals adapt based on changing conditions
    if (this.type === 'exploration' && environment?.danger > 70) {
      this.adaptations.push({
        type: 'priorityShift',
        from: this.priority,
        to: Math.max(1, this.priority - 2),
        reason: 'High environmental danger detected'
      });
      this.priority = Math.max(1, this.priority - 2);
    }
  }

  applyRewards() {
    this.rewards.forEach(reward => {
      // Rewards could be skills, resources, reputation, etc.
    });
  }

  getHierarchyDepth() {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
}

export class AgentGoalManager {
  constructor(agentId) {
    this.agentId = agentId;
    this.goals = new Map();
    this.activeGoals = [];
    this.completedGoals = [];
    this.failedGoals = [];
    this.goalHistory = [];
  }

  addGoal(goal) {
    this.goals.set(goal.id, goal);
    this.activeGoals.push(goal);
    this.goalHistory.push({
      action: 'added',
      goal: goal.name,
      timestamp: Date.now()
    });
  }

  updateGoals(environment, deltaTime) {
    this.activeGoals.forEach(goal => {
      if (goal.status === 'active') {
        // Auto-progress based on agent actions and environment
        const progressDelta = this.calculateProgressDelta(goal, environment);
        goal.updateProgress(progressDelta * deltaTime, environment);

        // Check children completion
        if (goal.children.length > 0) {
          const childrenComplete = goal.children.every(c => c.status === 'completed');
          if (childrenComplete && goal.status === 'active') {
            goal.updateProgress(100 - goal.progress, environment);
          }
        }

        // Move completed goals
        if (goal.status === 'completed') {
          this.activeGoals = this.activeGoals.filter(g => g.id !== goal.id);
          this.completedGoals.push(goal);
        }
      }
    });
  }

  calculateProgressDelta(goal, environment) {
    // Base progress rate
    let delta = 0.5;

    // Adjust based on goal priority
    delta *= goal.priority;

    // Environmental factors
    if (goal.type === 'resource' && environment?.resources) {
      delta *= environment.resources.tools > 5 ? 1.5 : 0.8;
    }

    return delta;
  }

  getGoalTree() {
    const roots = Array.from(this.goals.values()).filter(g => !g.parent);
    return roots;
  }

  getStatistics() {
    return {
      total: this.goals.size,
      active: this.activeGoals.length,
      completed: this.completedGoals.length,
      failed: this.failedGoals.length,
      completionRate: this.goals.size > 0 ? (this.completedGoals.length / this.goals.size) * 100 : 0
    };
  }
}

export default function AgentGoalSystem({ show, onClose, agents, onGoalAssign, environment }) {
  const [goalManagers] = useState(new Map());
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    type: 'achievement',
    priority: 3,
    parentId: null
  });
  const [expandedGoals, setExpandedGoals] = useState(new Set());
  const [populationStats, setPopulationStats] = useState(null);

  useEffect(() => {
    // Initialize goal managers for each agent
    agents.forEach(agent => {
      if (!goalManagers.has(agent.id)) {
        goalManagers.set(agent.id, new AgentGoalManager(agent.id));
        
        // Add default survival goal
        const survivalGoal = new GoalNode(
          `${agent.id}_survival`,
          'Survive and Thrive',
          'Maintain health and resources',
          'survival'
        );
        goalManagers.get(agent.id).addGoal(survivalGoal);
      }
    });

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    // Update goals periodically
    const interval = setInterval(() => {
      goalManagers.forEach(manager => {
        manager.updateGoals(environment, 0.1);
      });
      updatePopulationStats();
    }, 1000);

    return () => clearInterval(interval);
  }, [goalManagers, environment]);

  const updatePopulationStats = () => {
    const stats = {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      avgProgress: 0,
      goalTypes: {}
    };

    goalManagers.forEach(manager => {
      const managerStats = manager.getStatistics();
      stats.totalGoals += managerStats.total;
      stats.activeGoals += managerStats.active;
      stats.completedGoals += managerStats.completed;
    });

    if (stats.totalGoals > 0) {
      const allGoals = Array.from(goalManagers.values()).flatMap(m => Array.from(m.goals.values()));
      stats.avgProgress = allGoals.reduce((sum, g) => sum + g.progress, 0) / allGoals.length;
      
      allGoals.forEach(g => {
        stats.goalTypes[g.type] = (stats.goalTypes[g.type] || 0) + 1;
      });
    }

    setPopulationStats(stats);
  };

  const createGoal = () => {
    if (!selectedAgent || !newGoal.name) return;

    const manager = goalManagers.get(selectedAgent.id);
    const goal = new GoalNode(
      `${selectedAgent.id}_${Date.now()}`,
      newGoal.name,
      newGoal.description,
      newGoal.type
    );
    goal.priority = newGoal.priority;

    if (newGoal.parentId) {
      const parent = manager.goals.get(newGoal.parentId);
      if (parent) {
        parent.addChild(goal);
      }
    }

    manager.addGoal(goal);
    onGoalAssign?.(selectedAgent, goal);
    
    setNewGoal({ name: '', description: '', type: 'achievement', priority: 3, parentId: null });
    setShowCreateGoal(false);
    toast.success(`Goal "${goal.name}" assigned to ${selectedAgent.name}`);
  };

  const toggleGoalExpanded = (goalId) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const renderGoalNode = (goal, manager, depth = 0) => {
    const isExpanded = expandedGoals.has(goal.id);
    const hasChildren = goal.children.length > 0;

    return (
      <div key={goal.id} style={{ marginLeft: depth * 20 }}>
        <div className={`bg-white/5 rounded-lg p-3 mb-2 border ${
          goal.status === 'completed' ? 'border-green-500/40' :
          goal.status === 'failed' ? 'border-red-500/40' :
          'border-white/10'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              {hasChildren && (
                <button onClick={() => toggleGoalExpanded(goal.id)} className="mt-1">
                  {isExpanded ? 
                    <ChevronDown className="w-4 h-4 text-white/60" /> : 
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  }
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm">{goal.name}</h4>
                  {goal.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {goal.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  <div className={`px-2 py-0.5 rounded text-xs ${
                    goal.type === 'survival' ? 'bg-red-500/20 text-red-300' :
                    goal.type === 'resource' ? 'bg-green-500/20 text-green-300' :
                    goal.type === 'social' ? 'bg-blue-500/20 text-blue-300' :
                    goal.type === 'exploration' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {goal.type}
                  </div>
                  <div className="px-2 py-0.5 rounded bg-white/10 text-white text-xs">
                    P{goal.priority}
                  </div>
                </div>
                <p className="text-white/60 text-xs mb-2">{goal.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        goal.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-xs">{goal.progress.toFixed(0)}%</span>
                </div>
                {goal.adaptations.length > 0 && (
                  <div className="mt-2 text-xs text-orange-400">
                    ⚡ Adapted: {goal.adaptations[goal.adaptations.length - 1].reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {goal.children.map(child => renderGoalNode(child, manager, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Agent Goal System</h3>
                <p className="text-white/60 text-sm">Complex hierarchical goals with adaptive progress tracking</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Agent List */}
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 text-sm">Select Agent</h4>
              <div className="space-y-2">
                {agents.map(agent => {
                  const manager = goalManagers.get(agent.id);
                  const stats = manager?.getStatistics();
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAgent?.id === agent.id
                          ? 'bg-cyan-500/20 border border-cyan-500/40'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-white text-sm font-medium">{agent.name}</span>
                      </div>
                      {stats && (
                        <div className="text-xs text-white/60">
                          {stats.active} active • {stats.completed} done
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {populationStats && (
                <div className="mt-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-400 font-semibold mb-3 text-sm">Population Stats</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Goals</span>
                      <span className="text-white font-semibold">{populationStats.totalGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Active</span>
                      <span className="text-cyan-400 font-semibold">{populationStats.activeGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Completed</span>
                      <span className="text-green-400 font-semibold">{populationStats.completedGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Progress</span>
                      <span className="text-yellow-400 font-semibold">{populationStats.avgProgress.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Goal Details */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedAgent ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-lg">
                      {selectedAgent.name}'s Goals
                    </h3>
                    <button
                      onClick={() => setShowCreateGoal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-xl hover:bg-yellow-500/30"
                    >
                      <Plus className="w-4 h-4" />
                      New Goal
                    </button>
                  </div>

                  {showCreateGoal && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                      <h4 className="text-white font-semibold mb-3">Create New Goal</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Goal name"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm"
                        />
                        <textarea
                          placeholder="Description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm h-20"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={newGoal.type}
                            onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="survival">Survival</option>
                            <option value="resource">Resource</option>
                            <option value="social">Social</option>
                            <option value="exploration">Exploration</option>
                            <option value="achievement">Achievement</option>
                          </select>
                          <select
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal({ ...newGoal, priority: parseInt(e.target.value) })}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="1">Priority 1 (Low)</option>
                            <option value="2">Priority 2</option>
                            <option value="3">Priority 3 (Medium)</option>
                            <option value="4">Priority 4</option>
                            <option value="5">Priority 5 (High)</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={createGoal}
                            className="flex-1 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-lg hover:bg-yellow-500/30"
                          >
                            Create
                          </button>
                          <button
                            onClick={() => setShowCreateGoal(false)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    {goalManagers.get(selectedAgent.id)?.getGoalTree().map(goal => 
                      renderGoalNode(goal, goalManagers.get(selectedAgent.id))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Select an agent to view and manage goals</p>
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