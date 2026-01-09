import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Trash2, Copy } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentBehaviorDefinition({ selectedAgent, onSelectAgent }) {
  const [agents, setAgents] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [editingBehavior, setEditingBehavior] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'manual',
    action: '',
    parameters: {},
    enabled: true
  });

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      loadBehaviors(selectedAgent.id);
    }
  }, [selectedAgent]);

  const loadAgents = async () => {
    try {
      const agentList = await base44.entities.Agent.list();
      setAgents(agentList.slice(0, 10));
      if (agentList.length > 0 && !selectedAgent) {
        onSelectAgent(agentList[0]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadBehaviors = async (agentId) => {
    try {
      const behaviors = await base44.entities.AgentBehavior?.list() || [];
      setBehaviors(behaviors.filter(b => b.agent_id === agentId));
    } catch {
      // AgentBehavior entity might not exist, use mock data
      setBehaviors([
        { id: '1', name: 'Trade on Signal', trigger: 'event', action: 'execute_trade', enabled: true },
        { id: '2', name: 'Risk Check', trigger: 'condition', action: 'validate_risk', enabled: true }
      ]);
    }
  };

  const handleSaveBehavior = async () => {
    if (!formData.name.trim() || !formData.action.trim()) return;

    const behaviorData = {
      ...formData,
      agent_id: selectedAgent.id
    };

    if (editingBehavior) {
      // Update existing
      setBehaviors(behaviors.map(b => b.id === editingBehavior.id ? { ...behaviorData, id: b.id } : b));
    } else {
      // Create new
      setBehaviors([...behaviors, { ...behaviorData, id: Date.now().toString() }]);
    }

    setFormData({ name: '', trigger: 'manual', action: '', parameters: {}, enabled: true });
    setEditingBehavior(null);
  };

  const deleteBehavior = (id) => {
    setBehaviors(behaviors.filter(b => b.id !== id));
  };

  const duplicateBehavior = (behavior) => {
    const newBehavior = { ...behavior, id: Date.now().toString(), name: `${behavior.name} (Copy)` };
    setBehaviors([...behaviors, newBehavior]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Agent Selector */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 h-fit">
        <h3 className="text-white font-bold mb-4">Select Agent</h3>
        <div className="space-y-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold text-sm">{agent.name}</div>
              <div className="text-xs text-white/40">{agent.status || 'idle'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Behavior Editor & List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Editor */}
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">
            {editingBehavior ? 'Edit Behavior' : 'Create Behavior'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Behavior Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Execute Trade Signal"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Trigger Type</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="manual">Manual</option>
                  <option value="event">Event-Based</option>
                  <option value="condition">Condition-Based</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Action</label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Action</option>
                  <option value="execute_trade">Execute Trade</option>
                  <option value="validate_risk">Validate Risk</option>
                  <option value="analyze_data">Analyze Data</option>
                  <option value="request_data">Request Data</option>
                  <option value="send_alert">Send Alert</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white/70 text-sm">Enabled</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleSaveBehavior}
                className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Behavior
              </button>
              {editingBehavior && (
                <button
                  onClick={() => {
                    setEditingBehavior(null);
                    setFormData({ name: '', trigger: 'manual', action: '', parameters: {}, enabled: true });
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Behaviors List */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Agent Behaviors ({behaviors.length})</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {behaviors.map((behavior, idx) => (
                <motion.div
                  key={behavior.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{behavior.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                          {behavior.trigger}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          {behavior.action}
                        </span>
                        {behavior.enabled && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateBehavior(behavior)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBehavior(behavior);
                          setFormData(behavior);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => deleteBehavior(behavior.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {behaviors.length === 0 && (
              <div className="text-center py-8 text-white/40 text-sm">
                No behaviors defined. Create one to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}