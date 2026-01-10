import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function GoalsEthicsEditor({ show, onClose, agent, onSave }) {
  const [goals, setGoals] = useState(agent?.goals || []);
  const [ethics, setEthics] = useState(agent?.ethics || {
    principles: [],
    boundaries: [],
    priorities: [],
  });

  const addGoal = () => {
    setGoals([...goals, { id: Date.now(), text: '', priority: 'medium', deadline: '' }]);
  };

  const addPrinciple = () => {
    setEthics({
      ...ethics,
      principles: [...ethics.principles, '']
    });
  };

  const save = () => {
    onSave?.({
      ...agent,
      goals,
      ethics,
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Goals & Ethics Editor</h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Goals
              </h3>
              <Button onClick={addGoal} size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {goals.map((goal, i) => (
                <div key={goal.id} className="bg-black/20 rounded-lg p-3">
                  <Input
                    value={goal.text}
                    onChange={(e) => {
                      const updated = [...goals];
                      updated[i].text = e.target.value;
                      setGoals(updated);
                    }}
                    placeholder="Goal description"
                    className="bg-white/5 border-white/10 text-white mb-2"
                  />
                  <select
                    value={goal.priority}
                    onChange={(e) => {
                      const updated = [...goals];
                      updated[i].priority = e.target.value;
                      setGoals(updated);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Ethical Guidelines
              </h3>
              <Button onClick={addPrinciple} size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {ethics.principles.map((principle, i) => (
                <Textarea
                  key={i}
                  value={principle}
                  onChange={(e) => {
                    const updated = [...ethics.principles];
                    updated[i] = e.target.value;
                    setEthics({...ethics, principles: updated});
                  }}
                  placeholder="Ethical principle or guideline"
                  className="bg-white/5 border-white/10 text-white"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Behavioral Boundaries</h4>
          <Textarea
            placeholder="Define what the agent should never do..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
            Cancel
          </Button>
          <Button onClick={save} className="bg-gradient-to-r from-green-500 to-emerald-500">
            Save Configuration
          </Button>
        </div>
      </motion.div>
    </div>
  );
}