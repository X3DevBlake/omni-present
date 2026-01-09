import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ZapOff, Lightbulb, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PREDEFINED_ACTIONS = [
  { id: 'move_forward', label: 'Move Forward', icon: '➡️', category: 'movement' },
  { id: 'move_backward', label: 'Move Backward', icon: '⬅️', category: 'movement' },
  { id: 'turn_left', label: 'Turn Left', icon: '↪️', category: 'movement' },
  { id: 'turn_right', label: 'Turn Right', icon: '↩️', category: 'movement' },
  { id: 'jump', label: 'Jump', icon: '⬆️', category: 'movement' },
  { id: 'interact', label: 'Interact', icon: '🤝', category: 'interaction' },
  { id: 'scan', label: 'Scan Area', icon: '🔍', category: 'action' },
  { id: 'analyze', label: 'Analyze', icon: '📊', category: 'action' },
  { id: 'communicate', label: 'Communicate', icon: '💬', category: 'action' },
  { id: 'rest', label: 'Rest', icon: '😴', category: 'state' },
  { id: 'alert', label: 'Alert Mode', icon: '⚠️', category: 'state' },
  { id: 'explore', label: 'Explore', icon: '🗺️', category: 'action' },
];

export default function AgentActionController({ agentId, agentName = 'Agent' }) {
  const [selectedActions, setSelectedActions] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [executing, setExecuting] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [useAIGeneration, setUseAIGeneration] = useState(false);

  const toggleAction = (actionId) => {
    setSelectedActions(prev =>
      prev.includes(actionId)
        ? prev.filter(a => a !== actionId)
        : [...prev, actionId]
    );
  };

  const executeActions = async () => {
    if (selectedActions.length === 0) {
      toast.error('Select at least one action');
      return;
    }

    setExecuting(true);
    try {
      const actionNames = selectedActions.map(
        id => PREDEFINED_ACTIONS.find(a => a.id === id)?.label || id
      ).join(', ');

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      const historyEntry = {
        actions: actionNames,
        timestamp: new Date().toLocaleTimeString(),
        result: '✓ Completed'
      };

      setActionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      setSelectedActions([]);
      toast.success('Actions executed!');
    } catch (err) {
      toast.error('Action execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const generateAIActions = async () => {
    if (!customPrompt.trim()) {
      toast.error('Enter a command prompt');
      return;
    }

    setExecuting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI that converts natural language commands into agent actions for a simulation.
        
Agent: ${agentName}
Command: "${customPrompt}"

Available actions: ${PREDEFINED_ACTIONS.map(a => a.label).join(', ')}

Generate a sequence of actions (2-5) that accomplish the command. Format as JSON:
{"actions": ["action1", "action2"], "reasoning": "why these actions"}`,
        response_json_schema: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              items: { type: 'string' }
            },
            reasoning: { type: 'string' }
          }
        }
      });

      // Map generated actions to available actions
      const mappedActions = response.actions
        .map(action => {
          const found = PREDEFINED_ACTIONS.find(a =>
            a.label.toLowerCase().includes(action.toLowerCase())
          );
          return found?.id;
        })
        .filter(Boolean);

      setSelectedActions(mappedActions);
      toast.success(`Generated ${mappedActions.length} actions!`);
    } catch (err) {
      toast.error('Failed to generate actions');
    } finally {
      setExecuting(false);
    }
  };

  const categories = [...new Set(PREDEFINED_ACTIONS.map(a => a.category))];

  return (
    <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold mb-4">🎮 Agent Action Controller</h3>

      {/* AI Generation Tab */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Describe what agent should do..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <motion.button
            onClick={generateAIActions}
            disabled={!customPrompt.trim() || executing}
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Generate
          </motion.button>
        </div>
      </div>

      {/* Predefined Actions Grid */}
      <div className="space-y-3">
        {categories.map(category => (
          <div key={category}>
            <p className="text-white/60 text-xs font-bold uppercase mb-2">{category}</p>
            <div className="grid grid-cols-3 gap-2">
              {PREDEFINED_ACTIONS.filter(a => a.category === category).map(action => (
                <motion.button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-all text-center ${
                    selectedActions.includes(action.id)
                      ? 'bg-green-500/30 border-2 border-green-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg block">{action.icon}</span>
                  <span className="text-xs text-white">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Actions */}
      {selectedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
        >
          <p className="text-green-400 text-xs font-bold mb-2">
            {selectedActions.length} action(s) selected:
          </p>
          <div className="flex gap-1 flex-wrap">
            {selectedActions.map(id => {
              const action = PREDEFINED_ACTIONS.find(a => a.id === id);
              return (
                <span key={id} className="text-xs bg-green-500/30 px-2 py-1 rounded border border-green-500/50 text-green-300">
                  {action?.label}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Execute Button */}
      <motion.button
        onClick={executeActions}
        disabled={selectedActions.length === 0 || executing}
        whileHover={{ scale: 1.05 }}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {executing ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              <Play className="w-5 h-5" />
            </motion.div>
            Executing...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Execute Actions
          </>
        )}
      </motion.button>

      {/* Action History */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-white/60 text-xs font-bold mb-2">Action History:</p>
        <div className="space-y-1 max-h-20 overflow-y-auto">
          {actionHistory.length === 0 ? (
            <p className="text-white/40 text-xs">No actions executed yet</p>
          ) : (
            actionHistory.map((entry, i) => (
              <div key={i} className="text-xs text-white/60 flex justify-between">
                <span>{entry.actions}</span>
                <span className="text-white/40">{entry.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}