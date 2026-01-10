import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ScenarioEditor({ onSave }) {
  const [scenarios, setScenarios] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agentCount: 5,
    duration: 3600,
    complexity: 'medium'
  });

  const createScenario = () => {
    const newScenario = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...formData
    };
    setScenarios([...scenarios, newScenario]);
    setFormData({ name: '', description: '', agentCount: 5, duration: 3600, complexity: 'medium' });
  };

  const duplicateScenario = (scenario) => {
    const copy = { ...scenario, id: Date.now(), name: `${scenario.name} (Copy)` };
    setScenarios([...scenarios, copy]);
  };

  const deleteScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const saveScenario = (scenario) => {
    onSave?.(scenario);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Create Scenario</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Scenario Name</label>
            <Input
              placeholder="e.g., Market Crash Simulation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Description</label>
            <Textarea
              placeholder="Describe the scenario..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white h-24"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Agents</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.agentCount}
                onChange={(e) => setFormData({ ...formData, agentCount: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Duration (s)</label>
              <Input
                type="number"
                min="60"
                step="60"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Complexity</label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <Button
            onClick={createScenario}
            disabled={!formData.name}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Scenario
          </Button>
        </div>
      </motion.div>

      {/* Scenarios List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Your Scenarios ({scenarios.length})</h3>
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-white/40">No scenarios created yet</div>
        ) : (
          scenarios.map((scenario, idx) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-bold">{scenario.name}</h4>
                  <p className="text-white/60 text-sm">{scenario.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateScenario(scenario)}
                    className="p-2 hover:bg-white/10 rounded text-cyan-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => saveScenario(scenario)}
                    className="p-2 hover:bg-white/10 rounded text-green-400"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteScenario(scenario.id)}
                    className="p-2 hover:bg-white/10 rounded text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-white/50">
                <span>🤖 {scenario.agentCount} agents</span>
                <span>⏱️ {Math.round(scenario.duration / 60)}m</span>
                <span>⚙️ {scenario.complexity}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}