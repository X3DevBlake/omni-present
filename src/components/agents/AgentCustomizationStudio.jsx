import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, RefreshCw } from 'lucide-react';

export default function AgentCustomizationStudio() {
  const [agentConfig, setAgentConfig] = useState({
    name: 'Custom-Agent-01',
    personality: {
      curiosity: 70,
      friendliness: 75,
      confidence: 65,
      caution: 55,
      creativity: 80
    },
    learningStyle: 'experiential',
    goalType: 'exploration',
    customGoal: 'Discover new trading patterns'
  });

  const [behaviorTree, setBehaviorTree] = useState([
    { id: 1, name: 'Observe Environment', type: 'action' },
    { id: 2, name: 'Analyze Data', type: 'action' },
    { id: 3, name: 'Make Decision', type: 'decision' },
    { id: 4, name: 'Execute Action', type: 'action' }
  ]);

  const [suggestions, setSuggestions] = useState([]);

  const goalTypes = ['exploration', 'trading', 'research', 'collaboration', 'optimization'];
  const learningStyles = ['experiential', 'analytical', 'intuitive', 'collaborative'];

  const generateSuggestions = () => {
    const suggestionMap = {
      exploration: { curiosity: 90, caution: 40, creativity: 85 },
      trading: { confidence: 85, creativity: 60, caution: 70 },
      research: { curiosity: 85, caution: 75, creativity: 70 },
      collaboration: { friendliness: 85, caution: 60, creativity: 75 },
      optimization: { confidence: 80, curiosity: 65, caution: 80 }
    };

    const suggestions = suggestionMap[agentConfig.goalType] || {};
    setSuggestions(Object.entries(suggestions).map(([trait, value]) => ({ trait, value })));
  };

  const applyOptimalParameters = () => {
    const suggestionMap = {
      exploration: { curiosity: 90, caution: 40, creativity: 85 },
      trading: { confidence: 85, creativity: 60, caution: 70 },
      research: { curiosity: 85, caution: 75, creativity: 70 },
      collaboration: { friendliness: 85, caution: 60, creativity: 75 },
      optimization: { confidence: 80, curiosity: 65, caution: 80 }
    };

    const optimal = suggestionMap[agentConfig.goalType] || {};
    setAgentConfig(prev => ({
      ...prev,
      personality: { ...prev.personality, ...optimal }
    }));
  };

  const handleSaveAgent = () => {
    console.log('Agent saved:', { config: agentConfig, behaviorTree });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Agent Name */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Agent Customization Studio</h3>
        </div>

        <div className="mb-6">
          <label className="text-white/70 text-sm mb-2 block">Agent Name</label>
          <input
            type="text"
            value={agentConfig.name}
            onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          />
        </div>

        {/* Personality Traits */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Personality Traits</h4>
          {Object.entries(agentConfig.personality).map(([trait, value]) => (
            <div key={trait}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm capitalize">{trait}</label>
                <span className="text-cyan-400 font-bold">{value}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) =>
                  setAgentConfig({
                    ...agentConfig,
                    personality: {
                      ...agentConfig.personality,
                      [trait]: parseInt(e.target.value)
                    }
                  })
                }
                className="w-full h-2 bg-white/10 rounded-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Goals & Learning */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4">Learning & Goals</h4>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Learning Style</label>
              <select
                value={agentConfig.learningStyle}
                onChange={(e) => setAgentConfig({ ...agentConfig, learningStyle: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {learningStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Goal Type</label>
              <select
                value={agentConfig.goalType}
                onChange={(e) => {
                  setAgentConfig({ ...agentConfig, goalType: e.target.value });
                  generateSuggestions();
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {goalTypes.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Custom Goal (Natural Language)</label>
              <textarea
                value={agentConfig.customGoal}
                onChange={(e) => setAgentConfig({ ...agentConfig, customGoal: e.target.value })}
                placeholder="Describe what you want this agent to achieve..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">AI-Suggested Parameters</h4>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={applyOptimalParameters}
              className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Apply
            </motion.button>
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((sugg) => (
                <div key={sugg.trait} className="bg-white/5 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm capitalize">{sugg.trait}</span>
                    <span className="text-green-400 font-bold">{sugg.value}</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                      style={{ width: `${sugg.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm text-center py-8">Select a goal type to see suggestions</p>
          )}
        </div>
      </div>

      {/* Behavior Tree */}
      <div className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6">
        <h4 className="text-white font-bold mb-4">Behavior Tree</h4>
        <div className="space-y-2">
          {behaviorTree.map((node, i) => (
            <motion.div
              key={node.id}
              layout
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className={`w-3 h-3 rounded-full ${node.type === 'action' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
              <span className="text-white font-semibold flex-1">{node.name}</span>
              <span className="text-white/50 text-xs">{node.type}</span>
              {i < behaviorTree.length - 1 && <span className="text-white/30">↓</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={handleSaveAgent}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Custom Agent
      </motion.button>
    </motion.div>
  );
}