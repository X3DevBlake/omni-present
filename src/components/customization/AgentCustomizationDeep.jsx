import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Save, Share2, Play, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentCustomizationDeep() {
  const [agentConfig, setAgentConfig] = useState({
    name: 'Custom-Agent-01',
    personality: {
      curiosity: 75,
      caution: 45,
      creativity: 80,
      assertiveness: 60,
      empathy: 70
    },
    memoryBias: {
      recency: 60,
      importance: 80,
      emotional: 40,
      frequency: 50
    },
    learningParams: {
      learningRate: 0.05,
      explorationRate: 0.3,
      adaptationSpeed: 0.7,
      retentionRate: 0.85
    }
  });

  const [sandboxMode, setSandboxMode] = useState(false);
  const [testScenario, setTestScenario] = useState('');
  const [behaviorResults, setBehaviorResults] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState([
    { id: 1, name: 'Conservative Analyst', shared: false },
    { id: 2, name: 'Creative Explorer', shared: true }
  ]);

  const updatePersonality = (trait, value) => {
    setAgentConfig({
      ...agentConfig,
      personality: { ...agentConfig.personality, [trait]: value }
    });
  };

  const updateMemoryBias = (bias, value) => {
    setAgentConfig({
      ...agentConfig,
      memoryBias: { ...agentConfig.memoryBias, [bias]: value }
    });
  };

  const updateLearningParam = (param, value) => {
    setAgentConfig({
      ...agentConfig,
      learningParams: { ...agentConfig.learningParams, [param]: value }
    });
  };

  const runSandboxTest = async () => {
    if (!testScenario.trim()) return;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Simulate agent behavior with personality: ${JSON.stringify(agentConfig.personality)}, memory bias: ${JSON.stringify(agentConfig.memoryBias)}, learning params: ${JSON.stringify(agentConfig.learningParams)} in scenario: "${testScenario}". Describe decisions, reasoning, and outcomes.`,
      response_json_schema: {
        type: 'object',
        properties: {
          initial_response: { type: 'string' },
          decision_process: { type: 'array', items: { type: 'string' } },
          final_action: { type: 'string' },
          personality_influence: { type: 'string' },
          memory_usage: { type: 'string' },
          learning_outcome: { type: 'string' }
        }
      }
    });

    setBehaviorResults(response);
  };

  const saveConfiguration = () => {
    const newConfig = {
      id: Date.now(),
      name: agentConfig.name,
      config: agentConfig,
      shared: false
    };
    setSavedConfigs([...savedConfigs, newConfig]);
  };

  const exportConfiguration = () => {
    const blob = new Blob([JSON.stringify(agentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentConfig.name}-config.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Deep Agent Customization</h3>

        {/* Agent Name */}
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
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3">Personality Traits</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(agentConfig.personality).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between mb-2">
                  <label className="text-white/70 text-sm capitalize">{trait}</label>
                  <span className="text-cyan-400 font-bold text-sm">{value}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => updatePersonality(trait, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Memory Recall Biases */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3">Memory Recall Biases</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(agentConfig.memoryBias).map(([bias, value]) => (
              <div key={bias}>
                <div className="flex justify-between mb-2">
                  <label className="text-white/70 text-sm capitalize">{bias}</label>
                  <span className="text-purple-400 font-bold text-sm">{value}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => updateMemoryBias(bias, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Learning Parameters */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3">Learning Parameters</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(agentConfig.learningParams).map(([param, value]) => (
              <div key={param}>
                <div className="flex justify-between mb-2">
                  <label className="text-white/70 text-sm capitalize">{param.replace(/([A-Z])/g, ' $1')}</label>
                  <span className="text-green-400 font-bold text-sm">{value.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => updateLearningParam(param, parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={saveConfiguration}
            className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Config
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={exportConfiguration}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setSandboxMode(!sandboxMode)}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {sandboxMode ? 'Exit Sandbox' : 'Enter Sandbox'}
          </motion.button>
        </div>

        {/* Sandbox Testing */}
        {sandboxMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl mb-6"
          >
            <h4 className="text-purple-400 font-bold mb-3">Sandbox Testing Mode</h4>
            <textarea
              value={testScenario}
              onChange={(e) => setTestScenario(e.target.value)}
              placeholder="Describe a test scenario for the agent..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 h-24 mb-3"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={runSandboxTest}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Test
            </motion.button>

            {behaviorResults && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-black/20 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Initial Response:</p>
                  <p className="text-white text-sm">{behaviorResults.initial_response}</p>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                  <p className="text-white/60 text-xs mb-2">Decision Process:</p>
                  {behaviorResults.decision_process.map((step, idx) => (
                    <p key={idx} className="text-white text-sm mb-1">• {step}</p>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Personality Influence:</p>
                    <p className="text-cyan-400 text-sm">{behaviorResults.personality_influence}</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Learning Outcome:</p>
                    <p className="text-green-400 text-sm">{behaviorResults.learning_outcome}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Saved Configurations */}
        <div>
          <h4 className="text-white font-bold mb-3">Saved Configurations</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {savedConfigs.map(config => (
              <div key={config.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{config.name}</span>
                  <div className="flex gap-2">
                    {config.shared && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                        <Share2 className="w-3 h-3 inline" /> Shared
                      </span>
                    )}
                    <button className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30">
                      Load
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}