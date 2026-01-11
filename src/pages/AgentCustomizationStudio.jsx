import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sliders, Brain, Zap, MessageSquare, Settings, Save } from 'lucide-react';

export default function AgentCustomizationStudio() {
  const [step, setStep] = useState(0);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    role: 'general',
    autonomyLevel: 50,
    ethicsStrictness: 60,
    communicationStyle: 'balanced',
    integrationPriorities: ['financial', 'market-data'],
    alertThresholds: {
      priceChange: 5,
      volumeChange: 150,
      sentiment: 0.3,
      riskScore: 70,
    },
  });

  const steps = [
    { id: 'name', label: 'Agent Name & Role', icon: Brain },
    { id: 'autonomy', label: 'Autonomy Settings', icon: Sliders },
    { id: 'ethics', label: 'Ethics & Values', icon: Wand2 },
    { id: 'communication', label: 'Communication Style', icon: MessageSquare },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'alerts', label: 'Alert Thresholds', icon: Settings },
  ];

  const roles = [
    { id: 'general', name: 'General Assistant', desc: 'Well-rounded across all domains' },
    { id: 'trader', name: 'Trading Specialist', desc: 'Focus on market analysis & trading' },
    { id: 'advisor', name: 'Financial Advisor', desc: 'Specializes in planning & coaching' },
    { id: 'analyst', name: 'Data Analyst', desc: 'Deep data processing & insights' },
  ];

  const communicationStyles = [
    { id: 'formal', name: 'Formal', desc: 'Professional, structured language' },
    { id: 'balanced', name: 'Balanced', desc: 'Clear but personable' },
    { id: 'casual', name: 'Casual', desc: 'Friendly, conversational tone' },
    { id: 'concise', name: 'Concise', desc: 'Brief, facts-only responses' },
  ];

  const integrations = [
    { id: 'financial', name: 'Financial Markets', priority: true },
    { id: 'market-data', name: 'Real-Time Data', priority: true },
    { id: 'news', name: 'News & Sentiment', priority: false },
    { id: 'social', name: 'Social Media', priority: false },
    { id: 'calendar', name: 'Calendar/Scheduling', priority: false },
  ];

  const handleSave = async () => {
    console.log('Saving agent config:', agentConfig);
    // Would save to database
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Agent Creation Studio
          </h1>
          <p className="text-white/60">Customize your AI agent with deep personality and behavior controls</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setStep(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all ${
                  step === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{s.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8"
          >
            {/* Step 0: Name & Role */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Name Your Agent</h2>
                <div>
                  <label className="block text-white font-semibold mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentConfig.name}
                    onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                    placeholder="e.g., Alex, Sentinel, Phoenix..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Select Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <motion.button
                        key={role.id}
                        whileHover={{ y: -2 }}
                        onClick={() => setAgentConfig({ ...agentConfig, role: role.id })}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          agentConfig.role === role.id
                            ? 'bg-cyan-500/20 border-cyan-400'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <p className="text-white font-bold text-sm">{role.name}</p>
                        <p className="text-white/60 text-xs mt-1">{role.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Autonomy */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Agent Autonomy Level</h2>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold">Autonomy</label>
                    <span className="text-cyan-400 font-bold">{agentConfig.autonomyLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={agentConfig.autonomyLevel}
                    onChange={(e) => setAgentConfig({ ...agentConfig, autonomyLevel: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/80 text-sm">
                      {agentConfig.autonomyLevel < 25 && '🔒 Supervised - All actions require approval'}
                      {agentConfig.autonomyLevel >= 25 && agentConfig.autonomyLevel < 50 && '⚙️ Semi-Supervised - Limited autonomy with oversight'}
                      {agentConfig.autonomyLevel >= 50 && agentConfig.autonomyLevel < 75 && '🎯 Semi-Autonomous - Mostly independent with safeguards'}
                      {agentConfig.autonomyLevel >= 75 && '⚡ Fully Autonomous - Independent with audit trails'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Approval Required For', value: agentConfig.autonomyLevel < 50 ? 'All trades >$50k' : 'Trades >$250k' },
                    { label: 'Decision Confidence Threshold', value: agentConfig.autonomyLevel < 50 ? '95%' : '80%' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/60 text-sm">{item.label}</p>
                      <p className="text-cyan-400 font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Ethics */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Ethics & Values</h2>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold">Ethics Strictness</label>
                    <span className="text-cyan-400 font-bold">{agentConfig.ethicsStrictness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={agentConfig.ethicsStrictness}
                    onChange={(e) => setAgentConfig({ ...agentConfig, ethicsStrictness: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/80 text-sm">
                      {agentConfig.ethicsStrictness > 70 ? '⚖️ Strict - Prioritizes caution & compliance over efficiency' : agentConfig.ethicsStrictness > 40 ? '⚖️ Balanced - Equal weight to ethics & efficiency' : '⚡ Efficiency-Focused - Prioritizes results within guidelines'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {['Transparency in decisions', 'Conflict avoidance', 'Compliance over profit', 'User privacy protection'].map((guideline, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-white text-sm">{guideline}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Communication */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Communication Style</h2>
                <div className="grid grid-cols-2 gap-3">
                  {communicationStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ y: -2 }}
                      onClick={() => setAgentConfig({ ...agentConfig, communicationStyle: style.id })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        agentConfig.communicationStyle === style.id
                          ? 'bg-cyan-500/20 border-cyan-400'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <p className="text-white font-bold">{style.name}</p>
                      <p className="text-white/60 text-xs mt-1">{style.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Integrations */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Integration Preferences</h2>
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <label key={integration.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                      <input
                        type="checkbox"
                        defaultChecked={integration.priority}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (!agentConfig.integrationPriorities.includes(integration.id)) {
                              setAgentConfig({
                                ...agentConfig,
                                integrationPriorities: [...agentConfig.integrationPriorities, integration.id],
                              });
                            }
                          } else {
                            setAgentConfig({
                              ...agentConfig,
                              integrationPriorities: agentConfig.integrationPriorities.filter(i => i !== integration.id),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-white text-sm flex-1">{integration.name}</span>
                      {integration.priority && <span className="text-cyan-400 text-xs font-semibold">Priority</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Alert Thresholds */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Alert Thresholds</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Price Change Alert (%)', key: 'priceChange', min: 1, max: 20 },
                    { label: 'Volume Change Alert (%)', key: 'volumeChange', min: 50, max: 300 },
                    { label: 'Sentiment Threshold', key: 'sentiment', min: 0.1, max: 1, step: 0.1 },
                    { label: 'Risk Score Alert', key: 'riskScore', min: 30, max: 100 },
                  ].map((threshold) => (
                    <div key={threshold.key} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white font-semibold text-sm">{threshold.label}</label>
                        <span className="text-cyan-400 font-bold">{agentConfig.alertThresholds[threshold.key]}</span>
                      </div>
                      <input
                        type="range"
                        min={threshold.min}
                        max={threshold.max}
                        step={threshold.step || 1}
                        value={agentConfig.alertThresholds[threshold.key]}
                        onChange={(e) => setAgentConfig({
                          ...agentConfig,
                          alertThresholds: { ...agentConfig.alertThresholds, [threshold.key]: parseFloat(e.target.value) },
                        })}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50"
          >
            Previous
          </motion.button>
          {step < steps.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(step + 1)}
              className="flex-1 px-6 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Agent
            </motion.button>
          )}
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
        >
          <h3 className="text-white font-bold mb-3">Agent Preview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-white/60">Name</p><p className="text-white font-bold">{agentConfig.name || '(Enter name)'}</p></div>
            <div><p className="text-white/60">Role</p><p className="text-white font-bold capitalize">{agentConfig.role}</p></div>
            <div><p className="text-white/60">Autonomy</p><p className="text-cyan-400 font-bold">{agentConfig.autonomyLevel}%</p></div>
            <div><p className="text-white/60">Ethics Strictness</p><p className="text-cyan-400 font-bold">{agentConfig.ethicsStrictness}%</p></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}