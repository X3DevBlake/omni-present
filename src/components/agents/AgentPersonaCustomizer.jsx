import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, MessageSquare, Settings } from 'lucide-react';

export default function AgentPersonaCustomizer() {
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [personaSettings, setPersonaSettings] = useState({
    name: 'Alex',
    personality: 'analytical',
    theme: 'cyan',
    responseStyle: 'detailed',
    emotionalTone: 'professional',
    customGreeting: 'Hello! How can I assist you today?',
  });

  const agents = [
    { id: 1, name: 'Portfolio Manager', currentPersona: 'Analytical' },
    { id: 2, name: 'Budget Coach', currentPersona: 'Supportive' },
    { id: 3, name: 'Market Analyst', currentPersona: 'Informative' },
  ];

  const personalityTypes = [
    { value: 'analytical', label: 'Analytical', desc: 'Data-driven, logical, precise' },
    { value: 'supportive', label: 'Supportive', desc: 'Empathetic, encouraging, warm' },
    { value: 'concise', label: 'Concise', desc: 'Direct, efficient, brief' },
    { value: 'creative', label: 'Creative', desc: 'Innovative, exploratory, dynamic' },
  ];

  const themes = [
    { value: 'cyan', label: 'Cyan', color: 'from-cyan-500 to-cyan-600' },
    { value: 'purple', label: 'Purple', color: 'from-purple-500 to-purple-600' },
    { value: 'green', label: 'Green', color: 'from-green-500 to-green-600' },
    { value: 'orange', label: 'Orange', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {agents.map((agent, idx) => (
          <motion.button
            key={agent.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedAgent(idx)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              selectedAgent === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            <User className="w-4 h-4" />
            {agent.name}
          </motion.button>
        ))}
      </div>

      {/* Persona Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Agent Name */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-white font-semibold mb-2">Agent Name</label>
          <input
            type="text"
            value={personaSettings.name}
            onChange={(e) => setPersonaSettings({ ...personaSettings, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Personality Type */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-white font-semibold mb-3">Personality Type</label>
          <div className="grid grid-cols-2 gap-3">
            {personalityTypes.map(type => (
              <motion.button
                key={type.value}
                whileHover={{ y: -2 }}
                onClick={() => setPersonaSettings({ ...personaSettings, personality: type.value })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  personaSettings.personality === type.value
                    ? 'bg-cyan-500/20 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <p className="text-white font-semibold text-sm">{type.label}</p>
                <p className="text-white/60 text-xs mt-1">{type.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {themes.map(theme => (
              <motion.button
                key={theme.value}
                whileHover={{ scale: 1.05 }}
                onClick={() => setPersonaSettings({ ...personaSettings, theme: theme.value })}
                className={`p-4 rounded-lg border transition-all ${
                  personaSettings.theme === theme.value
                    ? 'border-white scale-105'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className={`w-full h-8 rounded bg-gradient-to-br ${theme.color} mb-2`} />
                <p className="text-white text-xs font-semibold">{theme.label}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Response Style */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Response Style
          </label>
          <select
            value={personaSettings.responseStyle}
            onChange={(e) => setPersonaSettings({ ...personaSettings, responseStyle: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="concise">Concise (brief answers)</option>
            <option value="detailed">Detailed (thorough explanations)</option>
            <option value="balanced">Balanced (mix of both)</option>
          </select>
        </div>

        {/* Custom Greeting */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-white font-semibold mb-2">Custom Greeting</label>
          <input
            type="text"
            value={personaSettings.customGreeting}
            onChange={(e) => setPersonaSettings({ ...personaSettings, customGreeting: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            placeholder="Customize the greeting message..."
          />
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br from-${personaSettings.theme}-500/10 to-${personaSettings.theme}-600/10 border border-${personaSettings.theme}-400/20 rounded-lg p-6`}
        >
          <p className="text-white/60 text-sm mb-2">Preview</p>
          <p className="text-white font-bold text-lg mb-2">{personaSettings.name}</p>
          <p className="text-white/80">{personaSettings.customGreeting}</p>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="w-full px-6 py-3 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30 transition-all font-semibold"
        >
          Save Persona
        </motion.button>
      </motion.div>
    </div>
  );
}